import { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  Pressable,
  Text,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RemoteImage } from '../src/components/RemoteImage';
import { ResultActionBar } from '../src/components/ResultActionBar';
import { useGenerationStore } from '../src/lib/generationStore';
import {
  exportAndSharePlanFromViewModel,
  ExportPlanError,
  EXPORT_PLAN_ERROR_MESSAGE,
} from '../src/lib/exportPlan';
import {
  buildResultPlanViewModel,
  getResultDisplayImageUrl,
} from '../src/lib/resultPlanData';
import { colors, interaction, radius, spacing, typography } from '../src/constants/theme';

type ResultTab = 'visual' | 'plan' | 'budget' | 'checklist';

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    jobId: string;
    projectType?: string;
    projectTitle?: string;
    goal?: string;
    imageUrl: string;
    inputImageUrl?: string;
  }>();

  const {
    selectedInputImage,
    mockResultImageUrl,
    mockResultIndex,
    currentUpgradePlan,
    currentResultPayload,
    currentPlanSource,
    currentAiProvider,
    currentUsedFallback,
    currentJob,
    uploadedInputPublicUrl,
    selectedGoal,
    selectedBudgetRange,
    cycleMockResult,
    saveCurrentProject,
    savedProjectsError,
  } = useGenerationStore();

  const [activeTab, setActiveTab] = useState<ResultTab>('visual');
  const [showBefore, setShowBefore] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const viewModel = useMemo(
    () =>
      buildResultPlanViewModel(params, {
        selectedGoal,
        selectedBudgetRange,
        mockResultImageUrl,
        mockResultIndex,
        currentUpgradePlan,
        currentResultPayload,
        currentPlanSource,
        currentAiProvider,
        currentJob,
        uploadedInputPublicUrl,
        selectedInputImage,
      }),
    [
      params,
      selectedGoal,
      selectedBudgetRange,
      mockResultImageUrl,
      mockResultIndex,
      currentUpgradePlan,
      currentResultPayload,
      currentPlanSource,
      currentAiProvider,
      currentJob,
      uploadedInputPublicUrl,
      selectedInputImage,
    ]
  );

  const displayImageUrl = getResultDisplayImageUrl(viewModel, showBefore);
  const { displayTitle, goal, budgetRange, inputUri, panelCopy, planSourceLabel, aiProviderDevLabel } =
    viewModel;

  const handleClose = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/projects');
  };

  const handleRegenerate = async () => {
    if (regenerating) return;
    setRegenerating(true);
    await new Promise((r) => setTimeout(r, 800));
    cycleMockResult([...viewModel.resultUrls]);
    setRegenerating(false);
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await saveCurrentProject();
      Alert.alert('Saved to Projects', 'Your upgrade plan was saved to Projects.');
    } catch {
      Alert.alert(
        'Could not save',
        savedProjectsError ?? "Couldn't save this project. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const { pdfUri, shared } = await exportAndSharePlanFromViewModel(viewModel);
      if (!shared) {
        Alert.alert(
          'PDF ready',
          `Sharing is not available on this device. Your plan was saved to:\n\n${pdfUri}`
        );
      }
    } catch (error) {
      const message =
        error instanceof ExportPlanError ? error.message : EXPORT_PLAN_ERROR_MESSAGE;
      Alert.alert('Could not export', message);
    } finally {
      setExporting(false);
    }
  };

  const tabs: { id: ResultTab; label: string }[] = [
    { id: 'visual', label: 'Visual' },
    { id: 'plan', label: 'Plan' },
    { id: 'budget', label: 'Budget' },
    { id: 'checklist', label: 'Checklist' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={handleClose} hitSlop={interaction.hitSlop} style={styles.iconBtn}>
          <Ionicons name="close" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{displayTitle}</Text>
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.planSourceRow}>
        <Text style={styles.planSourceLabel}>{planSourceLabel}</Text>
        {__DEV__ && aiProviderDevLabel ? (
          <Text style={styles.aiProviderDevLabel}>{aiProviderDevLabel}</Text>
        ) : null}
      </View>

      {currentUsedFallback ? (
        <View style={styles.fallbackNote}>
          <Ionicons name="information-circle-outline" size={15} color={colors.textSecondary} />
          <Text style={styles.fallbackNoteText}>
            AI generation was unavailable, so SpaceFlip Pro prepared a demo planning draft. You can
            still review every tab and export a PDF.
          </Text>
        </View>
      ) : null}

      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {activeTab === 'visual' ? (
          <>
            <Text style={styles.compareLabel}>
              {showBefore ? 'Original Property Photo' : 'Concept Reference'}
            </Text>
            {!showBefore ? (
              <Text style={styles.compareSubLabel}>{panelCopy.visualSubtitle}</Text>
            ) : null}
            <View style={styles.imageArea}>
              <RemoteImage uri={displayImageUrl} style={styles.image} containerStyle={styles.imageContainer} />
              {inputUri ? (
                <ResultActionBar
                  showBefore={showBefore}
                  onToggleBefore={() => setShowBefore((v) => !v)}
                  onThumbsUp={() => Alert.alert('Thanks!', 'Feedback recorded (mock).')}
                  onThumbsDown={() => Alert.alert('Feedback', 'We will refine this plan type (mock).')}
                />
              ) : null}
            </View>
            <Text style={styles.conceptDisclaimer}>
              Planning reference only. Final design and pricing should be verified by professionals.
            </Text>
          </>
        ) : null}

        {activeTab === 'plan' ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Upgrade Summary</Text>
            <Text style={styles.panelSubtitle}>{viewModel.businessOutcome}</Text>
            <Text style={styles.panelBody}>{viewModel.summary}</Text>
            <Text style={styles.panelMeta}>Goal: {goal}</Text>
            <Text style={styles.panelMeta}>Project type: {displayTitle}</Text>
            {viewModel.riskNotes.length > 0 ? (
              <>
                <Text style={styles.sectionHeading}>Planning Risks</Text>
                {viewModel.riskNotes.map((item) => (
                  <Text key={item} style={styles.listItem}>• {item}</Text>
                ))}
              </>
            ) : null}
            <Text style={styles.sectionHeading}>Notes for Contractor or Client</Text>
            <Text style={styles.panelBody}>{viewModel.contractorNotes}</Text>
          </View>
        ) : null}

        {activeTab === 'budget' ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Budget Range</Text>
            <Text style={styles.budgetValue}>{budgetRange}</Text>
            <Text style={styles.panelSubtitle}>{panelCopy.budgetSubtitle}</Text>
            <Text style={styles.panelBody}>
              Mock estimate based on project type, goal, and visible scope. Final bids should come from licensed trades.
            </Text>
            <Text style={styles.sectionHeading}>Suggested Materials / Items</Text>
            {viewModel.suggestedMaterials.map((item) => (
              <Text key={item} style={styles.listItem}>• {item}</Text>
            ))}
          </View>
        ) : null}

        {activeTab === 'checklist' ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Priority Checklist</Text>
            <Text style={styles.panelSubtitle}>{panelCopy.checklistSubtitle}</Text>
            {viewModel.priorityChecklist.map((item, index) => (
              <View key={item} style={styles.checkRow}>
                <View style={styles.checkBadge}>
                  <Text style={styles.checkBadgeText}>{index + 1}</Text>
                </View>
                <Text style={styles.checkText}>{item}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.secondaryBtn,
            pressed && styles.pressed,
            exporting && styles.disabledBtn,
          ]}
          onPress={() => void handleExport()}
          disabled={exporting}
        >
          <Text style={styles.secondaryBtnText}>
            {exporting ? 'Exporting…' : 'Export Plan'}
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed, saving && styles.disabledBtn]}
          onPress={() => void handleSave()}
          disabled={saving}
        >
          <Text style={styles.primaryBtnText}>{saving ? 'Saving…' : 'Save Project'}</Text>
        </Pressable>
      </View>

      {activeTab === 'visual' ? (
        <Pressable
          style={({ pressed }) => [styles.regenerateBtn, pressed && styles.pressed]}
          onPress={handleRegenerate}
          disabled={regenerating}
        >
          <Text style={styles.regenerateText}>
            {regenerating ? 'Refreshing concept…' : 'Try another concept'}
          </Text>
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.heading, flex: 1, textAlign: 'center' },
  planSourceRow: {
    alignItems: 'center',
    paddingBottom: spacing.xs,
  },
  planSourceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  aiProviderDevLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
    opacity: 0.7,
  },
  fallbackNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.pillInactive,
  },
  fallbackNoteText: { ...typography.caption, flex: 1, color: colors.textSecondary },
  compareSubLabel: {
    ...typography.caption,
    fontSize: 11,
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: -2,
    marginBottom: spacing.xs,
  },
  conceptDisclaimer: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    lineHeight: 16,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.pillInactive,
  },
  tabActive: { backgroundColor: colors.pillActive },
  tabText: { fontSize: 11, fontWeight: '700', color: colors.text, textAlign: 'center' },
  tabTextActive: { color: '#FFFFFF' },
  scroll: { paddingBottom: spacing.lg },
  panelSubtitle: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  compareLabel: {
    ...typography.caption,
    textAlign: 'center',
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  imageArea: {
    minHeight: 280,
    paddingHorizontal: spacing.md,
    position: 'relative',
    marginBottom: spacing.md,
  },
  imageContainer: { minHeight: 280 },
  image: { minHeight: 280 },
  panel: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8 }, android: { elevation: 2 } }),
  },
  panelTitle: { ...typography.heading, marginBottom: spacing.sm },
  panelBody: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.sm },
  panelMeta: { ...typography.caption, marginBottom: 4 },
  sectionHeading: { ...typography.heading, fontSize: 15, marginTop: spacing.sm, marginBottom: spacing.sm },
  budgetValue: { ...typography.title, color: colors.accentSecondary, marginBottom: spacing.sm },
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
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  secondaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  secondaryBtnText: { fontWeight: '700', color: colors.text },
  primaryBtn: {
    flex: 1,
    backgroundColor: colors.pillActive,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryBtnText: { fontWeight: '700', color: '#FFFFFF' },
  regenerateBtn: { alignItems: 'center', paddingVertical: spacing.sm },
  regenerateText: { ...typography.caption, fontWeight: '700', color: colors.accent },
  pressed: { opacity: interaction.pressedOpacity },
  disabledBtn: { opacity: 0.6 },
});
