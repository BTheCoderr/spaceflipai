import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GenerationProgress } from '../src/components/GenerationProgress';
import { RemoteImage } from '../src/components/RemoteImage';
import { useGenerationStore } from '../src/lib/generationStore';
import {
  EDGE_GENERATION_ERROR_MESSAGE,
  EDGE_GENERATION_STEPS,
  runUpgradeGeneration,
} from '../src/lib/aiGeneration';
import {
  completeGenerationJobMock,
  getGenerationJobStatusLabel,
} from '../src/lib/generationJobs';
import { getProjectTypeById, type ProjectTypeId } from '../src/data/mockProjectTypes';
import { getStepsForProjectType } from '../src/lib/mockUpgradeSteps';
import { hasSupabaseConfig } from '../src/lib/supabase';
import { colors, radius, spacing, typography } from '../src/constants/theme';

const EDGE_STATUS_LABELS = [
  'Uploading property photo…',
  'Building planning prompt…',
  'Generating upgrade plan…',
  'Reviewing your property photo…',
  'Finalizing PDF-ready plan…',
] as const;

export default function GeneratingScreen() {
  const router = useRouter();
  const { jobId, projectType, projectTitle, goal, inputImageUrl } = useLocalSearchParams<{
    jobId: string;
    projectType?: ProjectTypeId;
    projectTitle?: string;
    goal?: string;
    inputImageUrl?: string;
  }>();

  const navigated = useRef(false);
  const generationStarted = useRef(false);
  const [stepsDone, setStepsDone] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [statusLabel, setStatusLabel] = useState('Preparing your upgrade plan…');

  const {
    selectedInputImage,
    uploadedInputPublicUrl,
    currentJobId,
    completeCurrentJobMock,
    failCurrentJob,
  } = useGenerationStore();

  const useEdgeFlow = hasSupabaseConfig();
  const activeJobId = jobId ?? currentJobId;
  const project = projectType ? getProjectTypeById(projectType) : undefined;
  const displayTitle = projectTitle ?? project?.label ?? 'Property Upgrade';
  const previewUri = uploadedInputPublicUrl ?? inputImageUrl ?? selectedInputImage?.uri;
  const steps = useEdgeFlow
    ? [...EDGE_GENERATION_STEPS]
    : getStepsForProjectType(projectType ?? project?.id ?? 'empty-commercial');

  useEffect(() => {
    if (!activeJobId) {
      router.back();
    }
  }, [activeJobId, router]);

  useEffect(() => {
    if (!useEdgeFlow || stepsDone) return;
    setStatusLabel(EDGE_STATUS_LABELS[stepIndex] ?? EDGE_STATUS_LABELS[0]);
  }, [useEdgeFlow, stepIndex, stepsDone]);

  useEffect(() => {
    if (!activeJobId || !stepsDone || generationStarted.current || navigated.current) return;
    generationStarted.current = true;

    const finish = async () => {
      try {
        const result = await runUpgradeGeneration(activeJobId);
        setStatusLabel('Upgrade plan ready');
        await completeCurrentJobMock(result.resultImageUrl, 0, {
          resultPayload: result.resultPayload,
          planSource: result.planSource,
          aiProvider: result.aiProvider,
          usedFallback: result.usedFallback,
          imageProvider: result.imageProvider,
          conceptImageGenerated: result.conceptImageGenerated,
        });

        if (navigated.current) return;
        navigated.current = true;

        router.replace({
          pathname: '/result',
          params: {
            jobId: activeJobId,
            projectType: projectType ?? project?.id ?? '',
            projectTitle: displayTitle,
            goal: goal ?? '',
            imageUrl: result.resultImageUrl,
            inputImageUrl: previewUri ?? '',
          },
        });
      } catch (error) {
        // runUpgradeGeneration falls back internally; this only fires if even the
        // local fallback failed. Route to Result with the demo plan rather than blocking.
        console.warn('[SpaceFlip Pro] Upgrade plan generation failed:', {
          name: error instanceof Error ? error.name : 'unknown',
        });
        if (navigated.current) return;
        navigated.current = true;

        // Never show a stock/mock image: fall back to the user's original photo.
        const fallbackImage = previewUri ?? '';
        await completeCurrentJobMock(fallbackImage, 0, {
          planSource: 'mock',
          aiProvider: 'mock',
          usedFallback: true,
          imageProvider: 'none',
          conceptImageGenerated: false,
        });

        router.replace({
          pathname: '/result',
          params: {
            jobId: activeJobId,
            projectType: projectType ?? project?.id ?? '',
            projectTitle: displayTitle,
            goal: goal ?? '',
            imageUrl: fallbackImage,
            inputImageUrl: previewUri ?? '',
          },
        });
      }
    };

    void finish();
  }, [
    activeJobId,
    stepsDone,
    completeCurrentJobMock,
    failCurrentJob,
    router,
    projectType,
    project,
    displayTitle,
    goal,
    previewUri,
  ]);

  const handleProgressStep = (index: number) => {
    if (useEdgeFlow) {
      setStepIndex(index);
    }
  };

  const handleComplete = async () => {
    if (useEdgeFlow) {
      setStepsDone(true);
      return;
    }

    // Local path: complete job after progress animation using the original photo.
    try {
      const resultUrl = previewUri ?? selectedInputImage?.uri ?? '';

      const job = await completeGenerationJobMock(activeJobId!, { resultImageUrl: resultUrl || undefined });
      await completeCurrentJobMock(job.resultImageUrl ?? resultUrl, 0, {
        imageProvider: 'none',
        conceptImageGenerated: false,
      });

      if (navigated.current) return;
      navigated.current = true;

      router.replace({
        pathname: '/result',
        params: {
          jobId: activeJobId!,
          projectType: projectType ?? project?.id ?? '',
          projectTitle: displayTitle,
          goal: goal ?? '',
          imageUrl: job.resultImageUrl ?? resultUrl,
          inputImageUrl: previewUri ?? job.inputPublicUrl ?? job.inputImageUri ?? '',
        },
      });
    } catch (error) {
      console.warn('[SpaceFlip Pro] Local mock generation failed:', error);
      if (navigated.current) return;
      navigated.current = true;
      await failCurrentJob(EDGE_GENERATION_ERROR_MESSAGE);
      Alert.alert('Plan generation failed', EDGE_GENERATION_ERROR_MESSAGE, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  const displayStatus = useEdgeFlow
    ? statusLabel
    : getGenerationJobStatusLabel('processing');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Building your upgrade plan</Text>
        <Text style={styles.toolName}>{displayTitle}</Text>
        <Text style={styles.statusLabel}>{displayStatus}</Text>
        {previewUri ? (
          <RemoteImage
            uri={previewUri}
            style={styles.previewImage}
            containerStyle={styles.previewWrap}
            borderRadius={radius.md}
          />
        ) : null}
      </View>
      <GenerationProgress
        steps={steps}
        loadingType="redesign"
        title="Building your upgrade plan…"
        onStepChange={useEdgeFlow ? handleProgressStep : undefined}
        onComplete={() => void handleComplete()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.md, alignItems: 'center' },
  kicker: { ...typography.caption, fontWeight: '700', color: colors.accent, marginBottom: spacing.xs },
  toolName: { ...typography.title, marginBottom: spacing.xs, textAlign: 'center' },
  statusLabel: {
    ...typography.caption,
    marginBottom: spacing.md,
    textAlign: 'center',
    color: colors.textSecondary,
    fontWeight: '600',
  },
  previewWrap: { width: '100%', maxWidth: 280, aspectRatio: 4 / 3, marginBottom: spacing.sm },
  previewImage: { width: '100%', aspectRatio: 4 / 3 },
});
