import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { generateUpgradeImage, generateUpgradePlanText } from '../_shared/aiProvider.ts';
import { buildUpgradePrompt } from '../_shared/promptBuilder.ts';
import type {
  GenerateUpgradePlanRequest,
  GenerateUpgradePlanResponse,
  GenerationJobRecord,
} from '../_shared/types.ts';

const DEMO_USER_ID = 'demo-user';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: GenerateUpgradePlanResponse, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Resolves the authenticated user id from the incoming session JWT.
 * Returns null for anon-key requests or invalid tokens. Never logs the token.
 */
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
    console.error('[generate-upgrade-plan] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return jsonResponse({ ok: false, error: 'Server configuration error' }, 500);
  }

  let body: GenerateUpgradePlanRequest;
  try {
    body = (await req.json()) as GenerateUpgradePlanRequest;
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid JSON body' }, 400);
  }

  const jobId = body.jobId?.trim();
  const userId = body.userId?.trim() || DEMO_USER_ID;

  if (!jobId) {
    return jsonResponse({ ok: false, error: 'jobId is required' }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: job, error: fetchError } = await supabase
    .from('generation_jobs')
    .select('*')
    .eq('id', jobId)
    .maybeSingle();

  if (fetchError) {
    console.error('[generate-upgrade-plan] Fetch job failed:', fetchError.message);
    return jsonResponse({ ok: false, error: 'Could not load generation job' }, 500);
  }

  if (!job) {
    return jsonResponse({ ok: false, error: 'Generation job not found' }, 404);
  }

  const record = job as GenerationJobRecord;

  // Prefer the verified JWT user id over any client-provided body userId.
  const authUserId = await getAuthenticatedUserId(supabase, req.headers.get('Authorization'));
  const effectiveUserId = authUserId ?? userId;
  console.log('[generate-upgrade-plan] auth resolved:', authUserId ? 'jwt' : 'fallback-body');

  if (record.user_id !== effectiveUserId) {
    return jsonResponse({ ok: false, error: 'User does not match job' }, 403);
  }

  const { error: processingError } = await supabase
    .from('generation_jobs')
    .update({ status: 'processing', error_message: null })
    .eq('id', jobId);

  if (processingError) {
    console.error('[generate-upgrade-plan] Update processing failed:', processingError.message);
    return jsonResponse({ ok: false, error: 'Could not update job status' }, 500);
  }

  try {
    const prompt = buildUpgradePrompt(record);
    const inputImageUrl = record.input_public_url ?? record.input_image_uri ?? '';

    const planResult = await generateUpgradePlanText({
      projectType: record.project_type,
      goal: record.goal,
      budgetRange: record.budget_range,
      notes: record.notes,
      inputPublicUrl: inputImageUrl,
      prompt,
    });

    if (planResult.source === 'mock') {
      if (!Deno.env.get('GEMINI_API_KEY') && !Deno.env.get('GROQ_API_KEY')) {
        console.warn('[generate-upgrade-plan] GEMINI_API_KEY and GROQ_API_KEY missing — using mock plan text');
      } else {
        console.warn('[generate-upgrade-plan] AI plan generation failed — using mock plan text');
      }
    }

    const { resultImageUrl } = await generateUpgradeImage({
      imageUrl: inputImageUrl,
      prompt,
      projectType: record.project_type,
    });

    const { error: completeError } = await supabase
      .from('generation_jobs')
      .update({
        status: 'completed',
        result_image_url: resultImageUrl,
        result_payload: planResult.payload,
        plan_source: planResult.source,
        ai_provider: planResult.provider,
        estimated_cost_cents: 0,
        error_message: null,
      })
      .eq('id', jobId);

    if (completeError) {
      console.error('[generate-upgrade-plan] Complete job failed:', completeError.message);
      return jsonResponse({ ok: false, error: 'Could not save generation result' }, 500);
    }

    const promptPreview = prompt.length > 280 ? `${prompt.slice(0, 277)}...` : prompt;

    return jsonResponse({
      ok: true,
      jobId,
      resultImageUrl,
      resultPayload: planResult.payload,
      planSource: planResult.source,
      aiProvider: planResult.provider,
      estimatedCostCents: 0,
      promptPreview,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Generation failed';

    await supabase
      .from('generation_jobs')
      .update({ status: 'failed', error_message: message })
      .eq('id', jobId);

    console.error('[generate-upgrade-plan] Generation failed:', message);
    return jsonResponse({ ok: false, error: message }, 500);
  }
});
