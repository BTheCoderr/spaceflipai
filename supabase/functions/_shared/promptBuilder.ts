import type { GenerationJobRecord } from './types.ts';

const PROJECT_PROMPTS: Record<string, string> = {
  'airbnb-unit':
    'Create a realistic property upgrade concept for this Airbnb unit. Focus on stronger listing photo appeal, guest confidence, brighter staging, practical furniture placement, and a budget-aware checklist. Preserve room structure, windows, doors, and flooring unless the user requested changes.',
  'office-space':
    'Create a realistic office upgrade concept. Focus on desk layout, walking paths, meeting zones, reception flow, and professional appearance.',
  'retail-store':
    'Create a realistic retail improvement concept. Focus on customer flow, product visibility, checkout path, display zones, and storefront appeal.',
  restaurant:
    'Create a realistic restaurant upgrade concept. Focus on seating mix, guest paths, waiting areas, service flow, and front-of-house clarity.',
  'salon-studio':
    'Create a realistic salon or studio upgrade concept. Focus on station layout, client flow, reception queue, and premium presentation.',
  'backyard-landscape':
    'Create a realistic curb appeal and outdoor upgrade concept. Focus on low-maintenance improvements, lighting, seating zones, plant groupings, and property value.',
  'home-exterior':
    'Create a realistic home exterior upgrade concept. Focus on curb appeal, entry presentation, lighting, trim, and perceived property value.',
  'real-estate-listing':
    'Create a realistic listing prep upgrade concept. Focus on buyer appeal, photo-ready staging, decluttering, and rooms buyers see first online.',
  'empty-commercial':
    'Create a realistic empty commercial shell upgrade concept. Focus on tenant-ready zoning, storefront appeal, clear use zones, and leasable presentation.',
};

const DEFAULT_PROMPT =
  'Create a realistic property upgrade concept for this commercial or residential space. Focus on practical improvements, budget-aware scope, and preserving structural elements unless the user requested changes.';

function formatBudget(budgetRange: string | null): string {
  if (!budgetRange?.trim()) return 'Budget: not specified — suggest practical phased options.';
  return `Budget range: ${budgetRange.trim()}.`;
}

function formatGoal(goal: string | null): string {
  if (!goal?.trim()) return 'Primary goal: improve the property for its intended use.';
  return `Primary goal: ${goal.trim()}.`;
}

function formatNotes(notes: string | null): string {
  if (!notes?.trim()) return '';
  return `Additional notes: ${notes.trim()}`;
}

/**
 * Builds a SpaceFlip Pro upgrade prompt from a generation job row.
 */
export function buildUpgradePrompt(job: GenerationJobRecord): string {
  const projectType = job.project_type ?? 'empty-commercial';
  const typePrompt = PROJECT_PROMPTS[projectType] ?? DEFAULT_PROMPT;
  const imageUrl = job.input_public_url ?? job.input_image_uri ?? '';

  const sections = [
    'SpaceFlip Pro — property upgrade concept request.',
    `Project type: ${projectType.replace(/-/g, ' ')}.`,
    typePrompt,
    formatGoal(job.goal),
    formatBudget(job.budget_range),
    formatNotes(job.notes),
    imageUrl ? `Input property photo: ${imageUrl}` : 'Input property photo: not provided.',
    'Output: one realistic upgraded concept image plus a practical upgrade plan. Preserve architecture unless scope says otherwise.',
  ].filter(Boolean);

  return sections.join('\n\n');
}
