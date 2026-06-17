import {
  completeGenerationJobMock,
  getGenerationJob,
  updateGenerationJobStatus,
} from './generationJobs';
import { getSupabaseClient, hasSupabaseConfig } from './supabase';
import type { AiProvider, PlanSource, UpgradePlanPayload } from './upgradePlanPayload';

export const EDGE_GENERATION_STEPS = [
  'Queued',
  'Upload complete',
  'Building upgrade prompt',
  'Creating upgrade concept',
  'Finalizing project plan',
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
  error?: string;
};

export class AiGenerationError extends Error {
  constructor(message: string = EDGE_GENERATION_ERROR_MESSAGE) {
    super(message);
    this.name = 'AiGenerationError';
  }
}

const DEMO_USER_ID = 'demo-user';

async function runLocalMockGeneration(
  jobId: string,
  options?: { usedFallback?: boolean; fallbackReason?: string }
): Promise<UpgradeGenerationResult> {
  await updateGenerationJobStatus(jobId, 'processing');
  const job = await completeGenerationJobMock(jobId);
  const resultImageUrl =
    job.resultImageUrl ?? 'https://images.unsplash.com/photo-1618221197160-8070ed78f1c9?w=600';
  return {
    resultImageUrl,
    planSource: 'mock',
    aiProvider: 'mock',
    source: 'local',
    usedFallback: options?.usedFallback ?? false,
    fallbackReason: options?.fallbackReason,
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

  // MVP reliability: never block the user on AI failure — fall back to a local plan.
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

  if (__DEV__) {
    console.log('[SpaceFlip Pro][AI] Edge function success', {
      jobId,
      resultImageUrl: data.resultImageUrl,
      planSource: data.planSource ?? 'mock',
      aiProvider: data.aiProvider ?? 'mock',
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
  };
}

/**
 * Runs upgrade generation via Supabase Edge Function when configured,
 * otherwise completes the job with the existing local mock flow.
 */
export async function runUpgradeGeneration(
  jobId: string,
  userId = DEMO_USER_ID
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
