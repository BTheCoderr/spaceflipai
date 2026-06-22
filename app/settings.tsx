import { ScrollView, StyleSheet, View, Text, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { SettingsRow } from '../src/components/SettingsRow';
import { useProfile } from '../src/lib/profileStore';
import { colors, radius, spacing, typography } from '../src/constants/theme';

const PLACEHOLDER_LEGAL =
  'This is placeholder legal text for the SpaceFlip Pro MVP. Full terms and privacy policy will be added before launch.';

function shortUserCode(id: string | null): string | null {
  if (!id) return null;
  const compact = id.replace(/-/g, '');
  return compact.slice(0, 8).toUpperCase();
}

export default function SettingsScreen() {
  const router = useRouter();
  const { profile, supabaseUserId, isAnonymous, signOut } = useProfile();

  const showAlert = (title: string, message?: string) => {
    Alert.alert(title, message ?? 'This is a mock action for the MVP.');
  };

  const userCode = shortUserCode(supabaseUserId);
  const workspaceLabel = supabaseUserId
    ? isAnonymous
      ? 'Guest workspace'
      : 'Workspace'
    : 'Local guest profile';
  const accountMeta = userCode
    ? `${workspaceLabel} · ID ${userCode}`
    : workspaceLabel;

  const handleLogout = () => {
    Alert.alert(
      'Log out',
      'Logging out removes this device\u2019s session. Saved cloud projects may not be recoverable unless account linking is added (coming later). Cancel if you want to keep this guest workspace.',
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
            <Text style={styles.accountMeta}>{accountMeta}</Text>
            {profile?.email ? (
              <Text style={styles.accountMeta}>{profile.email}</Text>
            ) : null}
          </View>
        </View>

        <Text style={styles.accountHint}>
          Logging out ends this device&apos;s guest session. Account linking to recover projects on a
          new device is coming later.
        </Text>

        <View style={styles.noticeCard}>
          <View style={styles.noticeHeader}>
            <Ionicons name="flask-outline" size={18} color={colors.accent} />
            <Text style={styles.noticeTitle}>MVP testing mode</Text>
          </View>
          <Text style={styles.noticeBody}>
            SpaceFlip Pro is currently in MVP testing. Payments are not active in this build and no
            subscription is required. Usage limits may apply while AI costs are being tested. Plans
            are AI-generated planning drafts, and concept images are planning references — not final
            designs.
          </Text>
        </View>

        <SettingsRow label="Feedback" onPress={() => showAlert('Feedback')} />
        <SettingsRow label="FAQ" onPress={() => showAlert('FAQ')} />
        <SettingsRow label="Terms of Use" onPress={() => showAlert('Terms of Use', PLACEHOLDER_LEGAL)} />
        <SettingsRow label="Privacy Policy" onPress={() => showAlert('Privacy Policy', PLACEHOLDER_LEGAL)} />
        <SettingsRow label="Contact Support" onPress={() => showAlert('Contact Support')} />

        <View style={styles.logoutWrap}>
          <SettingsRow label="Log out" onPress={handleLogout} destructive />
        </View>
      </ScrollView>
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
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
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
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  logoutWrap: { marginTop: spacing.lg },
  noticeCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: '#E8F5EE',
  },
  noticeHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  noticeTitle: { ...typography.heading, fontSize: 15 },
  noticeBody: { ...typography.caption, lineHeight: 19, color: colors.textSecondary },
});
