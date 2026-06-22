import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../src/lib/profileStore';
import { hasSupabaseConfig } from '../src/lib/supabase';
import { colors, interaction, radius, spacing, typography } from '../src/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { signInLocal } = useProfile();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const enterApp = async (guest: boolean) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const { backendReady } = await signInLocal({ name, email, guest });
      // Anonymous sign-in is invisible to the user. If it fails (e.g. provider
      // disabled), let them in but be honest that saving may be limited.
      if (!backendReady && hasSupabaseConfig()) {
        Alert.alert(
          'Limited mode',
          "We couldn't start your secure workspace right now. You can keep exploring, but saving projects may not work until you reconnect."
        );
      }
      router.replace('/(tabs)/projects');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandMark}>
            <Text style={styles.brandText}>SF</Text>
          </View>
          <Text style={styles.title}>Welcome to SpaceFlip Pro</Text>
          <Text style={styles.subtitle}>
            Continue as guest to create a private workspace so your projects can be saved securely.
            Name and email are optional in this MVP — no password required.
          </Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name (optional)"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="words"
            returnKeyType="next"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@email.com (optional)"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="done"
          />

          <View style={styles.noticeRow}>
            <Ionicons name="lock-closed-outline" size={15} color={colors.textSecondary} />
            <Text style={styles.noticeText}>
              Name and email are for display only and stay on this device. Your projects are saved to
              a private guest workspace. Log out anytime to end this device&apos;s session.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            onPress={() => enterApp(false)}
            disabled={submitting}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            onPress={() => enterApp(true)}
            disabled={submitting}
          >
            <Text style={styles.secondaryText}>Continue as guest</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { padding: spacing.lg, paddingTop: spacing.xl, flexGrow: 1 },
  brandMark: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: colors.pillActive,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  brandText: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', letterSpacing: 0.5 },
  title: { ...typography.largeTitle, fontSize: 26, marginBottom: spacing.sm },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  label: { ...typography.caption, fontWeight: '700', marginBottom: spacing.xs, color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    ...typography.body,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  noticeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm },
  noticeText: { ...typography.caption, color: colors.textSecondary, flex: 1, lineHeight: 18 },
  footer: {
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  button: {
    backgroundColor: colors.pillActive,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  secondaryButton: { alignItems: 'center', justifyContent: 'center', minHeight: 44, marginTop: spacing.xs },
  secondaryText: { ...typography.body, fontWeight: '600', color: colors.accent },
  pressed: { opacity: interaction.pressedOpacity },
});
