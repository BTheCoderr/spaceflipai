// @ts-nocheck — Deno Edge Function (esm.sh imports + Deno global). The app's
// tsconfig excludes supabase/functions; this directive stops the editor's
// standalone TS server from flagging Deno-only syntax. Validated via Supabase.
// SpaceFlip Pro — delete-user-workspace Edge Function
// Deletes the authenticated user's app data (design_projects, generation_jobs,
// all storage objects under users/{uid}/ — inputs and generated outputs) and
// the Supabase Auth user.
//
// This file is self-contained and can be pasted directly into the Supabase
// Dashboard (Edge Functions → New function → delete-user-workspace).
//
// Security:
//   * Validates the caller's session JWT (auth.getUser).
//   * Only ever touches rows/objects owned by that uid.
//   * Never logs tokens, keys, or auth headers.

import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const FUNCTION_VERSION = 'release-delete-workspace-v3';
const DESIGN_INPUTS_BUCKET = 'design-inputs';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type DeleteResponse = {
  ok: boolean;
  storageWarning?: boolean;
  error?: string;
  functionVersion?: string;
};

function jsonResponse(body: DeleteResponse, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function getAuthenticatedUserId(
  supabase: SupabaseClient<any>,
  authHeader: string | null
): Promise<string | null> {
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user.id;
  } catch {
    return null;
  }
}

// Recursively deletes everything under users/{uid} — both inputs/... and
// outputs/{jobId}/concept.png.
async function deleteStoragePrefix(
  supabase: SupabaseClient<any>,
  prefix: string,
  result: { warned: boolean },
  depth: number
): Promise<void> {
  if (depth > 6) {
    result.warned = true;
    return;
  }

  // Always read page zero: deleting files shifts subsequent pages, so using
  // offset: page * 100 would skip objects when a user has more than 100.
  for (let batch = 0; batch < 50; batch += 1) {
    const { data: entries, error: listError } = await supabase.storage
      .from(DESIGN_INPUTS_BUCKET)
      .list(prefix, { limit: 100, offset: 0 });

    if (listError) {
      result.warned = true;
      return;
    }
    if (!entries || entries.length === 0) return;

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
      const { error: removeError } = await supabase.storage
        .from(DESIGN_INPUTS_BUCKET)
        .remove(filePaths);
      if (removeError) {
        result.warned = true;
        return;
      }
    }

    for (const folder of folders) {
      await deleteStoragePrefix(supabase, folder, result, depth + 1);
      if (result.warned) return;
    }

    // Continue until a fresh empty listing confirms cleanup, even if the
    // previous page was shorter than 100 entries.
    // The bounded loop fails closed if the provider never empties.
  }
  // A bounded cleanup must not claim success while objects could remain.
  result.warned = true;
}

async function deleteOwnStorage(
  supabase: SupabaseClient<any>,
  userId: string
): Promise<boolean> {
  const result = { warned: false };
  try {
    await deleteStoragePrefix(supabase, `users/${userId}`, result, 0);
  } catch {
    result.warned = true;
  }
  return result.warned;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ ok: false, error: 'Method not allowed' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[delete-user-workspace] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return jsonResponse({ ok: false, error: 'Server configuration error' }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const userId = await getAuthenticatedUserId(supabase, req.headers.get('Authorization'));
  if (!userId) {
    return jsonResponse({ ok: false, error: 'Not authenticated' }, 401);
  }

  try {
    // Delete owned rows. design_projects first (it references generation_jobs).
    const { error: projectsError } = await supabase
      .from('design_projects')
      .delete()
      .eq('user_id', userId);
    if (projectsError) {
      console.error('[delete-user-workspace] design_projects delete failed:', projectsError.message);
      return jsonResponse({ ok: false, error: 'Could not delete projects' }, 500);
    }

    const { error: jobsError } = await supabase
      .from('generation_jobs')
      .delete()
      .eq('user_id', userId);
    if (jobsError) {
      console.error('[delete-user-workspace] generation_jobs delete failed:', jobsError.message);
      return jsonResponse({ ok: false, error: 'Could not delete generation jobs' }, 500);
    }

    const storageWarning = await deleteOwnStorage(supabase, userId);
    if (storageWarning) {
      // Leave the identity active for a retry instead of losing access to
      // personal photos that may still exist in private Storage.
      console.warn('[delete-user-workspace] storage cleanup incomplete');
      return jsonResponse({ ok: false, error: 'Storage cleanup incomplete. Please retry.' }, 503);
    }

    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) {
      console.warn('[delete-user-workspace] auth identity deletion failed');
      return jsonResponse({ ok: false, error: 'Could not remove auth identity' }, 500);
    }

    console.log('[delete-user-workspace] completed', FUNCTION_VERSION);
    return jsonResponse({ ok: true, storageWarning: false, functionVersion: FUNCTION_VERSION });
  } catch (error) {
    console.error(
      '[delete-user-workspace] Unexpected error:',
      error instanceof Error ? error.message : 'unknown'
    );
    return jsonResponse({ ok: false, error: 'Workspace deletion failed' }, 500);
  }
});
