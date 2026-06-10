import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TabScreenScroll } from '../../src/components/TabScreenScroll';
import { advisors } from '../../src/data/mockAdvisors';
import { colors, interaction, radius, shadows, spacing, typography } from '../../src/constants/theme';

export default function AdvisorsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.kicker}>SpaceFlip Pro</Text>
        <Text style={styles.title}>Advisors</Text>
        <Text style={styles.subtitle}>
          Business-focused guidance for staging, layout, budget, and contractor handoff.
        </Text>
      </View>

      <TabScreenScroll contentContainerStyle={styles.scroll}>
        {advisors.map((advisor) => (
          <Pressable
            key={advisor.id}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            onPress={() => router.push(`/advisor/${advisor.id}`)}
          >
            <View style={styles.iconWrap}>
              <Ionicons name={advisor.icon} size={22} color={colors.accent} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{advisor.name}</Text>
              <Text style={styles.cardRole}>{advisor.role}</Text>
              <Text style={styles.cardTagline} numberOfLines={2}>{advisor.tagline}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </Pressable>
        ))}
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
  scroll: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  pressed: { opacity: interaction.pressedOpacity },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  cardBody: { flex: 1, paddingRight: spacing.sm },
  cardTitle: { ...typography.heading, fontSize: 15 },
  cardRole: { ...typography.caption, fontWeight: '600', marginTop: 2 },
  cardTagline: { ...typography.caption, marginTop: 4 },
});
