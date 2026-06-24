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

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const FUNCTION_VERSION = 'phase18-delete-workspace-v2';
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
  supabase: ReturnType<typeof createClient>,
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
  supabase: ReturnType<typeof createClient>,
  prefix: string,
  result: { warned: boolean },
  depth: number
): Promise<void> {
  if (depth > 6) {
    result.warned = true;
    return;
  }

  for (let page = 0; page < 50; page += 1) {
    const { data: entries, error: listError } = await supabase.storage
      .from(DESIGN_INPUTS_BUCKET)
      .list(prefix, { limit: 100, offset: page * 100 });

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
      if (removeError) result.warned = true;
    }

    for (const folder of folders) {
      await deleteStoragePrefix(supabase, folder, result, depth + 1);
    }

    if (entries.length < 100) return;
  }
}

async function deleteOwnStorage(
  supabase: ReturnType<typeof createClient>,
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

    // Best-effort: remove the anonymous auth user. Non-fatal if it fails.
    try {
      await supabase.auth.admin.deleteUser(userId);
    } catch (adminError) {
      console.warn(
        '[delete-user-workspace] auth user delete failed (non-fatal):',
        adminError instanceof Error ? adminError.name : 'unknown'
      );
    }

    console.log('[delete-user-workspace] completed', FUNCTION_VERSION, { storageWarning });
    return jsonResponse({ ok: true, storageWarning, functionVersion: FUNCTION_VERSION });
  } catch (error) {
    console.error(
      '[delete-user-workspace] Unexpected error:',
      error instanceof Error ? error.message : 'unknown'
    );
    return jsonResponse({ ok: false, error: 'Workspace deletion failed' }, 500);
  }
});
