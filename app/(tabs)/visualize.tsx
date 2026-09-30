import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TabScreenScroll } from '../../src/components/TabScreenScroll';
import { RemoteImage } from '../../src/components/RemoteImage';
import { visualizeActions, getProjectTypeById } from '../../src/data/mockProjectTypes';
import { colors, interaction, radius, shadows, spacing, typography } from '../../src/constants/theme';

export default function VisualizeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.kicker}>SpaceFlip Pro</Text>
        <Text style={styles.title}>New Plan</Text>
        <Text style={styles.hero}>Create a property upgrade plan.</Text>
        <Text style={styles.subhero}>
          Start with a property photo, choose your goal, then get a practical plan, budget, checklist,
          and PDF-ready handoff.
        </Text>
        <View style={styles.flowRow}>
          {[
            ['camera-outline', '1', 'Photo'],
            ['clipboard-outline', '2', 'Plan'],
            ['document-text-outline', '3', 'Export'],
          ].map(([icon, step, label]) => (
            <View key={step} style={styles.flowStep}>
              <View style={styles.flowIcon}>
                <Ionicons
                  name={icon as keyof typeof Ionicons.glyphMap}
                  size={16}
                  color={colors.accent}
                />
              </View>
              <Text style={styles.flowStepNumber}>{step}</Text>
              <Text style={styles.flowStepLabel}>{label}</Text>
            </View>
          ))}
        </View>
      </View>

      <TabScreenScroll contentContainerStyle={styles.scroll}>
        {visualizeActions.map((action) => {
          const projectType = getProjectTypeById(action.projectTypeId);
          return (
            <Pressable
              key={action.id}
              style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}
              onPress={() =>
                router.push({
                  pathname: '/project-intake/[projectType]',
                  params: { projectType: action.projectTypeId },
                })
              }
            >
              {projectType ? (
                <RemoteImage
                  uri={projectType.imageUrl}
                  style={styles.actionImage}
                  containerStyle={styles.actionImageWrap}
                  borderRadius={radius.md}
                />
              ) : null}
              <View style={styles.actionBody}>
                <View style={styles.actionTitleRow}>
                  <View style={styles.iconWrap}>
                    <Ionicons name={action.icon} size={18} color={colors.accent} />
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                </View>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </Pressable>
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
  title: { ...typography.largeTitle, marginBottom: spacing.sm },
  hero: { ...typography.title, fontSize: 20, marginBottom: spacing.xs },
  subhero: { ...typography.body, color: colors.textSecondary },
  flowRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  flowStep: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minHeight: 38,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: '#E8F5EE',
  },
  flowIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowStepNumber: { fontSize: 11, fontWeight: '800', color: colors.accent },
  flowStepLabel: { ...typography.caption, fontWeight: '700', color: colors.text },
  scroll: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  pressed: { opacity: interaction.pressedOpacity },
  actionImageWrap: { width: 72, height: 72, marginRight: spacing.sm },
  actionImage: { width: 72, height: 72 },
  actionBody: { flex: 1, paddingRight: spacing.sm },
  actionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  actionTitle: { ...typography.heading, fontSize: 15, flex: 1 },
  actionSubtitle: { ...typography.caption },
});
