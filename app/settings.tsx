import { ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { SettingsRow } from '../src/components/SettingsRow';
import { ProBanner } from '../src/components/ProBanner';
import { openPaywallMock, restorePurchasesMock } from '../src/lib/payments';
import { colors, spacing } from '../src/constants/theme';

const PLACEHOLDER_LEGAL =
  'This is placeholder legal text for the SpaceFlip AI MVP. Full terms and privacy policy will be added before launch.';

export default function SettingsScreen() {
  const showAlert = (title: string, message?: string) => {
    Alert.alert(title, message ?? 'This is a mock action for the MVP.');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Setting" variant="close" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <ProBanner onGetPro={() => openPaywallMock()} />
        <SettingsRow label="Feedback" onPress={() => showAlert('Feedback')} />
        <SettingsRow label="FAQ" onPress={() => showAlert('FAQ')} />
        <SettingsRow label="Terms of Use" onPress={() => showAlert('Terms of Use', PLACEHOLDER_LEGAL)} />
        <SettingsRow label="Privacy Policy" onPress={() => showAlert('Privacy Policy', PLACEHOLDER_LEGAL)} />
        <SettingsRow
          label="Restore Purchase"
          onPress={() => {
            restorePurchasesMock();
            Alert.alert('Restored', 'Your Pro subscription has been restored (mock).');
          }}
        />
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
});
