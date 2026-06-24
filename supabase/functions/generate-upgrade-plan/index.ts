import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { generateUpgradePlanText } from '../_shared/aiProvider.ts';
import { buildUpgradePrompt } from '../_shared/promptBuilder.ts';
import { generateConceptImage, isImageGenerationEnabled } from '../_shared/imageProvider.ts';
import type {
  GenerateUpgradePlanRequest,
  GenerateUpgradePlanResponse,
  GenerationJobRecord,
} from '../_shared/types.ts';

const DESIGN_INPUTS_BUCKET = 'design-inputs';

function maxImagesPerUserPerDay(): number {
  const raw = Number(Deno.env.get('MAX_IMAGE_GENERATIONS_PER_USER_PER_DAY') ?? '5');
  return Number.isFinite(raw) && raw > 0 ? raw : 5;
}

type ConceptImageOutcome = {
  resultImageUrl: string;
  conceptImageUrl: string | null;
  imageProvider: string;
  imageGenerationStatus: string;
  imageGenerationError: string | null;
  estimatedImageCostCents: number;
};

/**
 * Attempts real AI concept image generation when enabled. When disabled or on
 * any failure, returns the user's ORIGINAL property photo as the visual — never
 * a stock/mock image — with concept_image_url null.
 */
async function maybeGenerateConceptImage(
  supabase: ReturnType<typeof createClient>,
  record: GenerationJobRecord,
  jobId: string,
  originalImageUrl: string,
  planSummary: string | null
): Promise<ConceptImageOutcome> {
  // Default (no real concept image): show the original property photo.
  const fallback: ConceptImageOutcome = {
    resultImageUrl: originalImageUrl,
    conceptImageUrl: null,
    imageProvider: 'none',
    imageGenerationStatus: 'not_generated',
    imageGenerationError: null,
    estimatedImageCostCents: 0,
  };

  if (!isImageGenerationEnabled()) {
    return { ...fallback, imageGenerationStatus: 'disabled' };
  }

  // Cost guard: cap real image generations per user per day.
  try {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from('generation_jobs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', record.user_id)
      .eq('image_generation_status', 'completed')
      .gte('created_at', since.toISOString());
    if (typeof count === 'number' && count >= maxImagesPerUserPerDay()) {
      console.warn('[generate-upgrade-plan] Image generation daily limit reached for user');
      return { ...fallback, imageGenerationStatus: 'skipped_limit' };
    }
  } catch {
    // If the guard query fails, proceed (single image per job is still bounded).
  }

  const inputImageUrl = record.input_public_url ?? record.input_image_uri ?? '';
  const concept = await generateConceptImage({
    projectType: record.project_type,
    goal: record.goal,
    budgetRange: record.budget_range,
    notes: record.notes,
    planSummary,
    inputImageUrl,
  });

  if (concept.status === 'disabled') {
    return { ...fallback, imageGenerationStatus: 'disabled' };
  }

  if (concept.status === 'failed') {
    // Do not expose provider failure to the user. Keep the original photo as the
    // visual and record the reason only in the internal debug column.
    return {
      ...fallback,
      imageProvider: 'none',
      imageGenerationStatus: 'failed',
      imageGenerationError: concept.error,
      estimatedImageCostCents: concept.costCents,
    };
  }

  // Store the generated concept under users/{uid}/outputs/{jobId}/concept.png
  const path = `users/${record.user_id}/outputs/${jobId}/concept.png`;
  const { error: uploadError } = await supabase.storage
    .from(DESIGN_INPUTS_BUCKET)
    .upload(path, concept.bytes, { contentType: concept.contentType, upsert: true });

  if (uploadError) {
    console.warn('[generate-upgrade-plan] Concept image upload failed:', uploadError.message);
    return {
      ...fallback,
      imageProvider: 'none',
      imageGenerationStatus: 'failed',
      imageGenerationError: 'storage_upload_failed',
      estimatedImageCostCents: concept.costCents,
    };
  }

  const { data: pub } = supabase.storage.from(DESIGN_INPUTS_BUCKET).getPublicUrl(path);
  return {
    resultImageUrl: pub.publicUrl,
    conceptImageUrl: pub.publicUrl,
    imageProvider: concept.provider,
    imageGenerationStatus: 'completed',
    imageGenerationError: null,
    estimatedImageCostCents: concept.costCents,
  };
}

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

    // Real AI concept image only when enabled; otherwise the user's original
    // property photo is used as the visual (never a stock/mock image).
    const originalImageUrl = record.input_public_url ?? record.input_image_uri ?? inputImageUrl ?? '';
    const image = await maybeGenerateConceptImage(
      supabase,
      record,
      jobId,
      originalImageUrl,
      planResult.payload?.upgradeSummary ?? null
    );

    const { error: completeError } = await supabase
      .from('generation_jobs')
      .update({
        status: 'completed',
        result_image_url: image.resultImageUrl,
        result_payload: planResult.payload,
        plan_source: planResult.source,
        ai_provider: planResult.provider,
        estimated_cost_cents: 0,
        concept_image_url: image.conceptImageUrl,
        image_provider: image.imageProvider,
        image_generation_status: image.imageGenerationStatus,
        image_generation_error: image.imageGenerationError,
        estimated_image_cost_cents: image.estimatedImageCostCents,
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
      resultImageUrl: image.resultImageUrl,
      resultPayload: planResult.payload,
      planSource: planResult.source,
      aiProvider: planResult.provider,
      estimatedCostCents: 0,
      promptPreview,
      conceptImageUrl: image.conceptImageUrl ?? undefined,
      imageProvider: image.imageProvider,
      imageGenerationStatus: image.imageGenerationStatus,
      estimatedImageCostCents: image.estimatedImageCostCents,
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
