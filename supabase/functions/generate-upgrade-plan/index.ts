import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { generateUpgradePlanText } from '../_shared/aiProvider.ts';
import { buildUpgradePrompt } from '../_shared/promptBuilder.ts';
import { generateConceptImage, isImageGenerationEnabled } from '../_shared/imageProvider.ts';
import type {
  GenerateUpgradePlanRequest,
  GenerateUpgradePlanResponse,
  GenerateUpgradePlanTextResult,
  GenerationJobRecord,
} from '../_shared/types.ts';

const DESIGN_INPUTS_BUCKET = 'design-inputs';

function maxImagesPerUserPerDay(): number {
  const raw = Number(Deno.env.get('MAX_IMAGE_GENERATIONS_PER_USER_PER_DAY') ?? '5');
  return Number.isFinite(raw) && raw > 0 ? raw : 5;
}

function maxImagesPerJob(): number {
  const raw = Number(Deno.env.get('MAX_IMAGE_GENERATIONS_PER_JOB') ?? '3');
  return Number.isFinite(raw) && raw > 0 ? raw : 3;
}

type ConceptImageOutcome = {
  resultImageUrl: string;
  conceptImageUrl: string | null;
  imageProvider: string;
  imageGenerationStatus: string;
  imageGenerationError: string | null;
  estimatedImageCostCents: number;
  imageGenerationCount: number;
};

async function resolveProviderInputImageUrl(
  supabase: SupabaseClient<any>,
  record: GenerationJobRecord
): Promise<string> {
  const fallback = record.input_public_url ?? record.input_image_uri ?? '';
  if (!record.input_storage_path) {
    return fallback;
  }

  const { data, error } = await supabase.storage
    .from(DESIGN_INPUTS_BUCKET)
    .createSignedUrl(record.input_storage_path, 10 * 60);

  if (error || !data?.signedUrl) {
    console.warn('[generate-upgrade-plan] Could not sign provider input image:', {
      message: error?.message ?? 'No signed URL returned',
    });
    return fallback;
  }

  return data.signedUrl;
}

/**
 * Attempts real AI concept image generation when enabled. When disabled or on
 * any failure, returns the user's ORIGINAL property photo as the visual — never
 * a stock/mock image — with concept_image_url null.
 */
async function maybeGenerateConceptImage(
  supabase: SupabaseClient<any>,
  record: GenerationJobRecord,
  jobId: string,
  originalImageUrl: string,
  providerInputImageUrl: string,
  planSummary: string | null
): Promise<ConceptImageOutcome> {
  const currentGenerationCount = Math.max(0, Number(record.image_generation_count ?? 0));

  // Default (no real concept image): show the original property photo.
  const fallback: ConceptImageOutcome = {
    resultImageUrl: originalImageUrl,
    conceptImageUrl: null,
    imageProvider: 'none',
    imageGenerationStatus: 'not_generated',
    imageGenerationError: null,
    estimatedImageCostCents: 0,
    imageGenerationCount: currentGenerationCount,
  };

  if (currentGenerationCount >= maxImagesPerJob()) {
    return { ...fallback, imageGenerationStatus: 'skipped_job_limit' };
  }

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

  const inputImageUrl =
    providerInputImageUrl || record.input_public_url || record.input_image_uri || '';
  const concept = await generateConceptImage({
    projectType: record.project_type,
    goal: record.goal,
    budgetRange: record.budget_range,
    notes: record.notes,
    planSummary,
    inputImageUrl,
    variationIndex: currentGenerationCount,
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

  const nextGenerationCount = currentGenerationCount + 1;
  // Each concept gets its own path so the mobile image cache sees a new URI.
  const path = `users/${record.user_id}/outputs/${jobId}/concept-${nextGenerationCount}.png`;
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

  // Persist the stable private Storage path instead of an expiring signed URL.
  // The mobile client resolves this canonical path through createSignedUrl()
  // whenever it renders or exports the concept image.
  return {
    resultImageUrl: path,
    conceptImageUrl: path,
    imageProvider: concept.provider,
    imageGenerationStatus: 'completed',
    imageGenerationError: null,
    estimatedImageCostCents: concept.costCents,
    imageGenerationCount: nextGenerationCount,
  };
}


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
  const regenerateImage = body.regenerateImage === true;

  if (!jobId) {
    return jsonResponse({ ok: false, error: 'jobId is required' }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // This endpoint is only for signed-in app users, including anonymous guest
  // accounts. Never trust a client-supplied ownership id when using a
  // service-role client that bypasses RLS.
  const authUserId = await getAuthenticatedUserId(supabase, req.headers.get('Authorization'));
  if (!authUserId) {
    return jsonResponse({ ok: false, error: 'Not authenticated' }, 401);
  }

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

  if (record.user_id !== authUserId) {
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
    const originalImageUrl = record.input_public_url ?? record.input_image_uri ?? '';
    const providerInputImageUrl = await resolveProviderInputImageUrl(supabase, record);

    let planResult: GenerateUpgradePlanTextResult;
    if (regenerateImage && record.result_payload) {
      const provider =
        record.ai_provider === 'gemini' || record.ai_provider === 'groq'
          ? record.ai_provider
          : 'mock';
      planResult = {
        payload: record.result_payload,
        source: record.plan_source === 'ai' ? 'ai' : 'mock',
        provider,
        estimatedCostCents: record.estimated_cost_cents ?? 0,
      };
    } else {
      planResult = await generateUpgradePlanText({
        projectType: record.project_type,
        goal: record.goal,
        budgetRange: record.budget_range,
        notes: record.notes,
        inputPublicUrl: providerInputImageUrl,
        prompt,
      });
    }

    if (planResult.source === 'mock') {
      if (!Deno.env.get('GEMINI_API_KEY') && !Deno.env.get('GROQ_API_KEY')) {
        console.warn('[generate-upgrade-plan] GEMINI_API_KEY and GROQ_API_KEY missing — using mock plan text');
      } else {
        console.warn('[generate-upgrade-plan] AI plan generation failed — using mock plan text');
      }
    }

    // Real AI concept image only when enabled; otherwise the user's original
    // property photo is used as the visual (never a stock/mock image).
    const image = await maybeGenerateConceptImage(
      supabase,
      record,
      jobId,
      originalImageUrl,
      providerInputImageUrl,
      planResult.payload?.upgradeSummary ?? null
    );

    if (regenerateImage && image.imageGenerationStatus !== 'completed') {
      await supabase
        .from('generation_jobs')
        .update({ status: 'completed' })
        .eq('id', jobId);

      const message =
        image.imageGenerationStatus === 'skipped_job_limit'
          ? 'Concept limit reached for this project'
          : 'Could not generate another concept';

      return jsonResponse(
        {
          ok: false,
          jobId,
          imageGenerationStatus: image.imageGenerationStatus,
          imageGenerationCount: image.imageGenerationCount,
          error: message,
        },
        422
      );
    }

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
        image_generation_count: image.imageGenerationCount,
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
      imageGenerationCount: image.imageGenerationCount,
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
