import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { SettingsRow } from '../src/components/SettingsRow';
import { useProfile } from '../src/lib/profileStore';
import { deleteCurrentUserWorkspace } from '../src/lib/account';
import { colors, radius, spacing, typography } from '../src/constants/theme';

const SUPPORT_EMAIL = 'bferrell514@gmail.com';
const SITE_URL = 'https://spaceflippro.netlify.app';
const PRIVACY_URL = `${SITE_URL}/privacy`;
const TERMS_URL = `${SITE_URL}/terms`;
const SUPPORT_URL = `${SITE_URL}/support`;

function shortUserCode(id: string | null): string | null {
  if (!id) return null;
  const compact = id.replace(/-/g, '');
  return compact.slice(0, 8).toUpperCase();
}

export default function SettingsScreen() {
  const router = useRouter();
  const { profile, supabaseUserId, isAnonymous, signOut } = useProfile();
  const [deleting, setDeleting] = useState(false);

  const openUrl = (url: string, fallbackTitle: string) => {
    Linking.openURL(url).catch(() =>
      Alert.alert(fallbackTitle, `Visit ${url} for more information.`)
    );
  };

  const userCode = shortUserCode(supabaseUserId);
  const workspaceLabel = supabaseUserId
    ? isAnonymous
      ? 'Guest workspace'
      : 'Workspace'
    : 'Local guest profile';

  const handleContactSupport = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=SpaceFlip%20Pro%20Support`).catch(() =>
      Alert.alert('Contact Support', `Need help? Email ${SUPPORT_EMAIL}.`)
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Log out',
      'Logging out ends this device\u2019s guest session. Cancel if you want to keep this guest workspace.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const runDelete = async () => {
    setDeleting(true);
    try {
      const result = await deleteCurrentUserWorkspace();
      await signOut();
      setDeleting(false);
      const message = result.storageWarning
        ? `Your workspace data was deleted. Some uploaded photos may take a little longer to clear. If anything remains, email ${SUPPORT_EMAIL}.`
        : 'Your guest workspace and all connected data were deleted.';
      Alert.alert('Workspace deleted', message, [
        { text: 'OK', onPress: () => router.replace('/login') },
      ]);
    } catch {
      setDeleting(false);
      Alert.alert(
        'Could not delete workspace',
        `Something went wrong deleting your data. Please try again. Need help? Email ${SUPPORT_EMAIL}.`
      );
    }
  };

  const handleDeleteWorkspace = () => {
    Alert.alert(
      'Delete guest workspace and data?',
      'This will delete saved projects, generation jobs, and uploaded property photos connected to this guest workspace. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete workspace', style: 'destructive', onPress: () => void runDelete() },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Settings" variant="close" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.accountCard}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={22} color={colors.accent} />
          </View>
          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>{profile?.name ?? 'SpaceFlip User'}</Text>
            <Text style={styles.accountMeta}>
              {workspaceLabel}
              {userCode ? ` · ID ${userCode}` : ''}
            </Text>
            {profile?.email ? <Text style={styles.accountMeta}>{profile.email}</Text> : null}
            <Text style={styles.accountMeta}>Saved securely with Supabase · No password required</Text>
          </View>
        </View>

        <Text style={styles.accountHint}>
          Deleting your guest workspace removes saved SpaceFlip Pro project data connected to this
          device session. For help, contact support.
        </Text>

        <SettingsRow label="FAQ & Support" onPress={() => openUrl(SUPPORT_URL, 'Support')} />
        <SettingsRow label="Terms of Use" onPress={() => openUrl(TERMS_URL, 'Terms of Use')} />
        <SettingsRow label="Privacy Policy" onPress={() => openUrl(PRIVACY_URL, 'Privacy Policy')} />
        <SettingsRow label="Contact Support" onPress={handleContactSupport} />

        <View style={styles.dangerWrap}>
          <SettingsRow label="Log out" onPress={handleLogout} destructive />
          <SettingsRow
            label="Delete guest workspace and data"
            onPress={handleDeleteWorkspace}
            destructive
          />
        </View>

        <Text style={styles.supportHint}>Need help? Email {SUPPORT_EMAIL}.</Text>
      </ScrollView>

      {deleting ? (
        <View style={styles.overlay}>
          <View style={styles.overlayCard}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.overlayText}>Deleting your guest workspace…</Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: spacing.xl,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountInfo: { flex: 1 },
  accountName: { ...typography.heading, fontSize: 16 },
  accountMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  accountHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  dangerWrap: { marginTop: spacing.lg },
  supportHint: {
    ...typography.caption,
    color: colors.textSecondary,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayCard: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  overlayText: { ...typography.body, color: colors.text },
});
