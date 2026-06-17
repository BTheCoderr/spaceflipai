import { ScrollView, StyleSheet, View, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { SettingsRow } from '../src/components/SettingsRow';
import { colors, radius, spacing, typography } from '../src/constants/theme';

const PLACEHOLDER_LEGAL =
  'This is placeholder legal text for the SpaceFlip Pro MVP. Full terms and privacy policy will be added before launch.';

export default function SettingsScreen() {
  const showAlert = (title: string, message?: string) => {
    Alert.alert(title, message ?? 'This is a mock action for the MVP.');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Settings" variant="close" />
      <ScrollView contentContainerStyle={styles.scroll}>
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
