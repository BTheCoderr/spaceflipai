import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  getCurrentSession,
  hasSupabaseConfig,
  signInAnonymouslyIfNeeded,
  signOutSupabase,
} from './supabase';

const ONBOARDED_KEY = 'spaceflip.onboarded.v1';
const PROFILE_KEY = 'spaceflip.profile.v1';

/** Lightweight local profile — display-only. Ownership is the Supabase user id. */
export type LocalProfile = {
  name: string;
  email?: string;
  /** True when the user continued without entering details. */
  guest: boolean;
};

type ProfileContextValue = {
  /** False until persisted state has loaded from storage. */
  ready: boolean;
  loading: boolean;
  onboarded: boolean;
  profile: LocalProfile | null;
  /** Active Supabase user id (anonymous or linked). Null until signed in. */
  supabaseUserId: string | null;
  isAnonymous: boolean;
  completeOnboarding: () => Promise<void>;
  signInLocal: (input: {
    name?: string;
    email?: string;
    guest?: boolean;
  }) => Promise<{ backendReady: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [profile, setProfile] = useState<LocalProfile | null>(null);
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [onboardedRaw, profileRaw] = await AsyncStorage.multiGet([
          ONBOARDED_KEY,
          PROFILE_KEY,
        ]);
        if (!active) return;
        setOnboarded(onboardedRaw[1] === 'true');
        const storedProfile = profileRaw[1]
          ? (JSON.parse(profileRaw[1]) as LocalProfile)
          : null;
        if (storedProfile) {
          setProfile(storedProfile);
        }

        // Restore an existing Supabase session (anonymous or linked) if present.
        const session = await getCurrentSession();
        if (!active) return;

        // A returning user with a saved profile but no session (e.g. cleared
        // storage) should get a fresh anonymous workspace so saving keeps working.
        if (!session && storedProfile && hasSupabaseConfig()) {
          const result = await signInAnonymouslyIfNeeded();
          if (!active) return;
          if (result.userId) {
            setSupabaseUserId(result.userId);
            setIsAnonymous(result.isAnonymous);
          }
        } else if (session?.user) {
          setSupabaseUserId(session.user.id);
          setIsAnonymous(session.user.is_anonymous ?? false);
        }
      } catch {
        // Treat unreadable storage as a fresh install.
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const completeOnboarding = useCallback(async () => {
    setOnboarded(true);
    try {
      await AsyncStorage.setItem(ONBOARDED_KEY, 'true');
    } catch {
      // Non-fatal: onboarding will simply show again next launch.
    }
  }, []);

  const signInLocal = useCallback<ProfileContextValue['signInLocal']>(async (input) => {
    setLoading(true);
    try {
      // Behind the scenes, ensure a private Supabase (anonymous) workspace exists.
      const result = await signInAnonymouslyIfNeeded();
      setSupabaseUserId(result.userId);
      setIsAnonymous(result.isAnonymous);

      const next: LocalProfile = {
        name: input.name?.trim() || 'SpaceFlip User',
        email: input.email?.trim() || undefined,
        guest: input.guest ?? !input.name?.trim(),
      };
      setProfile(next);
      try {
        await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(next));
      } catch {
        // Non-fatal: profile stays in memory for this session.
      }

      return { backendReady: Boolean(result.userId), error: result.error };
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await signOutSupabase();
      setSupabaseUserId(null);
      setIsAnonymous(false);
      setProfile(null);
      try {
        await AsyncStorage.removeItem(PROFILE_KEY);
      } catch {
        // Non-fatal.
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    const session = await getCurrentSession();
    setSupabaseUserId(session?.user?.id ?? null);
    setIsAnonymous(session?.user?.is_anonymous ?? false);
  }, []);

  const value = useMemo<ProfileContextValue>(
    () => ({
      ready,
      loading,
      onboarded,
      profile,
      supabaseUserId,
      isAnonymous,
      completeOnboarding,
      signInLocal,
      signOut,
      refreshSession,
    }),
    [
      ready,
      loading,
      onboarded,
      profile,
      supabaseUserId,
      isAnonymous,
      completeOnboarding,
      signInLocal,
      signOut,
      refreshSession,
    ]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return ctx;
}
