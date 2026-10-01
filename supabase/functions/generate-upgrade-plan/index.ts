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

function maxPlansPerUserPerDay(): number {
  const raw = Number(Deno.env.get('MAX_PLAN_GENERATIONS_PER_USER_PER_DAY') ?? '20');
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : 20;
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

type UsageReservation = {
  status: 'reserved' | 'daily_limit' | 'job_limit' | 'invalid';
  daily_count: number;
  job_count: number;
};

async function reserveGenerationUsage(
  supabase: SupabaseClient<any>,
  userId: string,
  jobId: string,
  usageType: 'plan' | 'image',
  dailyLimit: number,
  jobLimit: number
): Promise<UsageReservation | null> {
  const { data, error } = await supabase.rpc('reserve_generation_usage', {
    p_user_id: userId,
    p_job_id: jobId,
    p_usage_type: usageType,
    p_daily_limit: dailyLimit,
    p_job_limit: jobLimit,
  });

  if (error) {
    console.error('[generate-upgrade-plan] Usage reservation failed:', {
      usageType,
      message: error.message,
    });
    return null;
  }

  if (!data || typeof data !== 'object') {
    return null;
  }

  return data as UsageReservation;
}

async function resolveProviderInputImageUrl(
  supabase: SupabaseClient<any>,
  record: GenerationJobRecord
): Promise<string> {
  const storagePath = record.input_storage_path?.trim();
  if (!storagePath) return '';

  const expectedPrefix = `users/${record.user_id}/`;
  if (!storagePath.startsWith(expectedPrefix)) {
    console.warn('[generate-upgrade-plan] Refusing non-owner input storage path');
    return '';
  }

  const { data, error } = await supabase.storage
    .from(DESIGN_INPUTS_BUCKET)
    .createSignedUrl(storagePath, 10 * 60);

  if (error || !data?.signedUrl) {
    console.warn('[generate-upgrade-plan] Could not sign provider input image:', {
      message: error?.message ?? 'No signed URL returned',
    });
    return '';
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
  let currentGenerationCount = Math.max(0, Number(record.image_generation_count ?? 0));

  const fallback: ConceptImageOutcome = {
    resultImageUrl: originalImageUrl,
    conceptImageUrl: null,
    imageProvider: 'none',
    imageGenerationStatus: 'not_generated',
    imageGenerationError: null,
    estimatedImageCostCents: 0,
    imageGenerationCount: currentGenerationCount,
  };

  if (!isImageGenerationEnabled()) {
    return { ...fallback, imageGenerationStatus: 'disabled' };
  }

  if (!providerInputImageUrl) {
    return {
      ...fallback,
      imageGenerationStatus: 'failed',
      imageGenerationError: 'safe_input_unavailable',
    };
  }

  const reservation = await reserveGenerationUsage(
    supabase,
    record.user_id,
    jobId,
    'image',
    maxImagesPerUserPerDay(),
    maxImagesPerJob()
  );

  if (!reservation) {
    return {
      ...fallback,
      imageGenerationStatus: 'failed',
      imageGenerationError: 'usage_reservation_failed',
    };
  }

  if (reservation.status === 'daily_limit') {
    return {
      ...fallback,
      imageGenerationStatus: 'skipped_limit',
      imageGenerationCount: reservation.job_count,
    };
  }

  if (reservation.status === 'job_limit') {
    return {
      ...fallback,
      imageGenerationStatus: 'skipped_job_limit',
      imageGenerationCount: reservation.job_count,
    };
  }

  if (reservation.status !== 'reserved') {
    return {
      ...fallback,
      imageGenerationStatus: 'failed',
      imageGenerationError: 'usage_reservation_failed',
      imageGenerationCount: reservation.job_count,
    };
  }

  currentGenerationCount = reservation.job_count;
  const reservedFallback: ConceptImageOutcome = {
    ...fallback,
    imageGenerationCount: currentGenerationCount,
  };

  const concept = await generateConceptImage({
    projectType: record.project_type,
    goal: record.goal,
    budgetRange: record.budget_range,
    notes: record.notes,
    planSummary,
    inputImageUrl: providerInputImageUrl,
    variationIndex: Math.max(0, currentGenerationCount - 1),
  });

  if (concept.status === 'disabled') {
    return { ...reservedFallback, imageGenerationStatus: 'disabled' };
  }

  if (concept.status === 'failed') {
    return {
      ...reservedFallback,
      imageProvider: 'none',
      imageGenerationStatus: 'failed',
      imageGenerationError: concept.error,
      estimatedImageCostCents: concept.costCents,
    };
  }

  const path = `users/${record.user_id}/outputs/${jobId}/concept-${currentGenerationCount}.png`;
  const { error: uploadError } = await supabase.storage
    .from(DESIGN_INPUTS_BUCKET)
    .upload(path, concept.bytes, { contentType: concept.contentType, upsert: true });

  if (uploadError) {
    console.warn('[generate-upgrade-plan] Concept image upload failed:', uploadError.message);
    return {
      ...reservedFallback,
      imageProvider: 'none',
      imageGenerationStatus: 'failed',
      imageGenerationError: 'storage_upload_failed',
      estimatedImageCostCents: concept.costCents,
    };
  }

  return {
    resultImageUrl: path,
    conceptImageUrl: path,
    imageProvider: concept.provider,
    imageGenerationStatus: 'completed',
    imageGenerationError: null,
    estimatedImageCostCents: concept.costCents,
    imageGenerationCount: currentGenerationCount,
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

  if (
    regenerateImage &&
    (
      record.status !== 'completed' ||
      !record.result_payload ||
      Object.keys(record.result_payload).length === 0
    )
  ) {
    return jsonResponse(
      { ok: false, error: 'Generate the upgrade plan before requesting another concept' },
      409
    );
  }

  if (!regenerateImage && record.status === 'completed' && record.result_payload) {
    const provider =
      record.ai_provider === 'gemini' || record.ai_provider === 'groq'
        ? record.ai_provider
        : 'mock';
    return jsonResponse({
      ok: true,
      jobId,
      resultImageUrl: record.result_image_url ?? undefined,
      resultPayload: record.result_payload,
      planSource: record.plan_source === 'ai' ? 'ai' : 'mock',
      aiProvider: provider,
      estimatedCostCents: record.estimated_cost_cents ?? 0,
      conceptImageUrl: record.concept_image_url ?? undefined,
      imageProvider: record.image_provider ?? undefined,
      imageGenerationStatus: record.image_generation_status ?? undefined,
      estimatedImageCostCents: record.estimated_image_cost_cents ?? 0,
      imageGenerationCount: record.image_generation_count ?? 0,
    });
  }

  if (!regenerateImage) {
    const reservation = await reserveGenerationUsage(
      supabase,
      authUserId,
      jobId,
      'plan',
      maxPlansPerUserPerDay(),
      1
    );

    if (!reservation) {
      return jsonResponse({ ok: false, error: 'Could not start generation' }, 503);
    }

    if (reservation.status === 'daily_limit') {
      return jsonResponse(
        { ok: false, error: 'Daily plan generation limit reached. Try again later.' },
        429
      );
    }

    if (reservation.status === 'job_limit') {
      return jsonResponse({ ok: false, error: 'This plan is already being generated' }, 409);
    }

    if (reservation.status !== 'reserved') {
      return jsonResponse({ ok: false, error: 'Could not start generation' }, 503);
    }
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
    const providerInputImageUrl = await resolveProviderInputImageUrl(supabase, record);
    const originalImageUrl =
      record.input_storage_path?.startsWith(`users/${authUserId}/`)
        ? record.input_storage_path
        : record.input_public_url ?? record.input_image_uri ?? '';

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
    const internalMessage = error instanceof Error ? error.message : 'Generation failed';

    await supabase
      .from('generation_jobs')
      .update({ status: 'failed', error_message: 'generation_failed' })
      .eq('id', jobId);

    console.error('[generate-upgrade-plan] Generation failed:', internalMessage);
    return jsonResponse({ ok: false, error: 'Could not generate upgrade plan' }, 500);
  }
});
