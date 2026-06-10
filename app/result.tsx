import { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Share,
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
import { getProjectTypeLabel } from '../src/data/mockProjectTypes';
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
    currentJob,
    uploadedInputPublicUrl,
    selectedGoal,
    selectedBudgetRange,
    cycleMockResult,
    saveProject,
  } = useGenerationStore();

  const [activeTab, setActiveTab] = useState<ResultTab>('visual');
  const [showBefore, setShowBefore] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const plan = currentUpgradePlan;
  const inputUri =
    params.inputImageUrl ||
    uploadedInputPublicUrl ||
    currentJob?.inputPublicUrl ||
    currentJob?.inputImageUri ||
    selectedInputImage?.uri ||
    '';
  const displayTitle = params.projectTitle ?? getProjectTypeLabel(params.projectType ?? '');
  const goal = params.goal || selectedGoal || 'Improve this property';
  const resultUrls = plan?.resultImageUrls ?? [
    params.imageUrl,
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600',
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600',
  ];
  const currentImageUrl =
    mockResultImageUrl ?? currentJob?.resultImageUrl ?? resultUrls[mockResultIndex % resultUrls.length] ?? params.imageUrl;
  const displayImageUrl = showBefore && inputUri ? inputUri : currentImageUrl;
  const budgetRange = plan?.budgetRange ?? selectedBudgetRange ?? '$2,500 – $7,500';

  const handleClose = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/projects');
  };

  const handleRegenerate = async () => {
    if (regenerating) return;
    setRegenerating(true);
    await new Promise((r) => setTimeout(r, 800));
    cycleMockResult([...resultUrls]);
    setRegenerating(false);
  };

  const handleSave = () => {
    saveProject({
      title: displayTitle,
      projectType: params.projectType ?? currentJob?.toolId ?? 'property',
      projectTypeLabel: getProjectTypeLabel(params.projectType ?? currentJob?.toolId ?? ''),
      goal,
      resultImageUrl: currentImageUrl,
      inputImageUri: inputUri,
      inputPublicUrl: uploadedInputPublicUrl ?? currentJob?.inputPublicUrl,
      jobId: params.jobId ?? currentJob?.id,
      jobStatus: currentJob?.status ?? 'completed',
      status: 'completed',
      budgetRange,
      source: selectedInputImage?.source ?? currentJob?.source ?? 'demo',
    });
    Alert.alert('Saved to Projects', 'Your upgrade plan was saved to Projects.');
  };

  const handleExport = () => {
    Alert.alert('Export Plan', 'Client-ready PDF export coming soon.');
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
              {showBefore ? 'Viewing Original' : 'Viewing Upgrade Concept'}
            </Text>
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
          </>
        ) : null}

        {activeTab === 'plan' ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Upgrade Summary</Text>
            <Text style={styles.panelBody}>{plan?.summary ?? 'Your property upgrade concept is ready.'}</Text>
            <Text style={styles.panelMeta}>Goal: {goal}</Text>
            <Text style={styles.panelMeta}>Project type: {displayTitle}</Text>
            <Text style={styles.sectionHeading}>Notes for Contractor or Client</Text>
            <Text style={styles.panelBody}>{plan?.contractorNotes ?? 'Scope notes will appear here.'}</Text>
          </View>
        ) : null}

        {activeTab === 'budget' ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Budget Range</Text>
            <Text style={styles.budgetValue}>{budgetRange}</Text>
            <Text style={styles.panelBody}>
              Mock estimate based on project type, goal, and visible scope. Final bids should come from licensed trades.
            </Text>
            <Text style={styles.sectionHeading}>Suggested Materials / Items</Text>
            {(plan?.suggestedMaterials ?? []).map((item) => (
              <Text key={item} style={styles.listItem}>• {item}</Text>
            ))}
          </View>
        ) : null}

        {activeTab === 'checklist' ? (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>Priority Checklist</Text>
            {(plan?.priorityChecklist ?? []).map((item, index) => (
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
          style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
          onPress={handleExport}
        >
          <Text style={styles.secondaryBtnText}>Export Plan</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
          onPress={handleSave}
        >
          <Text style={styles.primaryBtnText}>Save Project</Text>
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
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.pillInactive,
  },
  tabActive: { backgroundColor: colors.pillActive },
  tabText: { ...typography.caption, fontWeight: '700', color: colors.text },
  tabTextActive: { color: '#FFFFFF' },
  scroll: { paddingBottom: spacing.lg },
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
});
