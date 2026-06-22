import { Redirect } from 'expo-router';
import { useProfile } from '../src/lib/profileStore';

export default function Index() {
  const { ready, onboarded, profile } = useProfile();

  // While persisted state loads, render nothing (root splash is still visible).
  if (!ready) return null;

  if (!onboarded) return <Redirect href="/onboarding" />;
  if (!profile) return <Redirect href="/login" />;
  return <Redirect href="/(tabs)/projects" />;
}
