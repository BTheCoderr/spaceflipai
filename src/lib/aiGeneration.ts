import {
  completeGenerationJobMock,
  getGenerationJob,
  updateGenerationJobStatus,
} from './generationJobs';
import { getOwnerId, getSupabaseClient, hasSupabaseConfig } from './supabase';
import type { AiProvider, PlanSource, UpgradePlanPayload } from './upgradePlanPayload';

export const EDGE_GENERATION_STEPS = [
  'Uploading property photo',
  'Building upgrade plan',
  'Reviewing your property photo',
  'Preparing budget and checklist',
  'Finalizing PDF-ready plan',
] as const;

export const EDGE_GENERATION_ERROR_MESSAGE =
  "Couldn't generate this upgrade plan. Please try again.";

export type UpgradeGenerationResult = {
  resultImageUrl: string;
  resultPayload?: UpgradePlanPayload;
  planSource: PlanSource;
  aiProvider: AiProvider;
  promptPreview?: string;
  source: 'edge' | 'local';
  /** True when AI generation failed and a local fallback plan was used. */
  usedFallback: boolean;
  /** Internal, sanitized reason for the fallback (for logs/state, not raw provider errors). */
  fallbackReason?: string;
  /** Image provider used ('none' when no real AI concept image was generated). */
  imageProvider?: string;
  /** True only when a real AI concept image was generated (badge: "AI Concept Reference"). */
  conceptImageGenerated: boolean;
};

type EdgeFunctionPayload = {
  ok: boolean;
  jobId?: string;
  resultImageUrl?: string;
  resultPayload?: UpgradePlanPayload;
  planSource?: PlanSource;
  aiProvider?: AiProvider;
  estimatedCostCents?: number;
  promptPreview?: string;
  conceptImageUrl?: string;
  imageProvider?: string;
  imageGenerationStatus?: string;
  estimatedImageCostCents?: number;
  error?: string;
};

export class AiGenerationError extends Error {
  constructor(message: string = EDGE_GENERATION_ERROR_MESSAGE) {
    super(message);
    this.name = 'AiGenerationError';
  }
}

async function runLocalMockGeneration(
  jobId: string,
  options?: { usedFallback?: boolean; fallbackReason?: string }
): Promise<UpgradeGenerationResult> {
  await updateGenerationJobStatus(jobId, 'processing');
  // Never show a stock/mock image: use the user's original uploaded property photo.
  const existing = await getGenerationJob(jobId);
  const originalImageUrl = existing?.inputPublicUrl ?? existing?.inputImageUri ?? '';
  const job = await completeGenerationJobMock(jobId, { resultImageUrl: originalImageUrl || undefined });
  const resultImageUrl = originalImageUrl || job.resultImageUrl || '';
  return {
    resultImageUrl,
    planSource: 'mock',
    aiProvider: 'mock',
    source: 'local',
    usedFallback: options?.usedFallback ?? false,
    fallbackReason: options?.fallbackReason,
    imageProvider: 'none',
    conceptImageGenerated: false,
  };
}

async function runEdgeFunctionGeneration(
  jobId: string,
  userId: string
): Promise<UpgradeGenerationResult> {
  const client = getSupabaseClient();
  if (!client) {
    return runLocalMockGeneration(jobId);
  }

  if (__DEV__) {
    console.log('[SpaceFlip Pro][AI] Invoking generate-upgrade-plan', { jobId, userId });
  }

  const { data, error } = await client.functions.invoke<EdgeFunctionPayload>(
    'generate-upgrade-plan',
    {
      body: { jobId, userId },
    }
  );

  // Reliability: never block the user on AI failure — fall back to a local plan.
  if (error) {
    console.warn('[SpaceFlip Pro][AI] Edge function invoke failed, using fallback plan:', {
      name: error.name,
      jobId,
    });
    return runLocalMockGeneration(jobId, {
      usedFallback: true,
      fallbackReason: 'edge_invoke_failed',
    });
  }

  if (!data?.ok || !data.resultImageUrl) {
    console.warn('[SpaceFlip Pro][AI] Edge function returned error, using fallback plan:', {
      jobId,
      error: data?.error ?? 'Unknown error',
    });
    return runLocalMockGeneration(jobId, {
      usedFallback: true,
      fallbackReason: 'edge_returned_error',
    });
  }

  const conceptImageGenerated = data.imageGenerationStatus === 'completed';

  if (__DEV__) {
    console.log('[SpaceFlip Pro][AI] Edge function success', {
      jobId,
      resultImageUrl: data.resultImageUrl,
      planSource: data.planSource ?? 'mock',
      aiProvider: data.aiProvider ?? 'mock',
      imageProvider: data.imageProvider ?? 'mock',
      imageGenerationStatus: data.imageGenerationStatus ?? 'not_started',
      promptPreview: data.promptPreview?.slice(0, 80),
    });
  }

  // Sync in-memory job cache with DB row updated by the function.
  await getGenerationJob(jobId);

  return {
    resultImageUrl: data.resultImageUrl,
    resultPayload: data.resultPayload,
    planSource: data.planSource ?? 'mock',
    aiProvider: data.aiProvider ?? 'mock',
    promptPreview: data.promptPreview,
    source: 'edge',
    // A completed job with mock plan source means the server used its own fallback.
    usedFallback: (data.planSource ?? 'mock') === 'mock',
    fallbackReason: (data.planSource ?? 'mock') === 'mock' ? 'server_mock_fallback' : undefined,
    imageProvider: data.imageProvider ?? 'none',
    conceptImageGenerated,
  };
}

/**
 * Runs upgrade generation via Supabase Edge Function when configured,
 * otherwise completes the job with the existing local mock flow.
 */
export async function runUpgradeGeneration(
  jobId: string,
  userId = getOwnerId()
): Promise<UpgradeGenerationResult> {
  if (!jobId) {
    throw new AiGenerationError('Missing generation job.');
  }

  if (!hasSupabaseConfig()) {
    if (__DEV__) {
      console.log('[SpaceFlip Pro][AI] Supabase not configured — local mock generation');
    }
    return runLocalMockGeneration(jobId);
  }

  try {
    return await runEdgeFunctionGeneration(jobId, userId);
  } catch (error) {
    // Last-resort fallback so the user always reaches a usable Result screen.
    console.warn('[SpaceFlip Pro][AI] Unexpected generation error, using fallback plan:', {
      name: error instanceof Error ? error.name : 'unknown',
      jobId,
    });
    try {
      return await runLocalMockGeneration(jobId, {
        usedFallback: true,
        fallbackReason: 'unexpected_error',
      });
    } catch (fallbackError) {
      console.warn('[SpaceFlip Pro][AI] Fallback generation also failed:', {
        name: fallbackError instanceof Error ? fallbackError.name : 'unknown',
        jobId,
      });
      throw new AiGenerationError();
    }
  }
}
