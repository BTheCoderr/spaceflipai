import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAdvisorById } from '../../src/data/mockAdvisors';
import { colors, interaction, radius, shadows, spacing, typography } from '../../src/constants/theme';

export default function AdvisorDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const advisor = getAdvisorById(id);

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
          <Text style={styles.headerTitle}>Advisor</Text>
          <View style={styles.headerSide} />
        </View>
        <Text style={styles.error}>Advisor not found.</Text>
      </SafeAreaView>
    );
  }

  // Suggested questions a user might ask this advisor (preview only).
  const suggestedQuestions = advisor.starterMessages
    .filter((m) => m.role === 'user')
    .map((m) => m.text);

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
          <Text style={styles.advisorRole}>{advisor.role}</Text>
          <Text style={styles.advisorDescription}>{advisor.description}</Text>
        </View>

        <Text style={styles.sectionTitle}>What this advisor focuses on</Text>
        <View style={styles.card}>
          <Text style={styles.cardLead}>{advisor.tagline}</Text>
          {suggestedQuestions.length > 0 ? (
            <>
              <Text style={styles.cardSubheading}>Questions it can help you think through</Text>
              {suggestedQuestions.map((q) => (
                <View key={q} style={styles.questionRow}>
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={16}
                    color={colors.textSecondary}
                    style={styles.questionIcon}
                  />
                  <Text style={styles.questionText}>{q}</Text>
                </View>
              ))}
            </>
          ) : null}
        </View>

        <View style={styles.comingSoonCard}>
          <Ionicons name="time-outline" size={20} color={colors.accent} />
          <Text style={styles.comingSoonTitle}>Advisor chat is coming soon</Text>
          <Text style={styles.comingSoonBody}>
            For now, use Visualize to generate a full upgrade plan with budget ranges, a priority
            checklist, and a client-ready PDF.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
          onPress={() => router.push('/(tabs)/visualize')}
        >
          <Ionicons name="scan-outline" size={18} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>Start a Visualize Plan</Text>
        </Pressable>
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  cardLead: { ...typography.body, fontWeight: '600', marginBottom: spacing.sm },
  cardSubheading: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: spacing.sm,
  },
  questionRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  questionIcon: { marginRight: spacing.sm, marginTop: 2 },
  questionText: { ...typography.body, flex: 1, color: colors.text },
  comingSoonCard: {
    backgroundColor: '#E8F5EE',
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  comingSoonTitle: { ...typography.heading, fontSize: 15, marginTop: spacing.xs, marginBottom: 4 },
  comingSoonBody: {
    ...typography.caption,
    textAlign: 'center',
    lineHeight: 19,
    color: colors.textSecondary,
  },
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
  pressed: { opacity: interaction.pressedOpacity },
});
