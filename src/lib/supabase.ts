import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';
import { env } from './config';

let supabaseClient: SupabaseClient | null = null;
let warnedMissingConfig = false;
let loggedConfigStatus = false;

/** Fallback owner id used only when Supabase is unconfigured or auth is unavailable. */
export const LOCAL_FALLBACK_USER_ID = 'demo-user';

/** Cached id of the active Supabase user (anonymous or linked). Null when signed out. */
let currentUserId: string | null = null;

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
        // Persist the anonymous/linked session across launches so user_id is stable.
        storage: AsyncStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });

    // Keep the cached user id in sync with the session lifecycle.
    supabaseClient.auth.onAuthStateChange((_event, session) => {
      currentUserId = session?.user?.id ?? null;
    });
  }

  return supabaseClient;
}

/** The active Supabase user id, or null when signed out / unconfigured. */
export function getActiveUserId(): string | null {
  return currentUserId;
}

/** The id to use for backend ownership: real auth uid, or local fallback. */
export function getOwnerId(): string {
  return currentUserId ?? LOCAL_FALLBACK_USER_ID;
}

/** Returns the current Supabase session (and refreshes the cached user id). */
export async function getCurrentSession(): Promise<Session | null> {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  currentUserId = data.session?.user?.id ?? null;
  return data.session;
}

export type AnonSignInResult = {
  userId: string | null;
  isAnonymous: boolean;
  error?: string;
};

/**
 * Ensures an active Supabase session, creating an anonymous user on first use.
 * Restores an existing session when one is already persisted.
 */
export async function signInAnonymouslyIfNeeded(): Promise<AnonSignInResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { userId: null, isAnonymous: false, error: 'supabase_unconfigured' };
  }

  const { data: sessionData } = await client.auth.getSession();
  if (sessionData.session?.user) {
    currentUserId = sessionData.session.user.id;
    return {
      userId: currentUserId,
      isAnonymous: sessionData.session.user.is_anonymous ?? false,
    };
  }

  const { data, error } = await client.auth.signInAnonymously();
  if (error || !data.user) {
    // Do not log the raw error object (may contain request context); message only.
    console.warn('[SpaceFlip Pro][Auth] Anonymous sign-in failed:', error?.message ?? 'unknown');
    return { userId: null, isAnonymous: false, error: error?.message ?? 'anon_sign_in_failed' };
  }

  currentUserId = data.user.id;
  return { userId: currentUserId, isAnonymous: data.user.is_anonymous ?? true };
}

/** Signs out of Supabase and clears the cached user id. */
export async function signOutSupabase(): Promise<void> {
  const client = getSupabaseClient();
  if (!client) {
    currentUserId = null;
    return;
  }
  try {
    await client.auth.signOut();
  } catch (error) {
    console.warn(
      '[SpaceFlip Pro][Auth] Sign-out error:',
      error instanceof Error ? error.message : 'unknown'
    );
  } finally {
    currentUserId = null;
  }
}
