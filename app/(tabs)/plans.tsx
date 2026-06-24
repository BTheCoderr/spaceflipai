import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TabScreenScroll } from '../../src/components/TabScreenScroll';
import { planSections, getPlansBySection } from '../../src/data/mockSavedPlans';
import { colors, interaction, radius, shadows, spacing, typography } from '../../src/constants/theme';

export default function PlansScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.kicker}>SpaceFlip Pro</Text>
        <Text style={styles.title}>Plans</Text>
        <Text style={styles.subtitle}>
          Saved upgrade plans and templates for hosts, investors, and business operators.
        </Text>
      </View>

      <TabScreenScroll>
        {planSections.map((section) => {
          const plans = getPlansBySection(section.id);
          return (
            <View key={section.id} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {plans.map((plan) => (
                <Pressable
                  key={plan.id}
                  style={({ pressed }) => [styles.planCard, pressed && styles.pressed]}
                  onPress={() => router.push(`/plan/${plan.id}`)}
                >
                  <View style={styles.planHeader}>
                    <Text style={styles.planTitle}>{plan.title}</Text>
                    <Text style={styles.planBudget}>{plan.estimatedBudget}</Text>
                  </View>
                  <Text style={styles.planType}>{plan.projectTypeLabel}</Text>
                  <Text style={styles.planSummary} numberOfLines={2}>{plan.summary}</Text>
                  <View style={styles.planFooter}>
                    <Text style={styles.checklistCount}>{plan.checklistCount} checklist items</Text>
                    <Pressable
                      onPress={() => Alert.alert('Export Plan', 'Open a saved project to export a PDF plan.')}
                      style={({ pressed }) => [styles.exportBtn, pressed && styles.pressed]}
                    >
                      <Text style={styles.exportText}>Export</Text>
                    </Pressable>
                  </View>
                </Pressable>
              ))}
            </View>
          );
        })}
      </TabScreenScroll>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.md, marginBottom: spacing.md },
  kicker: { ...typography.caption, fontWeight: '600', color: colors.accent },
  title: { ...typography.largeTitle, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textSecondary },
  section: { paddingHorizontal: spacing.md, marginBottom: spacing.lg },
  sectionTitle: { ...typography.heading, marginBottom: spacing.sm },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  pressed: { opacity: interaction.pressedOpacity },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: 4,
  },
  planTitle: { ...typography.heading, flex: 1 },
  planBudget: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.accentSecondary,
  },
  planType: { ...typography.caption, color: colors.accent, fontWeight: '600', marginBottom: spacing.xs },
  planSummary: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.sm },
  planFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checklistCount: { ...typography.caption },
  exportBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  exportText: { fontSize: 13, fontWeight: '600', color: colors.text },
});
