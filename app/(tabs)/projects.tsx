import { useCallback, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TabScreenScroll } from '../../src/components/TabScreenScroll';
import { EmptyState } from '../../src/components/EmptyState';
import { RemoteImage } from '../../src/components/RemoteImage';
import { useGenerationStore } from '../../src/lib/generationStore';
import { formatSourceLabel } from '../../src/lib/imagePicker';
import {
  getGenerationJobStatusLabel,
  listGenerationJobsForUser,
  type GenerationJob,
} from '../../src/lib/generationJobs';
import { getProjectTypeLabel } from '../../src/data/mockProjectTypes';
import { colors, interaction, radius, shadows, spacing, typography } from '../../src/constants/theme';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function StatusPill({ label, tone }: { label: string; tone: 'active' | 'completed' | 'draft' | 'failed' }) {
  const bg =
    tone === 'completed'
      ? '#E8F5EE'
      : tone === 'active'
        ? '#EEF2FF'
        : tone === 'failed'
          ? '#FCEEEE'
          : colors.pillInactive;
  const textColor =
    tone === 'completed'
      ? colors.statusCompleted
      : tone === 'active'
        ? colors.navy
        : tone === 'failed'
          ? '#B4322E'
          : colors.textSecondary;

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

  const [recentJobs, setRecentJobs] = useState<GenerationJob[]>([]);

  useFocusEffect(
    useCallback(() => {
      void loadSavedProjects();
      void listGenerationJobsForUser().then(setRecentJobs).catch(() => setRecentJobs([]));
    }, [loadSavedProjects])
  );

  const isGenerating = generationStatus === 'generating';

  // Saved Projects = design_projects. Recent Jobs = generation_jobs not already saved.
  const savedJobIds = new Set(
    savedProjects.map((p) => p.jobId).filter((id): id is string => !!id)
  );
  const dedupedJobs = recentJobs.filter(
    (job) => !savedJobIds.has(job.id) && job.id !== currentJob?.id
  );

  const showEmpty =
    !savedProjectsLoading &&
    savedProjects.length === 0 &&
    dedupedJobs.length === 0 &&
    !selectedInputImage &&
    !isGenerating;

  const openJobResult = (job: GenerationJob) => {
    if (job.status !== 'completed' || !job.resultImageUrl) return;
    router.push({
      pathname: '/result',
      params: {
        jobId: job.id,
        projectType: job.toolId,
        projectTitle: getProjectTypeLabel(job.toolId),
        goal: job.goal ?? '',
        imageUrl: job.resultImageUrl,
        inputImageUrl: job.inputPublicUrl ?? job.inputImageUri ?? '',
      },
    });
  };

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
        {savedProjectsLoading && savedProjects.length === 0 ? (
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

        {isGenerating && currentJob ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>In Progress</Text>
            <View style={styles.projectCard}>
              <View style={styles.cardBody}>
                <Text style={styles.cardType}>{getProjectTypeLabel(currentJob.toolId)}</Text>
                <Text style={styles.cardGoal}>Building your upgrade plan…</Text>
                <StatusPill label={getGenerationJobStatusLabel(currentJob.status)} tone="active" />
              </View>
            </View>
          </View>
        ) : null}

        {showEmpty ? (
          <EmptyState
            icon="business-outline"
            title="Start your first property upgrade"
            message="Upload a space photo from Visualize to create a planning draft you can save and export."
            actionLabel="Open Visualize"
            onAction={() => router.push('/(tabs)/visualize')}
          />
        ) : null}

        {savedProjects.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saved Projects</Text>
            {savedProjects.map((proj) => (
              <ProjectCard
                key={proj.id}
                project={proj}
                onPress={() => router.push(`/project/${proj.id}`)}
              />
            ))}
          </View>
        ) : null}

        {dedupedJobs.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Jobs</Text>
            <Text style={styles.sectionHint}>
              Generation history. Save a job from the Result screen to keep it as a project.
            </Text>
            {dedupedJobs.map((job) => (
              <RecentJobCard key={job.id} job={job} onPress={() => openJobResult(job)} />
            ))}
          </View>
        ) : null}
      </TabScreenScroll>
    </SafeAreaView>
  );
}

function ProjectCard({
  project,
  onPress,
}: {
  project: ReturnType<typeof useGenerationStore>['savedProjects'][number];
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.projectCard, pressed && styles.pressed]}
      onPress={onPress}
    >
      <RemoteImage
        uri={project.resultImageUrl}
        style={styles.cardImage}
        containerStyle={styles.cardImageWrap}
      />
      <View style={styles.cardBody}>
        <Text style={styles.cardType}>{project.projectTypeLabel}</Text>
        <Text style={styles.cardGoal} numberOfLines={2}>
          {project.goal}
        </Text>
        <View style={styles.cardMetaRow}>
          <StatusPill label="Saved" tone="completed" />
          {project.budgetRange ? <Text style={styles.budgetBadge}>{project.budgetRange}</Text> : null}
        </View>
        <Text style={styles.cardMeta}>
          {formatDate(project.createdAt)} · {formatSourceLabel(project.source)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} style={styles.cardChevron} />
    </Pressable>
  );
}

function RecentJobCard({ job, onPress }: { job: GenerationJob; onPress: () => void }) {
  const isCompleted = job.status === 'completed';
  const tone = isCompleted ? 'completed' : job.status === 'failed' ? 'failed' : 'active';
  const statusLabel = isCompleted ? 'Completed' : job.status === 'failed' ? 'Failed' : 'In progress';

  return (
    <Pressable
      style={({ pressed }) => [styles.jobCard, pressed && isCompleted && styles.pressed]}
      onPress={onPress}
      disabled={!isCompleted}
    >
      <RemoteImage
        uri={job.resultImageUrl ?? job.inputPublicUrl ?? job.inputImageUri}
        style={styles.jobImage}
        containerStyle={styles.jobImageWrap}
      />
      <View style={styles.jobBody}>
        <Text style={styles.cardType}>{getProjectTypeLabel(job.toolId)}</Text>
        {job.goal ? (
          <Text style={styles.jobGoal} numberOfLines={1}>
            {job.goal}
          </Text>
        ) : null}
        <View style={styles.cardMetaRow}>
          <StatusPill label={statusLabel} tone={tone} />
          <Text style={styles.cardMeta}>{formatDate(job.createdAt)}</Text>
        </View>
      </View>
      {isCompleted ? (
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} style={styles.cardChevron} />
      ) : null}
    </Pressable>
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
  sectionTitle: { ...typography.heading, marginBottom: spacing.xs },
  sectionHint: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm },
  projectCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  cardImageWrap: { width: '100%', aspectRatio: 16 / 9 },
  cardImage: { width: '100%', aspectRatio: 16 / 9 },
  cardBody: { padding: spacing.md },
  cardType: { ...typography.caption, fontWeight: '700', color: colors.accent, textTransform: 'capitalize' },
  cardGoal: { ...typography.heading, fontSize: 16, marginTop: 4, marginBottom: spacing.sm },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  cardMeta: { ...typography.caption },
  cardChevron: { position: 'absolute', right: spacing.sm, top: spacing.sm },
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
  jobCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  jobImageWrap: { width: 56, height: 56, borderRadius: radius.md, marginRight: spacing.sm },
  jobImage: { width: 56, height: 56 },
  jobBody: { flex: 1 },
  jobGoal: { ...typography.body, fontSize: 14, marginTop: 2, marginBottom: 4 },
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
