import { View, Text, StyleSheet, Alert, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { getPlanById } from '../../src/data/mockSavedPlans';
import { colors, interaction, radius, spacing, typography } from '../../src/constants/theme';

export default function PlanDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const plan = getPlanById(id ?? '');

  if (!plan) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Plan" />
        <Text style={styles.error}>Plan not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={plan.title} />
      <View style={styles.content}>
        <Text style={styles.type}>{plan.projectTypeLabel}</Text>
        <Text style={styles.budget}>{plan.estimatedBudget}</Text>
        <Text style={styles.summary}>{plan.summary}</Text>
        <Text style={styles.meta}>{plan.checklistCount} checklist items included</Text>

        <Pressable
          style={({ pressed }) => [styles.useBtn, pressed && styles.pressed]}
          onPress={() =>
            router.push({
              pathname: '/project-intake/[projectType]',
              params: { projectType: plan.projectTypeId },
            })
          }
        >
          <Text style={styles.useBtnText}>Start This Plan Type</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.exportBtn, pressed && styles.pressed]}
          onPress={() => Alert.alert('Export Plan', 'PDF export coming soon.')}
        >
          <Text style={styles.exportBtnText}>Export Plan</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  type: { ...typography.caption, color: colors.accent, fontWeight: '700', marginBottom: 4 },
  budget: { ...typography.title, color: colors.accentSecondary, marginBottom: spacing.sm },
  summary: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.md },
  meta: { ...typography.caption, marginBottom: spacing.lg },
  useBtn: {
    backgroundColor: colors.pillActive,
    borderRadius: radius.pill,
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  useBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  exportBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  exportBtnText: { fontWeight: '700', color: colors.text },
  pressed: { opacity: interaction.pressedOpacity },
  error: { ...typography.body, textAlign: 'center', marginTop: spacing.xl },
});
