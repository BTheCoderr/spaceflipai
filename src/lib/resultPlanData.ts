import type { ProjectTypeId } from '../data/mockProjectTypes';
import { getProjectTypeById, getProjectTypeLabel } from '../data/mockProjectTypes';
import {
  getResultPanelCopy,
  getUpgradePlanResult,
  type ResultPanelCopy,
  type UpgradePlanResult,
} from '../data/mockUpgradeResults';
import type { PickedImageSource } from './imagePicker';
import { formatSourceLabel } from './imagePicker';
import type { GenerationJob } from './generationJobs';
import type { AiProvider, PlanSource, UpgradePlanPayload } from './upgradePlanPayload';
import { aiProviderDevLabel, planSourceLabel, planSourcePdfLabel } from './upgradePlanPayload';

export type ResultPlanParams = {
  projectType?: string;
  projectTitle?: string;
  goal?: string;
  imageUrl?: string;
  inputImageUrl?: string;
};

export type ResultPlanStoreSlice = {
  selectedGoal?: string;
  selectedBudgetRange?: string;
  mockResultImageUrl?: string;
  mockResultIndex: number;
  currentUpgradePlan?: UpgradePlanResult;
  currentResultPayload?: UpgradePlanPayload;
  currentPlanSource?: PlanSource;
  currentAiProvider?: AiProvider;
  currentJob?: GenerationJob;
  uploadedInputPublicUrl?: string;
  selectedInputImage?: { uri: string; source: PickedImageSource };
};

/** Single source of truth for Result screen tabs and PDF export. */
export type ResultPlanViewModel = {
  projectTypeId: string;
  displayTitle: string;
  goal: string;
  budgetRange: string;
  inputUri: string;
  resultImageUrl: string;
  source: PickedImageSource;
  sourceLabel: string;
  plan: UpgradePlanResult;
  panelCopy: ResultPanelCopy;
  summary: string;
  businessOutcome: string;
  contractorNotes: string;
  priorityChecklist: string[];
  suggestedMaterials: string[];
  riskNotes: string[];
  photoPrepTips: string[];
  planSource: PlanSource;
  planSourceLabel: string;
  planSourcePdfLabel: string;
  aiProvider?: AiProvider;
  aiProviderDevLabel?: string;
  resultUrls: string[];
};

export function buildResultPlanViewModel(
  params: ResultPlanParams,
  store: ResultPlanStoreSlice
): ResultPlanViewModel {
  const projectTypeId = params.projectType ?? store.currentJob?.toolId ?? 'empty-commercial';
  const displayTitle = params.projectTitle ?? getProjectTypeLabel(projectTypeId);
  const goal = params.goal || store.selectedGoal || 'Improve this property';

  const planFromStore = store.currentUpgradePlan;
  const plan =
    planFromStore ??
    getUpgradePlanResult(projectTypeId as ProjectTypeId, goal, store.selectedBudgetRange);

  const resultUrls = plan.resultImageUrls ?? [
    params.imageUrl ?? 'https://images.unsplash.com/photo-1618221197160-8070ed78f1c9?w=600',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600',
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600',
  ];

  const resultImageUrl =
    store.mockResultImageUrl ??
    store.currentJob?.resultImageUrl ??
    resultUrls[store.mockResultIndex % resultUrls.length] ??
    params.imageUrl ??
    resultUrls[0];

  const inputUri =
    params.inputImageUrl ||
    store.uploadedInputPublicUrl ||
    store.currentJob?.inputPublicUrl ||
    store.currentJob?.inputImageUri ||
    store.selectedInputImage?.uri ||
    '';

  const source: PickedImageSource =
    store.selectedInputImage?.source ?? store.currentJob?.source ?? 'demo';

  const panelCopy = getResultPanelCopy(projectTypeId);
  const aiPayload = store.currentResultPayload ?? parseJobResultPayload(store.currentJob?.resultPayload);
  const planSource: PlanSource =
    store.currentPlanSource ??
    (store.currentJob?.planSource === 'ai' ? 'ai' : 'mock');
  const aiProvider: AiProvider =
    store.currentAiProvider ??
    parseAiProvider(store.currentJob?.aiProvider) ??
    (planSource === 'ai' ? 'gemini' : 'mock');
  const budgetRange =
    aiPayload?.budgetRange ??
    plan.budgetRange ??
    store.selectedBudgetRange ??
    '$2,500 – $7,500';

  return {
    projectTypeId,
    displayTitle,
    goal,
    budgetRange,
    inputUri,
    resultImageUrl,
    source,
    sourceLabel: formatSourceLabel(source),
    plan,
    panelCopy,
    summary: aiPayload?.upgradeSummary ?? plan.summary ?? 'Your property upgrade plan is ready.',
    businessOutcome: aiPayload?.businessOutcome ?? panelCopy.planSubtitle,
    contractorNotes: aiPayload?.contractorNotes ?? plan.contractorNotes ?? 'Scope notes will appear here.',
    priorityChecklist: aiPayload?.priorityChecklist ?? plan.priorityChecklist ?? [],
    suggestedMaterials: aiPayload?.suggestedMaterials ?? plan.suggestedMaterials ?? [],
    riskNotes: aiPayload?.riskNotes ?? [],
    photoPrepTips: aiPayload?.photoPrepTips ?? [],
    planSource,
    planSourceLabel: planSourceLabel(planSource),
    planSourcePdfLabel: planSourcePdfLabel(planSource),
    aiProvider,
    aiProviderDevLabel: aiProviderDevLabel(aiProvider),
    resultUrls: [...resultUrls],
  };
}

function parseAiProvider(value?: string): AiProvider | undefined {
  if (value === 'gemini' || value === 'groq' || value === 'mock') {
    return value;
  }
  return undefined;
}

function parseJobResultPayload(
  payload?: Record<string, unknown>
): UpgradePlanPayload | undefined {
  if (!payload || typeof payload !== 'object') return undefined;
  const record = payload as Record<string, unknown>;
  if (
    typeof record.upgradeSummary !== 'string' ||
    typeof record.businessOutcome !== 'string' ||
    typeof record.contractorNotes !== 'string'
  ) {
    return undefined;
  }
  return record as unknown as UpgradePlanPayload;
}

export function getResultDisplayImageUrl(
  viewModel: ResultPlanViewModel,
  showBefore: boolean
): string {
  if (showBefore && viewModel.inputUri) {
    return viewModel.inputUri;
  }
  return viewModel.resultImageUrl;
}
