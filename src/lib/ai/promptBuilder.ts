import type { DesignStyleTag, DesignTask, PromptConstraint, PromptParams, SpaceType } from './types';

const CONSTRAINT_PHRASES: Record<PromptConstraint, string> = {
  preserve_walls: 'Preserve existing wall positions and colors unless the task requires a change.',
  preserve_windows: 'Do not move or resize windows.',
  preserve_doors: 'Keep door locations unchanged.',
  preserve_room_structure: 'Maintain the room layout and architectural structure.',
  keep_existing_flooring: 'Retain the current flooring material and pattern.',
  remove_clutter: 'Remove visual clutter and unnecessary objects.',
  add_furniture: 'Add appropriate furniture suited to the space type.',
  generate_shopping_list: 'Include a concise shopping list as separate metadata.',
};

const STYLE_PHRASES: Record<DesignStyleTag, string> = {
  scandinavian: 'Scandinavian style with light woods, neutral tones, and clean lines',
  modern: 'modern contemporary style with sleek finishes',
  luxury: 'luxury high-end style with premium materials',
  minimalist: 'minimalist style with simplified forms and restrained palette',
  bohemian: 'bohemian eclectic style with layered textures',
  industrial: 'industrial style with metal accents and raw materials',
  cozy: 'cozy warm style with soft textiles and inviting atmosphere',
  commercial: 'commercial-grade professional layout',
};

const SPACE_PHRASES: Record<SpaceType, string> = {
  interior: 'interior residential space',
  garden: 'outdoor garden and landscaping area',
  office: 'commercial office workspace',
  airbnb: 'short-term rental space optimized for guest appeal and listing photos',
  retail: 'retail store environment',
};

const TASK_INTROS: Record<DesignTask, (params: PromptParams) => string> = {
  redesign: (p) => `Redesign this ${p.roomLabel ?? SPACE_PHRASES[p.spaceType]} in ${STYLE_PHRASES[p.style]}.`,
  replace: (p) =>
    `Replace the existing ${p.targetItem ?? 'furniture piece'} in this ${p.roomLabel ?? 'room'} with a ${STYLE_PHRASES[p.style]} alternative.`,
  rearrange: (p) =>
    `Rearrange furniture in this ${p.roomLabel ?? SPACE_PHRASES[p.spaceType]} for better flow using ${STYLE_PHRASES[p.style]}.`,
  declutter: (p) =>
    `Declutter and simplify this ${p.roomLabel ?? SPACE_PHRASES[p.spaceType]} while keeping a ${STYLE_PHRASES[p.style]} look.`,
  remove: (p) =>
    `Remove unwanted elements from this ${p.roomLabel ?? 'space'} and refine the ${STYLE_PHRASES[p.style]} design.`,
  cleanup: (p) =>
    `Clean up and organize this ${p.roomLabel ?? SPACE_PHRASES[p.spaceType]} with a polished ${STYLE_PHRASES[p.style]} finish.`,
  floor: (p) =>
    `Update flooring in this ${p.roomLabel ?? 'room'} to complement a ${STYLE_PHRASES[p.style]} design.`,
  window: (p) =>
    `Enhance window treatments and natural light for this ${p.roomLabel ?? 'room'} in ${STYLE_PHRASES[p.style]}.`,
  decor: (p) =>
    `Add decor and styling details to this ${p.roomLabel ?? SPACE_PHRASES[p.spaceType]} using ${STYLE_PHRASES[p.style]}.`,
};

export function validatePromptParams(params: PromptParams): string | null {
  if (params.task === 'replace' && !params.targetItem) {
    return 'Replace task requires a targetItem.';
  }
  if (params.constraints.length === 0) {
    return 'At least one constraint is recommended.';
  }
  return null;
}

export function buildPrompt(params: PromptParams): string {
  const intro = TASK_INTROS[params.task](params);
  const constraintLines = params.constraints.map((c) => CONSTRAINT_PHRASES[c]);
  const parts = [intro, ...constraintLines];

  if (params.userNotes) {
    parts.push(`Additional notes: ${params.userNotes}`);
  }

  parts.push('Photorealistic, well-lit, professional interior design visualization.');
  return parts.join(' ');
}

export function buildNegativePrompt(params: PromptParams): string {
  const negatives = ['blurry', 'distorted perspective', 'watermark', 'text overlay'];
  if (params.constraints.includes('preserve_walls')) negatives.push('moved walls');
  if (params.constraints.includes('preserve_windows')) negatives.push('blocked windows');
  return negatives.join(', ');
}

export function estimateTokens(prompt: string): number {
  return Math.ceil(prompt.split(/\s+/).length * 1.3);
}

export function mapRoomTypeToPromptParams(
  roomType: string,
  designStyle: string
): PromptParams {
  const lower = roomType.toLowerCase();
  let spaceType: SpaceType = 'interior';
  if (lower.includes('garden') || lower.includes('backyard') || lower.includes('patio') || lower.includes('yard')) {
    spaceType = 'garden';
  } else if (lower.includes('office') || lower.includes('commercial')) {
    spaceType = 'office';
  } else if (lower.includes('airbnb') || lower.includes('rental')) {
    spaceType = 'airbnb';
  } else if (lower.includes('retail') || lower.includes('store')) {
    spaceType = 'retail';
  }

  const styleKey = designStyle.toLowerCase();
  let style: DesignStyleTag = 'modern';
  if (styleKey.includes('scandi')) style = 'scandinavian';
  else if (styleKey.includes('minimal')) style = 'minimalist';
  else if (styleKey.includes('luxury')) style = 'luxury';
  else if (styleKey.includes('bohemian') || styleKey.includes('boho')) style = 'bohemian';
  else if (styleKey.includes('industrial')) style = 'industrial';
  else if (styleKey.includes('cozy')) style = 'cozy';
  else if (styleKey.includes('commercial')) style = 'commercial';

  return {
    spaceType,
    style,
    task: 'redesign',
    constraints: ['preserve_room_structure', 'preserve_windows', 'add_furniture'],
    roomLabel: roomType,
    userNotes: `Target style: ${designStyle}`,
  };
}
