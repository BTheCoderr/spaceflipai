import type { PromptParams } from '../lib/ai/types';

export type SubscriptionPlan = 'free' | 'pro';

export type GenerationJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export type GenerationJobType = 'style_transfer' | 'painting' | 'design_tool';

export type UserProfile = {
  id: string;
  email?: string;
  displayName?: string;
  plan: SubscriptionPlan;
  isPro: boolean;
  generationsRemaining: number;
  generationsUsedThisMonth: number;
  quotaResetAt?: string;
  totalEstimatedCostThisMonth?: number;
  trialAvailable: boolean;
  createdAt: string;
};

export type DesignProject = {
  id: string;
  userId: string;
  title: string;
  roomType: string;
  designStyle: string;
  thumbnailUrl: string;
  status: 'draft' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
};

export type UploadedPhoto = {
  id: string;
  userId: string;
  storagePath: string;
  publicUrl: string;
  mimeType: string;
  width?: number;
  height?: number;
  createdAt: string;
};

export type GeneratedDesign = {
  id: string;
  projectId?: string;
  jobId: string;
  imageUrl: string;
  prompt?: string;
  promptParams?: PromptParams;
  roomType: string;
  designStyle: string;
  createdAt: string;
};

export type DesignStyle = {
  id: string;
  name: string;
  category: 'interior' | 'exterior' | 'commercial' | 'recommend';
  imageUrl: string;
  isPremium: boolean;
};

export type DesignTool = {
  id: string;
  title: string;
  subtitle?: string;
  category: 'recommend' | 'interior' | 'exterior' | 'commercial';
  imageUrl: string;
  route: string;
};

export type AssistantPersona = {
  id: string;
  name: string;
  tagline: string;
  avatarUrl?: string;
  emoji: string;
  category: string;
};

export type GenerationJob = {
  id: string;
  userId: string;
  projectId?: string;
  type: GenerationJobType;
  status: GenerationJobStatus;
  inputPhotoId?: string;
  inputPhotoStoragePath?: string;
  outputStoragePath?: string;
  roomType: string;
  designStyle: string;
  promptText?: string;
  promptParams?: PromptParams;
  resultUrl?: string;
  error?: string;
  providerName?: 'openai' | 'replicate';
  estimatedProviderCost?: number;
  promptTokenEstimate?: number;
  parentJobId?: string;
  regenerateCount: number;
  toolId?: string;
  inputImageUrl?: string;
  resultIndex?: number;
  userPrompt?: string;
  createdAt: string;
  completedAt?: string;
  processingStartedAt?: string;
};

export type Database = {
  profiles: UserProfile;
  design_projects: DesignProject;
  uploaded_photos: UploadedPhoto;
  generation_jobs: GenerationJob;
  generated_designs: GeneratedDesign;
};

export const REGENERATE_POLICY = {
  maxRegeneratesPerChain: 2,
  cooldownMs: 30_000,
} as const;

export const QUOTA_LIMITS = {
  freeTotal: 3,
  proMonthly: 100,
} as const;
