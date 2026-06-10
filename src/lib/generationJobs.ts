import { getProjectTypeById } from '../data/mockProjectTypes';
import type { PickedImageSource } from './imagePicker';
import { canUseGeneration, consumeGenerationQuota } from './payments';
import { hasSupabaseConfig } from './supabase';

export type GenerationJobStatus =
  | 'queued'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'failed';

export type GenerationJob = {
  id: string;
  userId: string;
  toolId: string;
  styleId?: string;
  inputImageUri: string;
  inputStoragePath?: string;
  inputPublicUrl?: string;
  resultImageUrl?: string;
  status: GenerationJobStatus;
  source: PickedImageSource;
  createdAt: string;
  updatedAt: string;
  errorMessage?: string;
  estimatedCostCents?: number;
};

export type GenerationJobError = {
  code: 'quota_exceeded' | 'missing_tool' | 'missing_image' | 'not_found' | 'create_failed';
  message: string;
};

const MOCK_RESULT_URLS = [
  'https://images.unsplash.com/photo-1618221197160-8070ed78f1c9?w=600',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600',
  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600',
  'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600',
];

const jobs = new Map<string, GenerationJob>();
const DEMO_USER_ID = 'demo-user';

function createId(): string {
  return `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function resolveMockResultUrl(toolId: string, resultIndex = 0): string {
  const projectType = getProjectTypeById(toolId);
  if (projectType && projectType.resultImageUrls.length > 0) {
    return projectType.resultImageUrls[resultIndex % projectType.resultImageUrls.length];
  }
  return MOCK_RESULT_URLS[resultIndex % MOCK_RESULT_URLS.length];
}

export type CreateGenerationJobInput = {
  userId?: string;
  toolId: string;
  styleId?: string;
  inputImageUri: string;
  inputStoragePath?: string;
  inputPublicUrl?: string;
  source: PickedImageSource;
  estimatedCostCents?: number;
};

/**
 * Creates a generation job record.
 * Uses in-memory storage for now; prepared for Supabase `generation_jobs` table later.
 */
export async function createGenerationJob(
  input: CreateGenerationJobInput
): Promise<GenerationJob> {
  if (!input.toolId) {
    throw {
      code: 'missing_tool',
      message: 'Tool information is missing. Please go back and try again.',
    } as GenerationJobError;
  }

  if (!input.inputImageUri) {
    throw {
      code: 'missing_image',
      message: 'No photo selected. Please choose an image first.',
    } as GenerationJobError;
  }

  if (!canUseGeneration()) {
    throw {
      code: 'quota_exceeded',
      message: 'No generations remaining.',
    } as GenerationJobError;
  }

  consumeGenerationQuota();

  const timestamp = nowIso();
  const job: GenerationJob = {
    id: createId(),
    userId: input.userId ?? DEMO_USER_ID,
    toolId: input.toolId,
    styleId: input.styleId,
    inputImageUri: input.inputImageUri,
    inputStoragePath: input.inputStoragePath,
    inputPublicUrl: input.inputPublicUrl ?? input.inputImageUri,
    status: 'queued',
    source: input.source,
    createdAt: timestamp,
    updatedAt: timestamp,
    estimatedCostCents: input.estimatedCostCents ?? 0,
  };

  jobs.set(job.id, job);

  if (hasSupabaseConfig()) {
    // Future: await supabase.from('generation_jobs').insert(jobRow)
    if (__DEV__) {
      console.warn('[SpaceFlip] Supabase configured — DB job insert not wired yet (in-memory only).');
    }
  }

  return { ...job };
}

export async function updateGenerationJobStatus(
  jobId: string,
  status: GenerationJobStatus,
  patch?: Partial<Pick<GenerationJob, 'errorMessage' | 'resultImageUrl'>>
): Promise<GenerationJob> {
  const job = jobs.get(jobId);
  if (!job) {
    throw { code: 'not_found', message: 'Generation job not found.' } as GenerationJobError;
  }

  const updated: GenerationJob = {
    ...job,
    ...patch,
    status,
    updatedAt: nowIso(),
  };

  jobs.set(jobId, updated);

  if (hasSupabaseConfig()) {
    // Future: await supabase.from('generation_jobs').update({ status, ...patch }).eq('id', jobId)
  }

  return { ...updated };
}

export async function completeGenerationJobMock(
  jobId: string,
  options?: { resultIndex?: number; resultImageUrl?: string }
): Promise<GenerationJob> {
  const job = jobs.get(jobId);
  if (!job) {
    throw { code: 'not_found', message: 'Generation job not found.' } as GenerationJobError;
  }

  const resultImageUrl =
    options?.resultImageUrl ?? resolveMockResultUrl(job.toolId, options?.resultIndex ?? 0);

  return updateGenerationJobStatus(jobId, 'completed', { resultImageUrl });
}

export async function failGenerationJob(
  jobId: string,
  errorMessage: string
): Promise<GenerationJob> {
  return updateGenerationJobStatus(jobId, 'failed', { errorMessage });
}

export async function getGenerationJob(jobId: string): Promise<GenerationJob | null> {
  const job = jobs.get(jobId);
  if (job) {
    return { ...job };
  }

  if (hasSupabaseConfig()) {
    // Future: supabase.from('generation_jobs').select('*').eq('id', jobId).single()
  }

  return null;
}

export async function listGenerationJobsForUser(
  userId = DEMO_USER_ID
): Promise<GenerationJob[]> {
  const userJobs = [...jobs.values()]
    .filter((job) => job.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  if (hasSupabaseConfig()) {
    // Future: supabase.from('generation_jobs').select('*').eq('user_id', userId).order('created_at')
  }

  return userJobs.map((job) => ({ ...job }));
}

export function getGenerationJobStatusLabel(status: GenerationJobStatus): string {
  switch (status) {
    case 'queued':
      return 'Preparing your design…';
    case 'uploading':
      return 'Uploading your photo…';
    case 'processing':
      return 'Generating your redesign…';
    case 'completed':
      return 'Design ready!';
    case 'failed':
      return 'Something went wrong';
  }
}
