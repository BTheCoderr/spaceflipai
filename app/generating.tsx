import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GenerationProgress } from '../src/components/GenerationProgress';
import { RemoteImage } from '../src/components/RemoteImage';
import { useGenerationStore } from '../src/lib/generationStore';
import {
  AiGenerationError,
  EDGE_GENERATION_ERROR_MESSAGE,
  EDGE_GENERATION_STEPS,
  runUpgradeGeneration,
} from '../src/lib/aiGeneration';
import {
  completeGenerationJobMock,
  getGenerationJob,
  getGenerationJobStatusLabel,
} from '../src/lib/generationJobs';
import { getProjectTypeById, type ProjectTypeId } from '../src/data/mockProjectTypes';
import { getStepsForProjectType } from '../src/lib/mockUpgradeSteps';
import { hasSupabaseConfig } from '../src/lib/supabase';
import { colors, radius, spacing, typography } from '../src/constants/theme';

const EDGE_STATUS_LABELS = [
  'Preparing your upgrade plan…',
  'Property photo ready',
  'Building upgrade prompt…',
  'Creating upgrade concept…',
  'Finalizing project plan…',
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
        await completeCurrentJobMock(result.resultImageUrl, 0);

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
        console.warn('[SpaceFlip Pro] Upgrade plan generation failed:', error);
        if (navigated.current) return;
        navigated.current = true;

        const message =
          error instanceof AiGenerationError ? error.message : EDGE_GENERATION_ERROR_MESSAGE;
        await failCurrentJob(message);
        Alert.alert('Plan generation failed', message, [
          { text: 'OK', onPress: () => router.back() },
        ]);
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

  useEffect(() => {
    if (!activeJobId || !useEdgeFlow) return;

    const poll = async () => {
      try {
        const job = await getGenerationJob(activeJobId);
        if (job?.status === 'failed' && !navigated.current) {
          navigated.current = true;
          Alert.alert(
            'Plan generation failed',
            job.errorMessage ?? EDGE_GENERATION_ERROR_MESSAGE,
            [{ text: 'OK', onPress: () => router.back() }]
          );
        }
      } catch {
        // keep polling
      }
    };

    poll();
    const interval = setInterval(poll, 800);
    return () => clearInterval(interval);
  }, [activeJobId, useEdgeFlow, router]);

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

    // Local mock path: complete job after progress animation (unchanged behavior).
    try {
      const resultUrl =
        project?.resultImageUrls[0] ??
        'https://images.unsplash.com/photo-1618221197160-8070ed78f1c9?w=600';

      const job = await completeGenerationJobMock(activeJobId!, { resultImageUrl: resultUrl });
      await completeCurrentJobMock(job.resultImageUrl ?? resultUrl, 0);

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
