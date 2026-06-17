import { useCallback, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RemoteImage } from '../../src/components/RemoteImage';
import {
  deleteDesignProject,
  getDesignProject,
  type DesignProject,
} from '../../src/lib/projects';
import { getGenerationJob } from '../../src/lib/generationJobs';
import { useGenerationStore } from '../../src/lib/generationStore';
import { getProjectTypeLabel } from '../../src/data/mockProjectTypes';
import { formatSourceLabel } from '../../src/lib/imagePicker';
import { aiProviderDevLabel, planSourceLabel } from '../../src/lib/upgradePlanPayload';
import {
  exportAndSharePlan,
  ExportPlanError,
  EXPORT_PLAN_ERROR_MESSAGE,
} from '../../src/lib/exportPlan';
import { colors, interaction, radius, shadows, spacing, typography } from '../../src/constants/theme';

export default function ProjectDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { loadSavedProjects } = useGenerationStore();

  const [project, setProject] = useState<DesignProject | null>(null);
  const [planSourceText, setPlanSourceText] = useState('Saved planning draft');
  const [providerText, setProviderText] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      getDesignProject(id)
        .then(async (p) => {
          if (!active) return;
          setProject(p);
          // Derive the real plan source/provider from the linked generation job, if any.
          if (p?.generationJobId) {
            const job = await getGenerationJob(p.generationJobId);
            if (active && job) {
              const source = job.planSource === 'ai' ? 'ai' : 'mock';
              setPlanSourceText(planSourceLabel(source));
              const provider =
                job.aiProvider === 'gemini' || job.aiProvider === 'groq' || job.aiProvider === 'mock'
                  ? job.aiProvider
                  : undefined;
              setProviderText(aiProviderDevLabel(provider));
            }
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }, [id])
  );

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/projects');
  };

  const handleExport = async () => {
    if (!project || exporting) return;
    setExporting(true);
    try {
      const { pdfUri, shared } = await exportAndSharePlan({
        projectTypeId: project.projectType,
        projectTypeLabel: getProjectTypeLabel(project.projectType),
        goal: project.goal ?? '',
        budgetRange: project.budgetRange ?? '',
        source: project.source,
        inputImageUrl: project.inputImageUrl || undefined,
        resultImageUrl: project.resultImageUrl || undefined,
        summary: project.planSummary,
        contractorNotes: project.contractorNotes,
        priorityChecklist: project.checklist,
        suggestedMaterials: project.budgetItems,
        planSourcePdfLabel: 'Saved planning draft',
      });
      if (!shared) {
        Alert.alert(
          'PDF ready',
          `Sharing is not available on this device. Your plan was saved to:\n\n${pdfUri}`
        );
      }
    } catch (error) {
      const message = error instanceof ExportPlanError ? error.message : EXPORT_PLAN_ERROR_MESSAGE;
      Alert.alert('Could not export', message);
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = () => {
    if (!project || deleting) return;
    Alert.alert('Delete project', 'This will remove the saved project. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await deleteDesignProject(project.id);
            await loadSavedProjects();
            handleBack();
          } catch {
            Alert.alert('Could not delete', "Couldn't delete this project. Please try again.");
            setDeleting(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} hitSlop={interaction.hitSlop} style={styles.headerSide}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {project ? getProjectTypeLabel(project.projectType) : 'Project'}
        </Text>
        <View style={styles.headerSide} />
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : !project ? (
        <View style={styles.loadingWrap}>
          <Text style={styles.notFound}>This project could not be found.</Text>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <RemoteImage
              uri={project.resultImageUrl}
              style={styles.image}
              containerStyle={styles.imageWrap}
            />
            <View style={styles.conceptBadgeRow}>
              <Text style={styles.conceptBadge}>Concept reference</Text>
            </View>
            <Text style={styles.conceptDisclaimer}>
              Concept image is a planning reference. Final design and pricing should be verified by
              professionals.
            </Text>

            <View style={styles.metaCard}>
              <MetaRow label="Project type" value={getProjectTypeLabel(project.projectType)} />
              {project.goal ? <MetaRow label="Goal" value={project.goal} /> : null}
              {project.budgetRange ? <MetaRow label="Budget range" value={project.budgetRange} /> : null}
              <MetaRow label="Plan source" value={planSourceText} />
              {providerText ? <MetaRow label="AI provider" value={providerText} /> : null}
              <MetaRow label="Photo source" value={formatSourceLabel(project.source)} />
            </View>

            {project.planSummary ? (
              <Section title="Upgrade Summary">
                <Text style={styles.bodyText}>{project.planSummary}</Text>
              </Section>
            ) : null}

            {project.budgetItems.length > 0 ? (
              <Section title="Suggested Materials / Items">
                {project.budgetItems.map((item) => (
                  <Text key={item} style={styles.listItem}>
                    • {item}
                  </Text>
                ))}
              </Section>
            ) : null}

            {project.checklist.length > 0 ? (
              <Section title="Priority Checklist">
                {project.checklist.map((item, index) => (
                  <View key={item} style={styles.checkRow}>
                    <View style={styles.checkBadge}>
                      <Text style={styles.checkBadgeText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.checkText}>{item}</Text>
                  </View>
                ))}
              </Section>
            ) : null}

            {project.contractorNotes ? (
              <Section title="Notes for Contractor or Client">
                <Text style={styles.bodyText}>{project.contractorNotes}</Text>
              </Section>
            ) : null}

            {project.notes ? (
              <Section title="Your Notes">
                <Text style={styles.bodyText}>{project.notes}</Text>
              </Section>
            ) : null}

            <Pressable
              style={({ pressed }) => [styles.deleteBtn, pressed && styles.pressed]}
              onPress={handleDelete}
              disabled={deleting}
            >
              <Ionicons name="trash-outline" size={18} color="#B4322E" />
              <Text style={styles.deleteText}>{deleting ? 'Deleting…' : 'Delete Project'}</Text>
            </Pressable>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed, exporting && styles.disabled]}
              onPress={() => void handleExport()}
              disabled={exporting}
            >
              <Ionicons name="document-text-outline" size={18} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>{exporting ? 'Exporting…' : 'Export Plan'}</Text>
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
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
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { ...typography.body, color: colors.textSecondary },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },
  imageWrap: { width: '100%', aspectRatio: 16 / 9, borderRadius: radius.lg, marginBottom: spacing.xs },
  image: { width: '100%', aspectRatio: 16 / 9 },
  conceptBadgeRow: { alignItems: 'center', marginBottom: spacing.xs },
  conceptBadge: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: colors.accent,
    backgroundColor: '#E8F5EE',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  conceptDisclaimer: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 16,
  },
  metaCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  metaLabel: { ...typography.caption, fontWeight: '700', color: colors.textSecondary },
  metaValue: { ...typography.body, fontSize: 14, flex: 1, textAlign: 'right' },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  sectionTitle: { ...typography.heading, fontSize: 15, marginBottom: spacing.sm },
  bodyText: { ...typography.body, color: colors.textSecondary, lineHeight: 21 },
  listItem: { ...typography.body, marginBottom: 6 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  checkBadgeText: { fontSize: 12, fontWeight: '700', color: colors.accent },
  checkText: { ...typography.body, flex: 1 },
  deleteBtn: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  deleteText: { ...typography.body, fontWeight: '700', color: '#B4322E' },
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
  disabled: { opacity: 0.6 },
});
