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
  const budgetRange = plan.budgetRange ?? store.selectedBudgetRange ?? '$2,500 – $7,500';

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
    summary: plan.summary ?? 'Your property upgrade plan is ready.',
    businessOutcome: panelCopy.planSubtitle,
    contractorNotes: plan.contractorNotes ?? 'Scope notes will appear here.',
    priorityChecklist: plan.priorityChecklist ?? [],
    suggestedMaterials: plan.suggestedMaterials ?? [],
    resultUrls: [...resultUrls],
  };
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
