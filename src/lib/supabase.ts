import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from './config';

let supabaseClient: SupabaseClient | null = null;
let warnedMissingConfig = false;

export function hasSupabaseConfig(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

/**
 * Returns a Supabase client when public env vars are set.
 * Never throws — returns null when unconfigured.
 * Service role keys must NEVER be used in the mobile app.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!hasSupabaseConfig()) {
    if (!warnedMissingConfig && __DEV__) {
      console.warn(
        '[SpaceFlip] Supabase env vars missing — using local mock upload/job behavior.'
      );
      warnedMissingConfig = true;
    }
    return null;
  }

  if (!supabaseClient) {
    supabaseClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseClient;
}

/** Convenience alias — same as getSupabaseClient(). */
export const supabase = {
  get client(): SupabaseClient | null {
    return getSupabaseClient();
  },
};
