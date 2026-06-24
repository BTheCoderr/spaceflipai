import { DESIGN_INPUTS_BUCKET } from './storage';
import { getActiveUserId, getSupabaseClient, hasSupabaseConfig } from './supabase';

export type DeleteWorkspaceResult = {
  ok: boolean;
  /** Which path performed the deletion. */
  method: 'edge' | 'client' | 'local';
  /** True when some storage objects may not have been removed. */
  storageWarning?: boolean;
};

export class WorkspaceDeletionError extends Error {
  constructor(message = 'workspace_delete_failed') {
    super(message);
    this.name = 'WorkspaceDeletionError';
  }
}

/**
 * Recursively removes every storage object under users/{userId} for the active
 * user — covering both inputs/... and outputs/{jobId}/concept.png. Returns true
 * when a (possibly partial) failure occurred so the UI can warn.
 */
async function deleteOwnStorageObjects(
  client: NonNullable<ReturnType<typeof getSupabaseClient>>,
  userId: string
): Promise<boolean> {
  const result = { warned: false };
  try {
    await deleteStoragePrefix(client, `users/${userId}`, result, 0);
  } catch {
    result.warned = true;
  }
  return result.warned;
}

async function deleteStoragePrefix(
  client: NonNullable<ReturnType<typeof getSupabaseClient>>,
  prefix: string,
  result: { warned: boolean },
  depth: number
): Promise<void> {
  // Guard against unexpectedly deep trees.
  if (depth > 6) {
    result.warned = true;
    return;
  }

  for (let page = 0; page < 50; page += 1) {
    const { data: entries, error: listError } = await client.storage
      .from(DESIGN_INPUTS_BUCKET)
      .list(prefix, { limit: 100, offset: page * 100 });

    if (listError) {
      result.warned = true;
      return;
    }
    if (!entries || entries.length === 0) {
      return;
    }

    // Supabase returns folder placeholders with a null id; files have an id.
    const filePaths: string[] = [];
    const folders: string[] = [];
    for (const entry of entries) {
      if (entry.id) {
        filePaths.push(`${prefix}/${entry.name}`);
      } else {
        folders.push(`${prefix}/${entry.name}`);
      }
    }

    if (filePaths.length > 0) {
      const { error: removeError } = await client.storage
        .from(DESIGN_INPUTS_BUCKET)
        .remove(filePaths);
      if (removeError) {
        result.warned = true;
      }
    }

    for (const folder of folders) {
      await deleteStoragePrefix(client, folder, result, depth + 1);
    }

    if (entries.length < 100) {
      return;
    }
  }
}

/**
 * Deletes the current guest workspace's data.
 *
 * Strategy:
 *  1. Prefer the `delete-user-workspace` Edge Function (validates the JWT and,
 *     when deployed, can also remove the Supabase Auth user with the service role).
 *  2. Fall back to RLS-safe client-side deletes scoped to the active auth uid.
 *
 * Never throws for partial storage failures — it reports `storageWarning` so the
 * caller can show a friendly message. Throws WorkspaceDeletionError only when the
 * database rows could not be deleted.
 */
export async function deleteCurrentUserWorkspace(): Promise<DeleteWorkspaceResult> {
  const client = getSupabaseClient();
  const userId = getActiveUserId();

  // Nothing persisted remotely — local/unconfigured mode.
  if (!client || !hasSupabaseConfig() || !userId) {
    return { ok: true, method: 'local' };
  }

  // 1. Preferred: Edge Function (also deletes the auth user when deployed).
  try {
    const { data, error } = await client.functions.invoke<{
      ok?: boolean;
      storageWarning?: boolean;
    }>('delete-user-workspace', { body: {} });
    if (!error && data?.ok) {
      return { ok: true, method: 'edge', storageWarning: Boolean(data.storageWarning) };
    }
  } catch {
    // Function not deployed / unreachable — fall through to client-side deletion.
  }

  // 2. Fallback: RLS-safe client-side deletion (scoped to user_id = auth uid).
  const { error: projectsError } = await client
    .from('design_projects')
    .delete()
    .eq('user_id', userId);

  const { error: jobsError } = await client
    .from('generation_jobs')
    .delete()
    .eq('user_id', userId);

  if (projectsError || jobsError) {
    // Do not log raw error objects; message only.
    console.warn('[SpaceFlip Pro][Account] Workspace row deletion failed:', {
      projects: projectsError?.message ?? null,
      jobs: jobsError?.message ?? null,
    });
    throw new WorkspaceDeletionError();
  }

  const storageWarning = await deleteOwnStorageObjects(client, userId);

  return { ok: true, method: 'client', storageWarning };
}
