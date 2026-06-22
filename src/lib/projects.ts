import { getProjectTypeLabel } from '../data/mockProjectTypes';
import type { PickedImageSource } from './imagePicker';
import {
  DB_LOAD_FAILED_MESSAGE,
  DB_SAVE_FAILED_MESSAGE,
  DB_TABLE_MISSING_MESSAGE,
  DbError,
  logDbWarning,
  mapSupabaseDbError,
} from './dbErrors';
import { getOwnerId, getSupabaseClient, hasSupabaseConfig } from './supabase';

export type DesignProject = {
  id: string;
  userId: string;
  generationJobId?: string;
  projectType: string;
  goal?: string;
  budgetRange?: string;
  notes?: string;
  inputImageUrl: string;
  resultImageUrl: string;
  status: string;
  source: PickedImageSource;
  checklist: string[];
  budgetItems: string[];
  planSummary?: string;
  contractorNotes?: string;
  createdAt: string;
  updatedAt: string;
};

export type SaveDesignProjectInput = {
  userId?: string;
  generationJobId?: string;
  projectType: string;
  title?: string;
  goal?: string;
  budgetRange?: string;
  notes?: string;
  inputImageUrl: string;
  resultImageUrl: string;
  source: PickedImageSource;
  checklist?: string[];
  budgetItems?: string[];
  planSummary?: string;
  contractorNotes?: string;
};

type DesignProjectRow = {
  id: string;
  user_id: string;
  generation_job_id: string | null;
  project_type: string;
  goal: string | null;
  budget_range: string | null;
  notes: string | null;
  input_image_url: string | null;
  result_image_url: string | null;
  status: string | null;
  source: string | null;
  checklist: string[] | null;
  budget_items: string[] | null;
  plan_summary: string | null;
  contractor_notes: string | null;
  created_at: string;
  updated_at: string;
};

const localProjects = new Map<string, DesignProject>();

function createLocalId(): string {
  return `proj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  return [];
}

function parseSource(value: string | null | undefined): PickedImageSource {
  if (value === 'camera' || value === 'gallery' || value === 'demo') {
    return value;
  }
  return 'demo';
}

function rowToDesignProject(row: DesignProjectRow): DesignProject {
  return {
    id: row.id,
    userId: row.user_id,
    generationJobId: row.generation_job_id ?? undefined,
    projectType: row.project_type,
    goal: row.goal ?? undefined,
    budgetRange: row.budget_range ?? undefined,
    notes: row.notes ?? undefined,
    inputImageUrl: row.input_image_url ?? '',
    resultImageUrl: row.result_image_url ?? '',
    status: row.status ?? 'saved',
    source: parseSource(row.source),
    checklist: parseJsonArray(row.checklist),
    budgetItems: parseJsonArray(row.budget_items),
    planSummary: row.plan_summary ?? undefined,
    contractorNotes: row.contractor_notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function inputToLocalProject(input: SaveDesignProjectInput): DesignProject {
  const timestamp = nowIso();
  const project: DesignProject = {
    id: createLocalId(),
    userId: input.userId ?? getOwnerId(),
    generationJobId: input.generationJobId,
    projectType: input.projectType,
    goal: input.goal,
    budgetRange: input.budgetRange,
    notes: input.notes,
    inputImageUrl: input.inputImageUrl,
    resultImageUrl: input.resultImageUrl,
    status: 'saved',
    source: input.source,
    checklist: input.checklist ?? [],
    budgetItems: input.budgetItems ?? [],
    planSummary: input.planSummary,
    contractorNotes: input.contractorNotes,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  localProjects.set(project.id, project);
  return project;
}

async function saveDesignProjectSupabase(input: SaveDesignProjectInput): Promise<DesignProject> {
  const client = getSupabaseClient();
  if (!client) {
    return inputToLocalProject(input);
  }

  const userId = input.userId ?? getOwnerId();
  const row = {
    user_id: userId,
    generation_job_id: input.generationJobId ?? null,
    project_type: input.projectType,
    goal: input.goal ?? null,
    budget_range: input.budgetRange ?? null,
    notes: input.notes ?? null,
    input_image_url: input.inputImageUrl,
    result_image_url: input.resultImageUrl,
    status: 'saved',
    source: input.source,
    checklist: input.checklist ?? [],
    budget_items: input.budgetItems ?? [],
    plan_summary: input.planSummary ?? null,
    contractor_notes: input.contractorNotes ?? null,
  };

  const { data, error } = await client
    .from('design_projects')
    .insert(row)
    .select('*')
    .single();

  if (error || !data) {
    logDbWarning('saveDesignProject insert failed', error ?? 'No data returned');
    throw mapSupabaseDbError(error ?? { message: 'Insert failed' });
  }

  const project = rowToDesignProject(data as DesignProjectRow);
  localProjects.set(project.id, project);
  return project;
}

export async function saveDesignProject(input: SaveDesignProjectInput): Promise<DesignProject> {
  if (!input.projectType || !input.inputImageUrl || !input.resultImageUrl) {
    throw new DbError(DB_SAVE_FAILED_MESSAGE, 'query_failed', 'Missing required project fields');
  }

  if (!hasSupabaseConfig()) {
    return inputToLocalProject(input);
  }

  try {
    return await saveDesignProjectSupabase(input);
  } catch (error) {
    if (error instanceof DbError) {
      if (error.code === 'table_missing') {
        throw error;
      }
      throw new DbError(DB_SAVE_FAILED_MESSAGE, error.code, error.developerMessage);
    }
    logDbWarning('saveDesignProject unexpected error', error);
    throw new DbError(DB_SAVE_FAILED_MESSAGE, 'query_failed');
  }
}

async function listDesignProjectsSupabase(userId: string): Promise<DesignProject[]> {
  const client = getSupabaseClient();
  if (!client) {
    return [...localProjects.values()]
      .filter((project) => project.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const { data, error } = await client
    .from('design_projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    logDbWarning('listDesignProjectsForUser failed', error);
    throw mapSupabaseDbError(error);
  }

  const projects = (data as DesignProjectRow[]).map(rowToDesignProject);
  for (const project of projects) {
    localProjects.set(project.id, project);
  }
  return projects;
}

export async function listDesignProjectsForUser(userId = getOwnerId()): Promise<DesignProject[]> {
  if (!hasSupabaseConfig()) {
    return [...localProjects.values()]
      .filter((project) => project.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  try {
    return await listDesignProjectsSupabase(userId);
  } catch (error) {
    if (error instanceof DbError && error.code === 'table_missing') {
      throw error;
    }
    logDbWarning('listDesignProjectsForUser falling back to local cache', error);
    return [...localProjects.values()]
      .filter((project) => project.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export async function getDesignProject(projectId: string): Promise<DesignProject | null> {
  const cached = localProjects.get(projectId);
  if (cached) {
    return { ...cached };
  }

  if (!hasSupabaseConfig()) {
    return null;
  }

  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  try {
    const { data, error } = await client
      .from('design_projects')
      .select('*')
      .eq('id', projectId)
      .maybeSingle();

    if (error) {
      logDbWarning('getDesignProject failed', error);
      throw mapSupabaseDbError(error);
    }

    if (!data) {
      return null;
    }

    const project = rowToDesignProject(data as DesignProjectRow);
    localProjects.set(project.id, project);
    return project;
  } catch (error) {
    logDbWarning('getDesignProject error', error);
    return null;
  }
}

export async function deleteDesignProject(projectId: string): Promise<void> {
  localProjects.delete(projectId);

  if (!hasSupabaseConfig()) {
    return;
  }

  const client = getSupabaseClient();
  if (!client) {
    return;
  }

  const { error } = await client.from('design_projects').delete().eq('id', projectId);
  if (error) {
    logDbWarning('deleteDesignProject failed', error);
    throw mapSupabaseDbError(error);
  }
}

/** Maps a persisted design project into the Projects tab view model. */
export function designProjectToSavedMockProject(project: DesignProject): {
  id: string;
  title: string;
  projectType: string;
  projectTypeLabel: string;
  goal: string;
  resultImageUrl: string;
  inputImageUri: string;
  inputPublicUrl?: string;
  jobId?: string;
  status: 'active' | 'completed' | 'draft';
  budgetRange?: string;
  source: PickedImageSource;
  createdAt: string;
  notes?: string;
  checklist: string[];
  budgetItems: string[];
  planSummary?: string;
  contractorNotes?: string;
} {
  const uiStatus: 'active' | 'completed' | 'draft' =
    project.status === 'saved' || project.status === 'completed'
      ? 'completed'
      : project.status === 'draft'
        ? 'draft'
        : 'active';

  return {
    id: project.id,
    title: getProjectTypeLabel(project.projectType),
    projectType: project.projectType,
    projectTypeLabel: getProjectTypeLabel(project.projectType),
    goal: project.goal ?? 'Property upgrade plan',
    resultImageUrl: project.resultImageUrl,
    inputImageUri: project.inputImageUrl,
    inputPublicUrl: project.inputImageUrl,
    jobId: project.generationJobId,
    status: uiStatus,
    budgetRange: project.budgetRange,
    source: project.source,
    createdAt: project.createdAt,
    notes: project.notes,
    checklist: project.checklist,
    budgetItems: project.budgetItems,
    planSummary: project.planSummary,
    contractorNotes: project.contractorNotes,
  };
}

export { DB_TABLE_MISSING_MESSAGE, DB_LOAD_FAILED_MESSAGE, DB_SAVE_FAILED_MESSAGE };
