import { getProjectTypeById } from '../data/mockProjectTypes';
import type { PickedImageSource } from './imagePicker';
import { DB_TABLE_MISSING_MESSAGE, logDbWarning, mapSupabaseDbError } from './dbErrors';
import { canUseGeneration, consumeGenerationQuota } from './payments';
import { getSupabaseClient, hasSupabaseConfig } from './supabase';

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
  goal?: string;
  budgetRange?: string;
  notes?: string;
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
  code:
    | 'quota_exceeded'
    | 'missing_tool'
    | 'missing_image'
    | 'not_found'
    | 'create_failed'
    | 'table_missing';
  message: string;
};

type GenerationJobRow = {
  id: string;
  user_id: string;
  project_type: string;
  goal: string | null;
  budget_range: string | null;
  notes: string | null;
  input_image_uri: string | null;
  input_storage_path: string | null;
  input_public_url: string | null;
  result_image_url: string | null;
  status: string;
  source: string | null;
  estimated_cost_cents: number | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

const MOCK_RESULT_URLS = [
  'https://images.unsplash.com/photo-1618221197160-8070ed78f1c9?w=600',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600',
  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600',
  'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600',
];

const jobs = new Map<string, GenerationJob>();
const DEMO_USER_ID = 'demo-user';

function createLocalId(): string {
  return `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function parseSource(value: string | null | undefined): PickedImageSource {
  if (value === 'camera' || value === 'gallery' || value === 'demo') {
    return value;
  }
  return 'demo';
}

function parseStatus(value: string): GenerationJobStatus {
  if (
    value === 'queued' ||
    value === 'uploading' ||
    value === 'processing' ||
    value === 'completed' ||
    value === 'failed'
  ) {
    return value;
  }
  return 'queued';
}

function rowToGenerationJob(row: GenerationJobRow): GenerationJob {
  const goal = row.goal ?? undefined;
  return {
    id: row.id,
    userId: row.user_id,
    toolId: row.project_type,
    styleId: goal,
    goal,
    budgetRange: row.budget_range ?? undefined,
    notes: row.notes ?? undefined,
    inputImageUri: row.input_image_uri ?? '',
    inputStoragePath: row.input_storage_path ?? undefined,
    inputPublicUrl: row.input_public_url ?? undefined,
    resultImageUrl: row.result_image_url ?? undefined,
    status: parseStatus(row.status),
    source: parseSource(row.source),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    errorMessage: row.error_message ?? undefined,
    estimatedCostCents: row.estimated_cost_cents ?? undefined,
  };
}

function jobToInsertRow(input: CreateGenerationJobInput, userId: string) {
  return {
    user_id: userId,
    project_type: input.toolId,
    goal: input.goal ?? input.styleId ?? null,
    budget_range: input.budgetRange ?? null,
    notes: input.notes ?? null,
    input_image_uri: input.inputImageUri,
    input_storage_path: input.inputStoragePath ?? null,
    input_public_url: input.inputPublicUrl ?? input.inputImageUri,
    status: 'queued' as const,
    source: input.source,
    estimated_cost_cents: input.estimatedCostCents ?? 0,
  };
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
  goal?: string;
  budgetRange?: string;
  notes?: string;
  inputImageUri: string;
  inputStoragePath?: string;
  inputPublicUrl?: string;
  source: PickedImageSource;
  estimatedCostCents?: number;
};

function createLocalJob(input: CreateGenerationJobInput): GenerationJob {
  const timestamp = nowIso();
  const job: GenerationJob = {
    id: createLocalId(),
    userId: input.userId ?? DEMO_USER_ID,
    toolId: input.toolId,
    styleId: input.styleId ?? input.goal,
    goal: input.goal ?? input.styleId,
    budgetRange: input.budgetRange,
    notes: input.notes,
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
  return { ...job };
}

async function createGenerationJobSupabase(input: CreateGenerationJobInput): Promise<GenerationJob> {
  const client = getSupabaseClient();
  if (!client) {
    return createLocalJob(input);
  }

  const userId = input.userId ?? DEMO_USER_ID;
  const { data, error } = await client
    .from('generation_jobs')
    .insert(jobToInsertRow(input, userId))
    .select('*')
    .single();

  if (error || !data) {
    logDbWarning('createGenerationJob insert failed', error ?? 'No data returned');
    const mapped = mapSupabaseDbError(error ?? { message: 'Insert failed' });
    if (mapped.code === 'table_missing') {
      throw {
        code: 'table_missing',
        message: DB_TABLE_MISSING_MESSAGE,
      } as GenerationJobError;
    }
    throw {
      code: 'create_failed',
      message: 'Could not create your upgrade plan. Please try again.',
    } as GenerationJobError;
  }

  const job = rowToGenerationJob(data as GenerationJobRow);
  jobs.set(job.id, job);
  return { ...job };
}

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

  if (!hasSupabaseConfig()) {
    return createLocalJob(input);
  }

  try {
    return await createGenerationJobSupabase(input);
  } catch (error) {
    if ((error as GenerationJobError).code) {
      throw error;
    }
    logDbWarning('createGenerationJob unexpected error', error);
    throw {
      code: 'create_failed',
      message: 'Could not create your upgrade plan. Please try again.',
    } as GenerationJobError;
  }
}

async function updateGenerationJobSupabase(
  jobId: string,
  status: GenerationJobStatus,
  patch?: Partial<Pick<GenerationJob, 'errorMessage' | 'resultImageUrl'>>
): Promise<GenerationJob | null> {
  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  const updateRow: Record<string, string | null> = {
    status,
  };

  if (patch?.errorMessage !== undefined) {
    updateRow.error_message = patch.errorMessage;
  }
  if (patch?.resultImageUrl !== undefined) {
    updateRow.result_image_url = patch.resultImageUrl;
  }

  const { data, error } = await client
    .from('generation_jobs')
    .update(updateRow)
    .eq('id', jobId)
    .select('*')
    .maybeSingle();

  if (error) {
    logDbWarning('updateGenerationJobStatus failed', error);
    return null;
  }

  if (!data) {
    return null;
  }

  const job = rowToGenerationJob(data as GenerationJobRow);
  jobs.set(job.id, job);
  return job;
}

export async function updateGenerationJobStatus(
  jobId: string,
  status: GenerationJobStatus,
  patch?: Partial<Pick<GenerationJob, 'errorMessage' | 'resultImageUrl'>>
): Promise<GenerationJob> {
  const cached = jobs.get(jobId);
  const timestamp = nowIso();

  const updated: GenerationJob = {
    ...(cached ?? {
      id: jobId,
      userId: DEMO_USER_ID,
      toolId: '',
      inputImageUri: '',
      status: 'queued',
      source: 'demo',
      createdAt: timestamp,
      updatedAt: timestamp,
    }),
    ...patch,
    status,
    updatedAt: timestamp,
  };

  jobs.set(jobId, updated);

  if (hasSupabaseConfig()) {
    const persisted = await updateGenerationJobSupabase(jobId, status, patch);
    if (persisted) {
      return { ...persisted };
    }
    if (!cached) {
      throw { code: 'not_found', message: 'Generation job not found.' } as GenerationJobError;
    }
  } else if (!cached) {
    throw { code: 'not_found', message: 'Generation job not found.' } as GenerationJobError;
  }

  return { ...updated };
}

export async function completeGenerationJobMock(
  jobId: string,
  options?: { resultIndex?: number; resultImageUrl?: string }
): Promise<GenerationJob> {
  const job = jobs.get(jobId) ?? (await getGenerationJob(jobId));
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

async function getGenerationJobSupabase(jobId: string): Promise<GenerationJob | null> {
  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  const { data, error } = await client
    .from('generation_jobs')
    .select('*')
    .eq('id', jobId)
    .maybeSingle();

  if (error) {
    logDbWarning('getGenerationJob failed', error);
    return null;
  }

  if (!data) {
    return null;
  }

  const job = rowToGenerationJob(data as GenerationJobRow);
  jobs.set(job.id, job);
  return job;
}

export async function getGenerationJob(jobId: string): Promise<GenerationJob | null> {
  const cached = jobs.get(jobId);
  if (cached) {
    return { ...cached };
  }

  if (hasSupabaseConfig()) {
    const job = await getGenerationJobSupabase(jobId);
    if (job) {
      return job;
    }
  }

  return null;
}

async function listGenerationJobsSupabase(userId: string): Promise<GenerationJob[]> {
  const client = getSupabaseClient();
  if (!client) {
    return [];
  }

  const { data, error } = await client
    .from('generation_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    logDbWarning('listGenerationJobsForUser failed', error);
    return [];
  }

  const rows = (data as GenerationJobRow[]).map(rowToGenerationJob);
  for (const job of rows) {
    jobs.set(job.id, job);
  }
  return rows;
}

export async function listGenerationJobsForUser(
  userId = DEMO_USER_ID
): Promise<GenerationJob[]> {
  if (hasSupabaseConfig()) {
    const remoteJobs = await listGenerationJobsSupabase(userId);
    if (remoteJobs.length > 0) {
      return remoteJobs.map((job) => ({ ...job }));
    }
  }

  return [...jobs.values()]
    .filter((job) => job.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((job) => ({ ...job }));
}

export function getGenerationJobStatusLabel(status: GenerationJobStatus): string {
  switch (status) {
    case 'queued':
      return 'Preparing your upgrade plan…';
    case 'uploading':
      return 'Uploading property photo…';
    case 'processing':
      return 'Building your upgrade plan…';
    case 'completed':
      return 'Upgrade plan ready';
    case 'failed':
      return 'Something went wrong';
  }
}

export { DB_TABLE_MISSING_MESSAGE };
