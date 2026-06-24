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
  currentImageProvider?: string;
  currentConceptImageGenerated?: boolean;
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
  /** True only when a real AI concept image exists (status completed + URL). */
  conceptImageGenerated: boolean;
  /** True only when a real generated concept image URL is available to show. */
  hasRealConceptImage: boolean;
  /** The image to display: real concept when available, else the original photo. */
  displayVisualUrl: string;
  /** Visual label: "AI Concept Reference" when real, else "Property Photo". */
  displayVisualLabel: string;
  /** Visual subtitle explaining what the image is. */
  displayVisualSubtitle: string;
  /** Whether concept-specific actions (before/after, regenerate) should be shown. */
  showConceptActions: boolean;
  /** Backward-compatible alias for displayVisualUrl. */
  visualImageUrl: string;
  /** Backward-compatible alias for displayVisualLabel. */
  visualImageLabel: string;
  /** Result-screen badge (same as displayVisualLabel). */
  conceptBadgeLabel: string;
  /** PDF image label for a real concept image. */
  conceptPdfLabel: string;
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

  const inputUri =
    params.inputImageUrl ||
    store.uploadedInputPublicUrl ||
    store.currentJob?.inputPublicUrl ||
    store.currentJob?.inputImageUri ||
    store.selectedInputImage?.uri ||
    '';

  const source: PickedImageSource =
    store.selectedInputImage?.source ?? store.currentJob?.source ?? 'gallery';

  const conceptImageGenerated = Boolean(
    store.currentConceptImageGenerated ??
      store.currentJob?.imageGenerationStatus === 'completed'
  );

  // A real AI concept image only exists when generation completed AND a URL is present.
  // Otherwise we always fall back to the user's original property photo — never a stock image.
  const realConceptUrl = conceptImageGenerated
    ? store.currentJob?.conceptImageUrl ??
      store.mockResultImageUrl ??
      store.currentJob?.resultImageUrl ??
      undefined
    : undefined;
  const hasRealConceptImage = Boolean(realConceptUrl);

  const displayVisualUrl = hasRealConceptImage ? (realConceptUrl as string) : inputUri;
  const displayVisualLabel = hasRealConceptImage ? 'AI Concept Reference' : 'Property Photo';
  const displayVisualSubtitle = hasRealConceptImage
    ? 'Generated from your property photo and upgrade goals.'
    : 'Photo used to create this upgrade plan.';
  const showConceptActions = hasRealConceptImage;
  const resultImageUrl = displayVisualUrl;
  const resultUrls = displayVisualUrl ? [displayVisualUrl] : [];

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
    conceptImageGenerated,
    hasRealConceptImage,
    displayVisualUrl,
    displayVisualLabel,
    displayVisualSubtitle,
    showConceptActions,
    visualImageUrl: displayVisualUrl,
    visualImageLabel: displayVisualLabel,
    conceptBadgeLabel: displayVisualLabel,
    conceptPdfLabel: 'AI Concept Reference',
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
  return viewModel.visualImageUrl;
}
