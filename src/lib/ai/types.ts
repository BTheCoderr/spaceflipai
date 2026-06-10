export type SpaceType = 'interior' | 'garden' | 'office' | 'airbnb' | 'retail';

export type DesignStyleTag =
  | 'scandinavian'
  | 'modern'
  | 'luxury'
  | 'minimalist'
  | 'bohemian'
  | 'industrial'
  | 'cozy'
  | 'commercial';

export type DesignTask =
  | 'redesign'
  | 'replace'
  | 'rearrange'
  | 'declutter'
  | 'remove'
  | 'cleanup'
  | 'floor'
  | 'window'
  | 'decor';

export type PromptConstraint =
  | 'preserve_walls'
  | 'preserve_windows'
  | 'preserve_doors'
  | 'preserve_room_structure'
  | 'keep_existing_flooring'
  | 'remove_clutter'
  | 'add_furniture'
  | 'generate_shopping_list';

export type PromptParams = {
  spaceType: SpaceType;
  style: DesignStyleTag;
  task: DesignTask;
  constraints: PromptConstraint[];
  roomLabel?: string;
  targetItem?: string;
  userNotes?: string;
};

export type AIProviderInput = {
  sourceImageUrl: string;
  prompt: string;
  aspectRatio?: string;
};

export type AIProviderOutput = {
  imageUrl: string;
  estimatedCostUsd: number;
  providerJobId?: string;
};

export type AIImageProvider = {
  name: 'openai' | 'replicate';
  estimateCostUsd: (input: AIProviderInput) => number;
  generate: (input: AIProviderInput) => Promise<AIProviderOutput>;
};

export type GenerationErrorCode =
  | 'quota_exceeded'
  | 'regenerate_limit'
  | 'cooldown'
  | 'not_found'
  | 'provider_error';
