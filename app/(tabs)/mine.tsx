import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TabScreenScroll } from '../../src/components/TabScreenScroll';
import { EmptyState } from '../../src/components/EmptyState';
import { RemoteImage } from '../../src/components/RemoteImage';
import { useGenerationStore } from '../../src/lib/generationStore';
import { formatSourceLabel } from '../../src/lib/imagePicker';
import { getSubscriptionStatusMock, openPaywallMock, PRO_MONTHLY_GENERATION_LIMIT } from '../../src/lib/payments';
import { layout } from '../../src/constants/layout';
import { colors, interaction, radius, shadows, spacing, typography } from '../../src/constants/theme';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function MineScreen() {
  const router = useRouter();
  const status = getSubscriptionStatusMock();
  const { savedProjects } = useGenerationStore();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Mine</Text>
        <Pressable
          onPress={() => router.push('/settings')}
          hitSlop={interaction.hitSlop}
          style={({ pressed }) => [styles.settingsBtn, pressed && styles.pressed]}
        >
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </Pressable>
      </View>
      <TabScreenScroll>
        <View style={styles.proCard}>
          <View style={styles.proInfo}>
            <Text style={styles.proPlan}>
              {status.isPro ? 'Pro Plan' : 'Free Plan'}
            </Text>
            <Text style={styles.proGens}>
              {status.isPro
                ? `${status.generationsRemaining} of ${PRO_MONTHLY_GENERATION_LIMIT} generations remaining this month`
                : `${status.generationsRemaining} free generations remaining`}
            </Text>
          </View>
          {!status.isPro && (
            <Pressable
              style={({ pressed }) => [styles.upgradeBtn, pressed && styles.pressed]}
              onPress={openPaywallMock}
            >
              <Text style={styles.upgradeText}>Upgrade</Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.sectionTitle}>My Projects</Text>
        {savedProjects.length === 0 ? (
          <EmptyState
            icon="images-outline"
            title="No saved designs yet"
            message="Create your first redesign from the Design tab."
            actionLabel="Start Designing"
            onAction={() => router.push('/(tabs)/design')}
          />
        ) : (
          <View style={styles.projectGrid}>
            {savedProjects.map((proj) => (
              <View key={proj.id} style={styles.projectCard}>
                <RemoteImage
                  uri={proj.resultImageUrl}
                  style={styles.projectImage}
                  containerStyle={styles.projectImageWrap}
                />
                <Text style={styles.projectTitle} numberOfLines={1}>{proj.toolName}</Text>
                <Text style={styles.projectMeta}>{formatDate(proj.createdAt)}</Text>
                <Text style={styles.projectSource}>{formatSourceLabel(proj.source)}</Text>
              </View>
            ))}
          </View>
        )}
      </TabScreenScroll>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    minHeight: 44,
  },
  title: {
    ...typography.largeTitle,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  proCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.pillInactive,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  proInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  proPlan: {
    ...typography.heading,
    marginBottom: 2,
  },
  proGens: {
    ...typography.caption,
  },
  upgradeBtn: {
    backgroundColor: colors.pillActive,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  upgradeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionTitle: {
    ...typography.heading,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  projectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  projectCard: {
    width: layout.gridCardWidth,
    marginBottom: spacing.md,
  },
  projectImageWrap: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: spacing.sm,
  },
  projectImage: {
    width: '100%',
    aspectRatio: 1,
  },
  projectTitle: {
    ...typography.heading,
    fontSize: 14,
  },
  projectMeta: {
    ...typography.caption,
  },
  projectSource: {
    ...typography.caption,
    fontSize: 11,
    marginTop: 2,
  },
});
