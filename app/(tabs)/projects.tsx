import { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TabScreenScroll } from '../../src/components/TabScreenScroll';
import { EmptyState } from '../../src/components/EmptyState';
import { RemoteImage } from '../../src/components/RemoteImage';
import { useGenerationStore } from '../../src/lib/generationStore';
import { formatSourceLabel } from '../../src/lib/imagePicker';
import { getGenerationJobStatusLabel } from '../../src/lib/generationJobs';
import { getProjectTypeLabel } from '../../src/data/mockProjectTypes';
import { layout } from '../../src/constants/layout';
import { colors, interaction, radius, shadows, spacing, typography } from '../../src/constants/theme';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function StatusPill({ label, tone }: { label: string; tone: 'active' | 'completed' | 'draft' }) {
  const bg =
    tone === 'completed'
      ? '#E8F5EE'
      : tone === 'active'
        ? '#EEF2FF'
        : colors.pillInactive;
  const textColor =
    tone === 'completed' ? colors.statusCompleted : tone === 'active' ? colors.navy : colors.textSecondary;

  return (
    <View style={[styles.statusPill, { backgroundColor: bg }]}>
      <Text style={[styles.statusPillText, { color: textColor }]}>{label}</Text>
    </View>
  );
}

export default function ProjectsScreen() {
  const router = useRouter();
  const {
    savedProjects,
    savedProjectsLoading,
    savedProjectsError,
    generationStatus,
    currentJob,
    selectedInputImage,
    loadSavedProjects,
  } = useGenerationStore();

  useFocusEffect(
    useCallback(() => {
      void loadSavedProjects();
    }, [loadSavedProjects])
  );

  const activeProjects = savedProjects.filter((p) => p.status === 'active');
  const savedConcepts = savedProjects.filter((p) => p.status === 'completed');
  const recentUploads = savedProjects.slice(0, 3);
  const showEmpty =
    !savedProjectsLoading &&
    savedProjects.length === 0 &&
    !selectedInputImage &&
    generationStatus !== 'generating';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>SpaceFlip Pro</Text>
          <Text style={styles.title}>Projects</Text>
        </View>
        <Pressable
          onPress={() => router.push('/settings')}
          hitSlop={interaction.hitSlop}
          style={({ pressed }) => [styles.settingsBtn, pressed && styles.pressed]}
        >
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </Pressable>
      </View>

      <TabScreenScroll>
        {savedProjectsLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.loadingText}>Loading your projects…</Text>
          </View>
        ) : null}

        {savedProjectsError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{savedProjectsError}</Text>
            <Pressable
              onPress={() => void loadSavedProjects()}
              style={({ pressed }) => [styles.retryBtn, pressed && styles.pressed]}
            >
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : null}

        {generationStatus === 'generating' && currentJob ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Projects</Text>
            <View style={styles.projectCard}>
              <Text style={styles.cardType}>
                {getProjectTypeLabel(currentJob.toolId)}
              </Text>
              <Text style={styles.cardGoal}>Building upgrade plan…</Text>
              <StatusPill label={getGenerationJobStatusLabel(currentJob.status)} tone="active" />
            </View>
          </View>
        ) : null}

        {showEmpty ? (
          <EmptyState
            icon="business-outline"
            title="Start your first property upgrade"
            message="Upload a space photo from Visualize to create a client-ready upgrade plan."
            actionLabel="Open Visualize"
            onAction={() => router.push('/(tabs)/visualize')}
          />
        ) : savedProjects.length > 0 || generationStatus === 'generating' ? (
          <>
            {activeProjects.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Active Projects</Text>
                {activeProjects.map((proj) => (
                  <ProjectCard key={proj.id} project={proj} />
                ))}
              </View>
            ) : null}

            {recentUploads.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Uploads</Text>
                <View style={styles.projectGrid}>
                  {recentUploads.map((proj) => (
                    <CompactProjectCard key={proj.id} project={proj} />
                  ))}
                </View>
              </View>
            ) : null}

            {savedConcepts.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Saved Concepts</Text>
                <View style={styles.projectGrid}>
                  {savedConcepts.map((proj) => (
                    <CompactProjectCard key={proj.id} project={proj} />
                  ))}
                </View>
              </View>
            ) : null}
          </>
        ) : null}
      </TabScreenScroll>
    </SafeAreaView>
  );
}

function ProjectCard({
  project,
}: {
  project: ReturnType<typeof useGenerationStore>['savedProjects'][number];
}) {
  return (
    <View style={styles.projectCard}>
      <RemoteImage
        uri={project.resultImageUrl}
        style={styles.cardImage}
        containerStyle={styles.cardImageWrap}
      />
      <View style={styles.cardBody}>
        <Text style={styles.cardType}>{project.projectTypeLabel}</Text>
        <Text style={styles.cardGoal} numberOfLines={2}>{project.goal}</Text>
        <View style={styles.cardMetaRow}>
          <StatusPill
            label={project.status === 'completed' ? 'Completed' : 'Active'}
            tone={project.status === 'completed' ? 'completed' : 'active'}
          />
          {project.budgetRange ? (
            <Text style={styles.budgetBadge}>{project.budgetRange}</Text>
          ) : null}
        </View>
        <Text style={styles.cardMeta}>
          {formatDate(project.createdAt)} · {formatSourceLabel(project.source)}
        </Text>
      </View>
    </View>
  );
}

function CompactProjectCard({
  project,
}: {
  project: ReturnType<typeof useGenerationStore>['savedProjects'][number];
}) {
  return (
    <View style={styles.compactCard}>
      <RemoteImage
        uri={project.resultImageUrl}
        style={styles.compactImage}
        containerStyle={styles.compactImageWrap}
      />
      <Text style={styles.compactTitle} numberOfLines={1}>{project.title}</Text>
      <Text style={styles.compactMeta}>{project.projectTypeLabel}</Text>
      {project.budgetRange ? (
        <Text style={styles.compactBudget}>{project.budgetRange}</Text>
      ) : null}
      {project.jobStatus ? (
        <Text style={styles.compactStatus}>
          {getGenerationJobStatusLabel(project.jobStatus)}
        </Text>
      ) : null}
      <Text style={styles.compactSource}>{formatSourceLabel(project.source)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  kicker: { ...typography.caption, fontWeight: '600', color: colors.accent },
  title: { ...typography.largeTitle },
  settingsBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: interaction.pressedOpacity },
  section: { marginBottom: spacing.lg, paddingHorizontal: spacing.md },
  sectionTitle: { ...typography.heading, marginBottom: spacing.sm },
  projectCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  cardImageWrap: { width: '100%', aspectRatio: 16 / 9 },
  cardImage: { width: '100%', aspectRatio: 16 / 9 },
  cardBody: { padding: spacing.md },
  cardType: { ...typography.caption, fontWeight: '700', color: colors.accent, textTransform: 'capitalize' },
  cardGoal: { ...typography.heading, fontSize: 16, marginTop: 4, marginBottom: spacing.sm },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  cardMeta: { ...typography.caption },
  budgetBadge: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.accentSecondary,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  statusPillText: { fontSize: 11, fontWeight: '700' },
  projectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  compactCard: { width: layout.gridCardWidth, marginBottom: spacing.md },
  compactImageWrap: { width: '100%', aspectRatio: 1, marginBottom: spacing.sm },
  compactImage: { width: '100%', aspectRatio: 1 },
  compactTitle: { ...typography.heading, fontSize: 14 },
  compactMeta: { ...typography.caption },
  compactBudget: { ...typography.caption, color: colors.accentSecondary, marginTop: 2 },
  compactStatus: { ...typography.caption, fontSize: 11, marginTop: 2, color: colors.navy },
  compactSource: { ...typography.caption, fontSize: 11, marginTop: 2 },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  loadingText: { ...typography.caption, color: colors.textSecondary },
  errorBanner: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: '#FFF4F4',
    borderWidth: 1,
    borderColor: '#F5C2C2',
  },
  errorText: { ...typography.body, color: colors.text, marginBottom: spacing.sm },
  retryBtn: { alignSelf: 'flex-start' },
  retryText: { ...typography.caption, fontWeight: '700', color: colors.accent },
});
