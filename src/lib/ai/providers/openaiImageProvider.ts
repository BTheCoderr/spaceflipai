import type { AIImageProvider, AIProviderInput } from '../types';

function getServerEnv(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key];
  }
  return undefined;
}

/**
 * SERVER ONLY — deploy to supabase/functions/_shared/ai/
 * Uses OPENAI_API_KEY from edge secrets, never EXPO_PUBLIC_*.
 */
export const openaiImageProvider: AIImageProvider = {
  name: 'openai',

  estimateCostUsd(_input: AIProviderInput): number {
    return 0.06;
  },

  async generate(input: AIProviderInput) {
    const apiKey = getServerEnv('OPENAI_API_KEY');
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured in edge secrets');
    }

    // Placeholder for OpenAI Images API / edits endpoint
    return {
      imageUrl: input.sourceImageUrl,
      estimatedCostUsd: 0.06,
      providerJobId: `openai-mock-${Date.now()}`,
    };
  },
};
