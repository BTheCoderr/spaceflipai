/** Row shape from public.generation_jobs (Edge Function / prompt builder). */
export type GenerationJobRecord = {
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

export type GenerateUpgradePlanRequest = {
  jobId: string;
  userId?: string;
};

export type GenerateUpgradePlanResponse = {
  ok: boolean;
  jobId?: string;
  resultImageUrl?: string;
  promptPreview?: string;
  error?: string;
};
