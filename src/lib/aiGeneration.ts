import {
  completeGenerationJobMock,
  getGenerationJob,
  updateGenerationJobStatus,
} from './generationJobs';
import { getSupabaseClient, hasSupabaseConfig } from './supabase';

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
  promptPreview?: string;
  source: 'edge' | 'local';
};

type EdgeFunctionPayload = {
  ok: boolean;
  jobId?: string;
  resultImageUrl?: string;
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

async function runLocalMockGeneration(jobId: string): Promise<UpgradeGenerationResult> {
  await updateGenerationJobStatus(jobId, 'processing');
  const job = await completeGenerationJobMock(jobId);
  if (!job.resultImageUrl) {
    throw new AiGenerationError();
  }
  return {
    resultImageUrl: job.resultImageUrl,
    source: 'local',
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

  if (error) {
    console.warn('[SpaceFlip Pro][AI] Edge function invoke failed:', {
      message: error.message,
      name: error.name,
      jobId,
    });
    throw new AiGenerationError();
  }

  if (!data?.ok || !data.resultImageUrl) {
    console.warn('[SpaceFlip Pro][AI] Edge function returned error:', {
      jobId,
      error: data?.error ?? 'Unknown error',
      payload: data,
    });
    throw new AiGenerationError();
  }

  if (__DEV__) {
    console.log('[SpaceFlip Pro][AI] Edge function success', {
      jobId,
      resultImageUrl: data.resultImageUrl,
      promptPreview: data.promptPreview?.slice(0, 80),
    });
  }

  // Sync in-memory job cache with DB row updated by the function.
  await getGenerationJob(jobId);

  return {
    resultImageUrl: data.resultImageUrl,
    promptPreview: data.promptPreview,
    source: 'edge',
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
    if (error instanceof AiGenerationError) {
      throw error;
    }
    console.warn('[SpaceFlip Pro][AI] Unexpected generation error:', error);
    throw new AiGenerationError();
  }
}
