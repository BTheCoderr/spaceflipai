import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAdvisorAgentById } from '../../src/data/advisorAgents';
import { getProjectTypeById } from '../../src/data/mockProjectTypes';
import { colors, interaction, radius, shadows, spacing, typography } from '../../src/constants/theme';

export default function AdvisorDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const advisor = getAdvisorAgentById(id);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/advisors');
  };

  if (!advisor) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} hitSlop={interaction.hitSlop} style={styles.headerSide}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Guide</Text>
          <View style={styles.headerSide} />
        </View>
        <Text style={styles.error}>Guide not found.</Text>
      </SafeAreaView>
    );
  }

  const recommendedType = advisor.recommendedProjectTypes[0];
  const recommendedLabel = getProjectTypeById(recommendedType)?.label ?? 'a plan';

  // Both CTAs route into the existing, working Visualize/Groq pipeline.
  const startRecommendedPlan = () => {
    router.push(`/project-intake/${recommendedType}`);
  };

  const openVisualizePicker = () => {
    router.push('/(tabs)/visualize');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} hitSlop={interaction.hitSlop} style={styles.headerSide}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {advisor.name}
        </Text>
        <View style={styles.headerSide} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.introCard}>
          <View style={styles.iconWrap}>
            <Ionicons name={advisor.icon} size={26} color={colors.accent} />
          </View>
          <Text style={styles.advisorName}>{advisor.name}</Text>
          <Text style={styles.advisorRole}>{advisor.subtitle}</Text>
          <Text style={styles.advisorDescription}>{advisor.focus}</Text>
        </View>

        <Text style={styles.sectionTitle}>Best for</Text>
        <View style={styles.chipWrap}>
          {advisor.bestFor.map((chip) => (
            <View key={chip} style={styles.chip}>
              <Text style={styles.chipText}>{chip}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Plan prompts</Text>
        <View style={styles.card}>
          {advisor.starterQuestions.map((q, index) => (
            <Pressable
              key={q}
              onPress={startRecommendedPlan}
              style={({ pressed }) => [
                styles.questionRow,
                index < advisor.starterQuestions.length - 1 && styles.questionRowDivider,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="clipboard-outline"
                size={16}
                color={colors.accent}
                style={styles.questionIcon}
              />
              <Text style={styles.questionText}>{q}</Text>
              <Ionicons name="arrow-forward" size={15} color={colors.textSecondary} />
            </Pressable>
          ))}
        </View>

        <View style={styles.noticeCard}>
          <Ionicons name="bulb-outline" size={18} color={colors.accent} />
          <View style={styles.noticeBody}>
            <Text style={styles.noticeTitle}>How this guide works</Text>
            <Text style={styles.noticeText}>
              Use this guide to start a focused upgrade plan. SpaceFlip Pro will create a budget,
              checklist, and PDF-ready project plan from your property photo.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
          onPress={startRecommendedPlan}
        >
          <Ionicons name="scan-outline" size={18} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>{advisor.ctaLabel}</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
          onPress={openVisualizePicker}
        >
          <Text style={styles.secondaryBtnText}>Start a Visualize Plan</Text>
        </Pressable>
        <Text style={styles.footerHint}>Recommended: {recommendedLabel}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerSide: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.heading, fontSize: 16, flex: 1, textAlign: 'center' },
  error: { ...typography.body, textAlign: 'center', marginTop: spacing.xl },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },
  introCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  advisorName: { ...typography.heading, fontSize: 18, textAlign: 'center' },
  advisorRole: { ...typography.caption, fontWeight: '600', marginTop: 2, marginBottom: spacing.sm },
  advisorDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
  sectionTitle: { ...typography.heading, fontSize: 15, marginBottom: spacing.sm },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    backgroundColor: '#E8F5EE',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipText: { ...typography.caption, fontWeight: '600', color: colors.accent },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  questionRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  questionIcon: { marginRight: spacing.sm },
  questionText: { ...typography.body, flex: 1, color: colors.text, paddingRight: spacing.sm },
  noticeCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: '#E8F5EE',
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  noticeBody: { flex: 1 },
  noticeTitle: { ...typography.heading, fontSize: 14, marginBottom: 2 },
  noticeText: { ...typography.caption, lineHeight: 18, color: colors.textSecondary },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  primaryBtn: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.pillActive,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  primaryBtnText: { fontWeight: '700', color: '#FFFFFF', fontSize: 15 },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    marginTop: spacing.xs,
  },
  secondaryBtnText: { ...typography.body, fontWeight: '600', color: colors.accent },
  footerHint: {
    ...typography.caption,
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  pressed: { opacity: interaction.pressedOpacity },
});
