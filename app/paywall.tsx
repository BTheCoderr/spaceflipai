import { View, Text, Pressable, StyleSheet, Alert, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PaywallBenefit } from '../src/components/PaywallBenefit';
import { startTrialMock, restorePurchasesMock } from '../src/lib/payments';
import { normalizeImageUrl } from '../src/constants/layout';
import { colors, interaction, radius, spacing, typography } from '../src/constants/theme';

const BACKGROUND_IMAGE = normalizeImageUrl(
  'https://images.unsplash.com/photo-1618221197160-8070ed78f1c9?w=800'
);

const benefits = [
  'Unlimited property upgrade plans',
  'Airbnb, office, retail, and landscape workflows',
  'Budget ranges and contractor checklists',
  'Save and export client-ready plans',
  'Priority plan generation',
];

export default function PaywallScreen() {
  const router = useRouter();

  const dismiss = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/projects');
    }
  };

  const handleStartTrial = () => {
    startTrialMock();
    Alert.alert('Welcome to Pro!', 'Your 3-day free trial has started (mock).', [
      { text: 'OK', onPress: dismiss },
    ]);
  };

  const handleRestore = () => {
    restorePurchasesMock();
    Alert.alert('Restored', 'Your Pro subscription has been restored (mock).', [
      { text: 'OK', onPress: dismiss },
    ]);
  };

  return (
    <View style={styles.container}>
      <ImageBackground source={{ uri: BACKGROUND_IMAGE }} style={styles.background} resizeMode="cover">
        <View style={styles.overlay} />
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <Pressable
            style={({ pressed }) => [styles.close, pressed && styles.pressed]}
            onPress={dismiss}
            hitSlop={interaction.hitSlop}
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </Pressable>
          <View style={styles.content}>
            <Text style={styles.title}>SpaceFlip Pro</Text>
            <Text style={styles.subtitle}>Try 3 days free, then $9.99/week</Text>
            <View style={styles.benefits}>
              {benefits.map((b) => (
                <PaywallBenefit key={b} text={b} light />
              ))}
            </View>
          </View>
          <View style={styles.footer}>
            <Pressable
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
              onPress={handleStartTrial}
            >
              <Text style={styles.primaryText}>Start Free Trial</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
              onPress={handleRestore}
            >
              <Text style={styles.secondaryText}>Restore Purchase</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [pressed && styles.pressed]} onPress={dismiss}>
              <Text style={styles.notNow}>Not now</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  safe: {
    flex: 1,
  },
  close: {
    alignSelf: 'flex-end',
    padding: spacing.md,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  title: {
    ...typography.largeTitle,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  benefits: {
    marginBottom: spacing.lg,
  },
  footer: {
    padding: spacing.lg,
  },
  primaryBtn: {
    backgroundColor: colors.pillActive,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
    marginBottom: spacing.md,
    minHeight: 52,
    justifyContent: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryBtn: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  secondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  notNow: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
