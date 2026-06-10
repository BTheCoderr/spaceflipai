import type { AIImageProvider } from '../types';
import { openaiImageProvider } from './openaiImageProvider';
import { replicateProvider } from './replicateProvider';

function getServerEnv(key: string): string | undefined {
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key];
  }
  return undefined;
}

/**
 * SERVER ONLY — select AI provider via AI_PROVIDER edge secret.
 * Never call from mobile screens with API keys.
 */
export function getAIProvider(): AIImageProvider {
  const providerName = getServerEnv('AI_PROVIDER') ?? 'replicate';
  return providerName === 'openai' ? openaiImageProvider : replicateProvider;
}
