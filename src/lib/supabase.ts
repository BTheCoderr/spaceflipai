import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from './config';

let supabaseClient: SupabaseClient | null = null;
let warnedMissingConfig = false;
let loggedConfigStatus = false;

/**
 * Public env vars (set in .env):
 * - EXPO_PUBLIC_SUPABASE_URL
 * - EXPO_PUBLIC_SUPABASE_ANON_KEY
 */
export function hasSupabaseConfig(): boolean {
  return Boolean(
    process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  );
}

function logSupabaseConfigStatus(): void {
  if (!__DEV__ || loggedConfigStatus) return;
  loggedConfigStatus = true;
  console.log('[SpaceFlip Pro] Supabase configured:', hasSupabaseConfig());
}

if (__DEV__) {
  logSupabaseConfigStatus();
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
        '[SpaceFlip Pro] Supabase env vars missing — using local mock upload/job behavior.'
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
