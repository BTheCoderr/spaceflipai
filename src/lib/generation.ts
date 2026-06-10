import type {
  DesignProject,
  GeneratedDesign,
  GenerationJob,
  GenerationJobType,
} from '../types/database';
import { REGENERATE_POLICY as POLICY, QUOTA_LIMITS } from '../types/database';
import { buildPrompt, estimateTokens, mapRoomTypeToPromptParams } from './ai/promptBuilder';
import type { PromptParams } from './ai/types';
import { isBackendLive } from './config';
import { consumeGenerationQuota, canUseGeneration } from './payments';
import { getToolById } from '../data/mockTools';
import type { LoadingType } from './mockGenerationSteps';

const MOCK_RESULT_URLS = [
  'https://images.unsplash.com/photo-1618221197160-8070ed78f1c9?w=600',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600',
  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600',
  'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600',
];

const jobs = new Map<string, GenerationJob>();
const projects: DesignProject[] = [];

const lastRegenerateAt = new Map<string, number>();
let resultUrlIndex = 0;

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export type CreateJobInput = {
  userId?: string;
  type?: GenerationJobType;
  roomType: string;
  designStyle: string;
  inputPhotoId?: string;
  inputPhotoStoragePath?: string;
  promptParams?: PromptParams;
  toolId?: string;
  inputImageUrl?: string;
  userPrompt?: string;
  resultIndex?: number;
  loadingType?: LoadingType;
};

export type GenerationServiceError = {
  code: 'quota_exceeded' | 'regenerate_limit' | 'cooldown' | 'not_found';
  message: string;
};

function buildJobPrompt(input: CreateJobInput): { promptText: string; promptParams: PromptParams } {
  const promptParams = input.promptParams ?? mapRoomTypeToPromptParams(input.roomType, input.designStyle);
  const promptText = buildPrompt(promptParams);
  return { promptText, promptParams };
}

function resolveResultUrl(input: CreateJobInput, index: number): string {
  if (input.toolId) {
    const tool = getToolById(input.toolId);
    if (tool) {
      return tool.resultImageUrls[index % tool.resultImageUrls.length];
    }
  }
  return MOCK_RESULT_URLS[index % MOCK_RESULT_URLS.length];
}

export async function createGenerationJobMock(input: CreateJobInput): Promise<GenerationJob> {
  if (!canUseGeneration()) {
    throw { code: 'quota_exceeded', message: 'No generations remaining.' } as GenerationServiceError;
  }

  consumeGenerationQuota();

  const { promptText, promptParams } = buildJobPrompt(input);
  const now = new Date().toISOString();
  const resultIndex = input.resultIndex ?? 0;
  const job: GenerationJob = {
    id: createId('job'),
    userId: input.userId ?? 'mock-user',
    type: input.type ?? (input.toolId ? 'design_tool' : 'style_transfer'),
    status: 'queued',
    inputPhotoId: input.inputPhotoId,
    inputPhotoStoragePath: input.inputPhotoStoragePath,
    roomType: input.roomType,
    designStyle: input.designStyle,
    promptText,
    promptParams,
    providerName: 'replicate',
    estimatedProviderCost: 0.04,
    promptTokenEstimate: estimateTokens(promptText),
    regenerateCount: 0,
    toolId: input.toolId,
    inputImageUrl: input.inputImageUrl,
    resultIndex,
    userPrompt: input.userPrompt,
    createdAt: now,
  };

  jobs.set(job.id, job);

  setTimeout(() => {
    const stored = jobs.get(job.id);
    if (stored && stored.status === 'queued') {
      stored.status = 'processing';
      stored.processingStartedAt = new Date().toISOString();
      jobs.set(job.id, stored);
    }
  }, 500);

  return job;
}

export async function getGenerationStatusMock(jobId: string): Promise<GenerationJob> {
  const job = jobs.get(jobId);
  if (!job) {
    throw { code: 'not_found', message: 'Job not found.' } as GenerationServiceError;
  }

  if (job.status === 'processing' && job.processingStartedAt) {
    const elapsed = Date.now() - new Date(job.processingStartedAt).getTime();
    if (elapsed > 2000) {
      job.status = 'completed';
      const idx = job.resultIndex ?? 0;
      job.resultUrl = resolveResultUrl(
        { toolId: job.toolId, roomType: job.roomType, designStyle: job.designStyle },
        idx
      );
      if (!job.toolId) {
        resultUrlIndex += 1;
      }
      job.outputStoragePath = `generated-designs/${job.userId}/${job.id}.png`;
      job.completedAt = new Date().toISOString();
      jobs.set(jobId, job);
    }
  }

  return { ...job };
}

export async function saveGeneratedDesignMock(
  design: Omit<GeneratedDesign, 'id' | 'createdAt'>
): Promise<DesignProject> {
  const now = new Date().toISOString();
  const project: DesignProject = {
    id: createId('proj'),
    userId: 'mock-user',
    title: `${design.roomType} ${design.designStyle}`,
    roomType: design.roomType,
    designStyle: design.designStyle,
    thumbnailUrl: design.imageUrl,
    status: 'completed',
    createdAt: now,
    updatedAt: now,
  };
  projects.unshift(project);
  return project;
}

export async function listUserProjectsMock(_userId?: string): Promise<DesignProject[]> {
  return [...projects];
}

function getRootJobId(job: GenerationJob): string {
  return job.parentJobId ?? job.id;
}

export async function regenerateDesignMock(jobId: string): Promise<GenerationJob> {
  const original = jobs.get(jobId);
  if (!original) {
    throw { code: 'not_found', message: 'Job not found.' } as GenerationServiceError;
  }

  const rootId = getRootJobId(original);
  const chainJobs = [...jobs.values()].filter(
    (j) => j.id === rootId || j.parentJobId === rootId
  );
  const regenerateCount = chainJobs.length - 1;

  if (regenerateCount >= POLICY.maxRegeneratesPerChain) {
    throw {
      code: 'regenerate_limit',
      message: `Maximum ${POLICY.maxRegeneratesPerChain} regenerates reached.`,
    } as GenerationServiceError;
  }

  const lastAt = lastRegenerateAt.get(rootId) ?? 0;
  if (Date.now() - lastAt < POLICY.cooldownMs) {
    throw {
      code: 'cooldown',
      message: 'Please wait before regenerating again.',
    } as GenerationServiceError;
  }

  if (!canUseGeneration()) {
    throw { code: 'quota_exceeded', message: 'No generations remaining.' } as GenerationServiceError;
  }

  lastRegenerateAt.set(rootId, Date.now());

  return createGenerationJobMock({
    userId: original.userId,
    type: original.type,
    roomType: original.roomType,
    designStyle: original.designStyle,
    inputPhotoId: original.inputPhotoId,
    inputPhotoStoragePath: original.inputPhotoStoragePath,
    promptParams: original.promptParams,
    toolId: original.toolId,
    inputImageUrl: original.inputImageUrl,
    userPrompt: original.userPrompt,
    resultIndex: ((original.resultIndex ?? 0) + 1) % 3,
  }).then((job) => {
    job.parentJobId = rootId;
    job.regenerateCount = regenerateCount + 1;
    jobs.set(job.id, job);
    return job;
  });
}

async function createGenerationJobLive(input: CreateJobInput): Promise<GenerationJob> {
  // Future: supabase.functions.invoke('create-generation-job', { body: input })
  return createGenerationJobMock(input);
}

async function getGenerationStatusLive(jobId: string): Promise<GenerationJob> {
  // Future: supabase.functions.invoke('get-generation-status', { body: { jobId } })
  return getGenerationStatusMock(jobId);
}

export async function createGenerationJob(input: CreateJobInput): Promise<GenerationJob> {
  if (isBackendLive()) {
    try {
      return await createGenerationJobLive(input);
    } catch {
      return createGenerationJobMock(input);
    }
  }
  return createGenerationJobMock(input);
}

export async function getGenerationStatus(jobId: string): Promise<GenerationJob> {
  if (isBackendLive()) {
    try {
      return await getGenerationStatusLive(jobId);
    } catch {
      return getGenerationStatusMock(jobId);
    }
  }
  return getGenerationStatusMock(jobId);
}

export async function saveGeneratedDesign(
  design: Omit<GeneratedDesign, 'id' | 'createdAt'>
): Promise<DesignProject> {
  return saveGeneratedDesignMock(design);
}

export async function listUserProjects(userId?: string): Promise<DesignProject[]> {
  return listUserProjectsMock(userId);
}

export async function regenerateDesign(jobId: string): Promise<GenerationJob> {
  if (isBackendLive()) {
    try {
      return await regenerateDesignMock(jobId);
    } catch (e) {
      throw e;
    }
  }
  return regenerateDesignMock(jobId);
}

export { QUOTA_LIMITS, POLICY as REGENERATE_POLICY };
export { uploadRoomPhotoMock } from './storage';
