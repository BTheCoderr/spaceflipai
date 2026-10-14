import { getCurrentSession, getSupabaseClient, hasSupabaseConfig } from './supabase';

export type DeleteWorkspaceResult = {
  ok: boolean;
  method: 'edge' | 'local';
  storageWarning?: boolean;
};

export class WorkspaceDeletionError extends Error {
  constructor(message = 'We could not delete the guest workspace. Please try again or contact support.') {
    super(message);
    this.name = 'WorkspaceDeletionError';
  }
}

/**
 * Production deletion is server-only. The trusted Edge Function must remove
 * projects, generation history, private photos, and the auth user before
 * reporting success. Never silently substitute a partial client-side cleanup:
 * that would leave the account behind while telling the user it was deleted.
 */
export async function deleteCurrentUserWorkspace(): Promise<DeleteWorkspaceResult> {
  if (!hasSupabaseConfig()) {
    // Development-only local state has no remote identity or stored content.
    return { ok: true, method: 'local' };
  }

  const client = getSupabaseClient();
  const session = await getCurrentSession();
  if (!client || !session?.user?.id) {
    throw new WorkspaceDeletionError('Your session expired. Sign in again to delete this workspace.');
  }

  try {
    const { data, error } = await client.functions.invoke<{
      ok?: boolean;
      storageWarning?: boolean;
    }>('delete-user-workspace', { body: {} });
    if (error || !data?.ok || data.storageWarning) {
      throw new WorkspaceDeletionError();
    }
    return { ok: true, method: 'edge', storageWarning: false };
  } catch {
    throw new WorkspaceDeletionError();
  }
}
