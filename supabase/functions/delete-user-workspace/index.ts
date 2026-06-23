// SpaceFlip Pro — delete-user-workspace Edge Function
// Deletes the authenticated user's app data (design_projects, generation_jobs,
// storage objects under users/{uid}/) and the Supabase Auth user.
//
// This file is self-contained and can be pasted directly into the Supabase
// Dashboard (Edge Functions → New function → delete-user-workspace).
//
// Security:
//   * Validates the caller's session JWT (auth.getUser).
//   * Only ever touches rows/objects owned by that uid.
//   * Never logs tokens, keys, or auth headers.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const FUNCTION_VERSION = 'phase17-delete-workspace-v1';
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

async function deleteOwnStorage(
  supabase: ReturnType<typeof createClient>,
  userId: string
): Promise<boolean> {
  const prefix = `users/${userId}/inputs`;
  let warned = false;
  try {
    for (let page = 0; page < 50; page += 1) {
      const { data: files, error: listError } = await supabase.storage
        .from(DESIGN_INPUTS_BUCKET)
        .list(prefix, { limit: 100, offset: page * 100 });

      if (listError) {
        warned = true;
        break;
      }
      if (!files || files.length === 0) break;

      const paths = files.map((file) => `${prefix}/${file.name}`);
      const { error: removeError } = await supabase.storage
        .from(DESIGN_INPUTS_BUCKET)
        .remove(paths);
      if (removeError) warned = true;

      if (files.length < 100) break;
    }
  } catch {
    warned = true;
  }
  return warned;
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
