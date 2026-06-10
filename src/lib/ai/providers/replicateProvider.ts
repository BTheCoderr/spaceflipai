import type { AIImageProvider, AIProviderInput } from '../types';

function getServerEnv(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key];
  }
  return undefined;
}

/**
 * SERVER ONLY — deploy to supabase/functions/_shared/ai/
 * Uses REPLICATE_API_TOKEN from edge secrets, never EXPO_PUBLIC_*.
 */
export const replicateProvider: AIImageProvider = {
  name: 'replicate',

  estimateCostUsd(_input: AIProviderInput): number {
    return 0.04;
  },

  async generate(input: AIProviderInput) {
    const apiToken = getServerEnv('REPLICATE_API_TOKEN');
    if (!apiToken) {
      throw new Error('REPLICATE_API_TOKEN not configured in edge secrets');
    }

    const model = getServerEnv('REPLICATE_MODEL') ?? 'black-forest-labs/flux-dev';

    // Placeholder for Replicate predictions API
    return {
      imageUrl: input.sourceImageUrl,
      estimatedCostUsd: 0.04,
      providerJobId: `replicate-mock-${model}-${Date.now()}`,
    };
  },
};
