import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { getProjectTypeLabel, type ProjectTypeId } from '../data/mockProjectTypes';
import {
  getResultPanelCopy,
  getUpgradePlanResult,
} from '../data/mockUpgradeResults';
import type { PickedImageSource } from './imagePicker';
import { formatSourceLabel } from './imagePicker';
import type { ResultPlanViewModel } from './resultPlanData';

export const EXPORT_PLAN_ERROR_MESSAGE = "Couldn't export this plan. Please try again.";

export type ExportPlanInput = {
  projectTypeLabel: string;
  projectTypeId: string;
  goal: string;
  budgetRange: string;
  source: PickedImageSource;
  sourceLabel: string;
  inputImageUrl?: string;
  resultImageUrl?: string;
  summary: string;
  businessOutcome: string;
  contractorNotes: string;
  priorityChecklist: string[];
  suggestedMaterials: string[];
  riskNotes: string[];
  photoPrepTips: string[];
  generatedAt: string;
  planSourcePdfLabel: string;
};

export type ExportPlanResult = {
  pdfUri: string;
  shared: boolean;
};

export class ExportPlanError extends Error {
  constructor(message: string = EXPORT_PLAN_ERROR_MESSAGE) {
    super(message);
    this.name = 'ExportPlanError';
  }
}

const DISCLAIMER =
  'Estimates are planning references only. Final pricing should come from licensed professionals.';

const CONCEPT_IMAGE_DISCLAIMER =
  'Concept image is a planning reference. Final design and pricing should be verified by professionals.';

const DEFAULT_CHECKLIST = [
  'Confirm scope and photo priorities',
  'Measure key zones and traffic paths',
  'Get trade quotes for priority items',
  'Schedule work in revenue-safe phases',
];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isEmbeddableImageSrc(src?: string): src is string {
  if (!src) return false;
  return (
    src.startsWith('https://') ||
    src.startsWith('http://') ||
    src.startsWith('data:image/')
  );
}

function isLocalImageUri(uri: string): boolean {
  return (
    uri.startsWith('file://') ||
    uri.startsWith('content://') ||
    uri.startsWith('ph://') ||
    uri.startsWith('assets-library://')
  );
}

function guessMimeType(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.includes('.png')) return 'image/png';
  if (lower.includes('.webp')) return 'image/webp';
  if (lower.includes('.gif')) return 'image/gif';
  return 'image/jpeg';
}

/**
 * Converts remote URLs or local file URIs into something expo-print HTML can embed.
 * Returns undefined when conversion fails (PDF still generates without that image).
 */
export async function resolveImageForPdf(uri?: string): Promise<string | undefined> {
  if (!uri) return undefined;

  if (uri.startsWith('http://') || uri.startsWith('https://') || uri.startsWith('data:image/')) {
    return uri;
  }

  if (!isLocalImageUri(uri)) {
    return undefined;
  }

  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    if (!base64) return undefined;
    const mimeType = guessMimeType(uri);
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.warn('[SpaceFlip Pro][Export] Local image conversion failed:', { uri, error });
    return undefined;
  }
}

function formatGeneratedDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function renderImageBlock(label: string, src?: string): string {
  if (!isEmbeddableImageSrc(src)) {
    return '';
  }

  return `
    <div class="image-block">
      <p class="image-label">${escapeHtml(label)}</p>
      <img src="${src.replace(/"/g, '&quot;')}" alt="${escapeHtml(label)}" />
    </div>
  `;
}

function renderList(items: string[]): string {
  if (items.length === 0) {
    return '<p class="muted">No items listed.</p>';
  }

  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

export function exportPlanInputFromViewModel(viewModel: ResultPlanViewModel): ExportPlanInput {
  return {
    projectTypeLabel: viewModel.displayTitle,
    projectTypeId: viewModel.projectTypeId,
    goal: viewModel.goal,
    budgetRange: viewModel.budgetRange,
    source: viewModel.source,
    sourceLabel: viewModel.sourceLabel,
    inputImageUrl: viewModel.inputUri || undefined,
    resultImageUrl: viewModel.resultImageUrl || undefined,
    summary: viewModel.summary,
    businessOutcome: viewModel.businessOutcome,
    contractorNotes: viewModel.contractorNotes,
    priorityChecklist: viewModel.priorityChecklist,
    suggestedMaterials: viewModel.suggestedMaterials,
    riskNotes: viewModel.riskNotes,
    photoPrepTips: viewModel.photoPrepTips,
    generatedAt: new Date().toISOString(),
    planSourcePdfLabel: viewModel.planSourcePdfLabel,
  };
}

/**
 * Normalizes partial result data with mockUpgradeResults fallbacks.
 */
export function normalizeExportPlanInput(
  partial: Partial<ExportPlanInput> & { projectTypeId: string }
): ExportPlanInput {
  const projectTypeId = partial.projectTypeId;
  const projectTypeLabel =
    partial.projectTypeLabel ?? getProjectTypeLabel(projectTypeId as ProjectTypeId);
  const goal = partial.goal?.trim() || 'Improve this property';
  const plan = getUpgradePlanResult(projectTypeId, goal, partial.budgetRange);
  const panelCopy = getResultPanelCopy(projectTypeId);
  const source: PickedImageSource = partial.source ?? 'demo';

  return {
    projectTypeLabel,
    projectTypeId,
    goal,
    budgetRange: partial.budgetRange ?? plan.budgetRange,
    source,
    sourceLabel: partial.sourceLabel ?? formatSourceLabel(source),
    inputImageUrl: partial.inputImageUrl,
    resultImageUrl: partial.resultImageUrl,
    summary: partial.summary ?? plan.summary,
    businessOutcome: partial.businessOutcome ?? panelCopy.planSubtitle,
    contractorNotes: partial.contractorNotes ?? plan.contractorNotes,
    priorityChecklist:
      partial.priorityChecklist && partial.priorityChecklist.length > 0
        ? partial.priorityChecklist
        : plan.priorityChecklist.length > 0
          ? plan.priorityChecklist
          : DEFAULT_CHECKLIST,
    suggestedMaterials:
      partial.suggestedMaterials && partial.suggestedMaterials.length > 0
        ? partial.suggestedMaterials
        : plan.suggestedMaterials,
    riskNotes: partial.riskNotes ?? [],
    photoPrepTips: partial.photoPrepTips ?? [],
    generatedAt: partial.generatedAt ?? new Date().toISOString(),
    planSourcePdfLabel: partial.planSourcePdfLabel ?? 'Demo planning template',
  };
}

type PreparedExportPlan = ExportPlanInput & {
  resolvedInputImage?: string;
  resolvedResultImage?: string;
};

async function preparePlanForPdf(projectResult: ExportPlanInput): Promise<PreparedExportPlan> {
  const data = normalizeExportPlanInput(projectResult);
  const [resolvedInputImage, resolvedResultImage] = await Promise.all([
    resolveImageForPdf(data.inputImageUrl),
    resolveImageForPdf(data.resultImageUrl),
  ]);

  return {
    ...data,
    resolvedInputImage,
    resolvedResultImage,
  };
}

/**
 * Builds HTML for a client-ready SpaceFlip Pro upgrade plan PDF.
 */
export function buildPlanHtml(prepared: PreparedExportPlan): string {
  const inputBlock = renderImageBlock('Original Property Photo', prepared.resolvedInputImage);
  const resultBlock = renderImageBlock('Concept Reference', prepared.resolvedResultImage);
  const photosSection =
    inputBlock || resultBlock
      ? `<h2>Property Photos</h2><div class="images">${inputBlock}${resultBlock}</div><p class="concept-note">${escapeHtml(
          CONCEPT_IMAGE_DISCLAIMER
        )}</p>`
      : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>SpaceFlip Pro Upgrade Plan</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      color: #111827;
      background: #ffffff;
      margin: 0;
      padding: 32px 28px 48px;
      line-height: 1.5;
      font-size: 13px;
    }
    .brand {
      color: #1B4332;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    h1 {
      color: #1B4332;
      font-size: 26px;
      margin: 0 0 8px;
    }
    h2 {
      color: #1B4332;
      font-size: 16px;
      margin: 28px 0 10px;
      border-bottom: 2px solid #E5E7EB;
      padding-bottom: 6px;
    }
    .card {
      background: #FAFAF8;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      padding: 14px 16px;
      margin-bottom: 14px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 18px 0 8px;
    }
    .meta-item label {
      display: block;
      font-size: 10px;
      font-weight: 700;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 4px;
    }
    .meta-item p {
      margin: 0;
      font-weight: 600;
    }
    .budget {
      background: #FFFBF0;
      border: 1px solid #E8D5A3;
      border-left: 4px solid #B8860B;
      padding: 14px 16px;
      margin: 18px 0;
      border-radius: 8px;
    }
    .budget label {
      display: block;
      font-size: 10px;
      font-weight: 700;
      color: #B8860B;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 4px;
    }
    .budget p {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: #1B4332;
    }
    .images {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 12px;
    }
    .image-block {
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      padding: 10px;
      background: #FAFAF8;
    }
    .image-block img {
      width: 100%;
      height: auto;
      border-radius: 6px;
      display: block;
    }
    .image-label {
      font-size: 10px;
      font-weight: 700;
      color: #6B7280;
      text-transform: uppercase;
      margin: 0 0 8px;
    }
    .muted {
      color: #6B7280;
    }
    .concept-note {
      font-size: 10px;
      font-style: italic;
      color: #6B7280;
      margin: 8px 0 0;
    }
    ul {
      margin: 0;
      padding-left: 18px;
    }
    li {
      margin-bottom: 6px;
    }
    .disclaimer {
      margin-top: 28px;
      padding: 14px 16px;
      background: #F3F4F6;
      border-radius: 8px;
      font-size: 11px;
      color: #6B7280;
    }
    footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #E5E7EB;
      font-size: 11px;
      color: #6B7280;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="brand">SpaceFlip Pro</div>
  <h1>SpaceFlip Pro Upgrade Plan</h1>
  <p class="muted">${escapeHtml(prepared.planSourcePdfLabel)}</p>
  <p class="muted">Property upgrade planning report</p>

  <div class="meta-grid">
    <div class="meta-item">
      <label>Project Type</label>
      <p>${escapeHtml(prepared.projectTypeLabel)}</p>
    </div>
    <div class="meta-item">
      <label>Goal</label>
      <p>${escapeHtml(prepared.goal)}</p>
    </div>
    <div class="meta-item">
      <label>Photo Source</label>
      <p>${escapeHtml(prepared.sourceLabel)}</p>
    </div>
    <div class="meta-item">
      <label>Generated</label>
      <p>${escapeHtml(formatGeneratedDate(prepared.generatedAt))}</p>
    </div>
  </div>

  <div class="budget">
    <label>Budget Range</label>
    <p>${escapeHtml(prepared.budgetRange)}</p>
  </div>

  ${photosSection}

  <div class="card">
    <h2 style="margin-top:0;border:none;padding:0;">Upgrade Summary</h2>
    <p style="margin:0;">${escapeHtml(prepared.summary)}</p>
  </div>

  <div class="card">
    <h2 style="margin-top:0;border:none;padding:0;">Business Outcome</h2>
    <p style="margin:0;">${escapeHtml(prepared.businessOutcome)}</p>
  </div>

  <h2>Suggested Materials / Items</h2>
  ${renderList(prepared.suggestedMaterials)}

  <h2>Priority Checklist</h2>
  ${renderList(prepared.priorityChecklist)}

  <h2>Notes for Contractor or Client</h2>
  <p>${escapeHtml(prepared.contractorNotes)}</p>

  ${
    prepared.riskNotes.length > 0
      ? `<h2>Planning Risks &amp; Caveats</h2>${renderList(prepared.riskNotes)}`
      : ''
  }

  ${
    prepared.photoPrepTips.length > 0
      ? `<h2>Photo Prep Tips</h2>${renderList(prepared.photoPrepTips)}`
      : ''
  }

  <div class="disclaimer">${escapeHtml(DISCLAIMER)}</div>

  <footer>
    Generated ${escapeHtml(formatGeneratedDate(prepared.generatedAt))} · SpaceFlip Pro
  </footer>
</body>
</html>`;
}

/**
 * Renders the plan HTML to a PDF file on device.
 */
export async function exportPlanToPdf(projectResult: ExportPlanInput): Promise<string> {
  try {
    const prepared = await preparePlanForPdf(projectResult);
    const html = buildPlanHtml(prepared);
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    if (!uri) {
      throw new ExportPlanError();
    }

    return uri;
  } catch (error) {
    if (error instanceof ExportPlanError) {
      throw error;
    }
    console.warn('[SpaceFlip Pro][Export] PDF generation failed:', error);
    throw new ExportPlanError();
  }
}

/**
 * Opens the iOS/Android share sheet for a generated PDF.
 * Returns true when the share sheet was presented.
 */
export async function shareExportedPdf(pdfUri: string): Promise<boolean> {
  try {
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      console.warn('[SpaceFlip Pro][Export] Sharing not available on this device');
      return false;
    }

    await Sharing.shareAsync(pdfUri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: 'Share Upgrade Plan',
    });
    return true;
  } catch (error) {
    console.warn('[SpaceFlip Pro][Export] Share failed:', error);
    throw new ExportPlanError();
  }
}

/**
 * Generates a PDF and attempts to open the share sheet.
 */
export async function exportAndSharePlan(
  projectResult: Partial<ExportPlanInput> & { projectTypeId: string }
): Promise<ExportPlanResult> {
  const normalized = normalizeExportPlanInput(projectResult);
  const pdfUri = await exportPlanToPdf(normalized);
  const shared = await shareExportedPdf(pdfUri);
  return { pdfUri, shared };
}

export async function exportAndSharePlanFromViewModel(
  viewModel: ResultPlanViewModel
): Promise<ExportPlanResult> {
  return exportAndSharePlan(exportPlanInputFromViewModel(viewModel));
}
