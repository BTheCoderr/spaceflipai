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
 * Removes every storage object under users/{userId}/inputs for the active user.
 * Returns true when a (possibly partial) failure occurred so the UI can warn.
 */
async function deleteOwnStorageObjects(
  client: NonNullable<ReturnType<typeof getSupabaseClient>>,
  userId: string
): Promise<boolean> {
  const prefix = `users/${userId}/inputs`;
  let warned = false;
  try {
    // Page through the folder so large workspaces are fully cleared.
    // 100 per page is plenty for the MVP; loop guards against more.
    for (let page = 0; page < 50; page += 1) {
      const { data: files, error: listError } = await client.storage
        .from(DESIGN_INPUTS_BUCKET)
        .list(prefix, { limit: 100, offset: page * 100 });

      if (listError) {
        warned = true;
        break;
      }
      if (!files || files.length === 0) {
        break;
      }

      const paths = files.map((file) => `${prefix}/${file.name}`);
      const { error: removeError } = await client.storage
        .from(DESIGN_INPUTS_BUCKET)
        .remove(paths);
      if (removeError) {
        warned = true;
      }

      if (files.length < 100) {
        break;
      }
    }
  } catch {
    warned = true;
  }
  return warned;
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
