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
  result_payload: UpgradePlanPayload | null;
  plan_source: string | null;
  ai_provider: string | null;
  status: string;
  source: string | null;
  estimated_cost_cents: number | null;
  error_message: string | null;
  concept_image_url?: string | null;
  image_provider?: string | null;
  image_generation_status?: string | null;
  image_generation_error?: string | null;
  estimated_image_cost_cents?: number | null;
  created_at: string;
  updated_at: string;
};

export type UpgradePlanPayload = {
  upgradeSummary: string;
  businessOutcome: string;
  budgetRange: string;
  suggestedMaterials: string[];
  priorityChecklist: string[];
  contractorNotes: string;
  riskNotes: string[];
  photoPrepTips: string[];
};

export type PlanSource = 'ai' | 'mock';

export type AiProvider = 'gemini' | 'groq' | 'mock';

export type GenerateUpgradePlanTextInput = {
  projectType: string;
  goal: string | null;
  budgetRange: string | null;
  notes: string | null;
  inputPublicUrl: string;
  prompt: string;
};

export type GenerateUpgradePlanTextResult = {
  payload: UpgradePlanPayload;
  source: PlanSource;
  provider: AiProvider;
  estimatedCostCents: number;
};

export type GenerateUpgradePlanRequest = {
  jobId: string;
  userId?: string;
};

export type GenerateUpgradePlanResponse = {
  ok: boolean;
  jobId?: string;
  resultImageUrl?: string;
  resultPayload?: UpgradePlanPayload;
  planSource?: PlanSource;
  aiProvider?: AiProvider;
  estimatedCostCents?: number;
  promptPreview?: string;
  /** Phase 18 — AI concept image generation. */
  conceptImageUrl?: string;
  imageProvider?: string;
  imageGenerationStatus?: string;
  estimatedImageCostCents?: number;
  error?: string;
};
