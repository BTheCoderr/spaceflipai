import { isSupabaseConfigured } from './config';

/**
 * Minimal Supabase client shape for future @supabase/supabase-js integration.
 * AI provider keys must NEVER be stored here — edge functions only.
 */
export type SupabaseClient = {
  auth: {
    getSession: () => Promise<{ data: { session: { access_token: string } | null } }>;
  };
  storage: {
    from: (bucket: string) => {
      upload: (path: string, file: unknown, options?: unknown) => Promise<{ data: unknown; error: Error | null }>;
      getPublicUrl: (path: string) => { data: { publicUrl: string } };
    };
  };
  functions: {
    invoke: (name: string, options?: { body?: unknown }) => Promise<{ data: unknown; error: Error | null }>;
  };
  from: (table: string) => {
    select: (columns?: string) => unknown;
    insert: (row: unknown) => unknown;
    update: (row: unknown) => unknown;
  };
};

let warnedOnce = false;

function createStubClient(): SupabaseClient {
  const notWired = () => {
    if (!warnedOnce) {
      console.warn('[SpaceFlip] Supabase env vars set but client not wired yet. Using mocks.');
      warnedOnce = true;
    }
    throw new Error('Supabase client not wired — see BACKEND_PLAN.md');
  };

  return {
    auth: { getSession: async () => notWired() as never },
    storage: { from: () => ({ upload: async () => notWired() as never, getPublicUrl: () => notWired() as never }) },
    functions: { invoke: async () => notWired() as never },
    from: () => ({ select: () => notWired(), insert: () => notWired(), update: () => notWired() }),
  };
}

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  // Future: import { createClient } from '@supabase/supabase-js'
  // return createClient(env.supabaseUrl, env.supabaseAnonKey);
  return createStubClient();
}
