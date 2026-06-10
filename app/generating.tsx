import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GenerationProgress } from '../src/components/GenerationProgress';
import { RemoteImage } from '../src/components/RemoteImage';
import { useGenerationStore } from '../src/lib/generationStore';
import {
  completeGenerationJobMock,
  getGenerationJob,
  getGenerationJobStatusLabel,
  updateGenerationJobStatus,
  type GenerationJobStatus,
} from '../src/lib/generationJobs';
import { getProjectTypeById, type ProjectTypeId } from '../src/data/mockProjectTypes';
import { getStepsForProjectType } from '../src/lib/mockUpgradeSteps';
import { colors, radius, spacing, typography } from '../src/constants/theme';

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
  const flowStarted = useRef(false);
  const [stepsDone, setStepsDone] = useState(false);
  const [jobStatus, setJobStatus] = useState<GenerationJobStatus>('queued');

  const {
    selectedInputImage,
    uploadedInputPublicUrl,
    currentJobId,
    currentUpgradePlan,
    completeCurrentJobMock,
    failCurrentJob,
  } = useGenerationStore();

  const activeJobId = jobId ?? currentJobId;
  const project = projectType ? getProjectTypeById(projectType) : undefined;
  const displayTitle = projectTitle ?? project?.label ?? 'Property Upgrade';
  const previewUri = uploadedInputPublicUrl ?? inputImageUrl ?? selectedInputImage?.uri;
  const steps = getStepsForProjectType(projectType ?? project?.id ?? 'empty-commercial');
  const statusLabel = getGenerationJobStatusLabel(jobStatus);

  useEffect(() => {
    if (!activeJobId) {
      router.back();
      return;
    }
    if (flowStarted.current) return;
    flowStarted.current = true;

    const runMockFlow = async () => {
      try {
        setJobStatus('queued');
        await updateGenerationJobStatus(activeJobId, 'queued');
        await new Promise((resolve) => setTimeout(resolve, 600));
        setJobStatus('uploading');
        await updateGenerationJobStatus(activeJobId, 'uploading');
        await new Promise((resolve) => setTimeout(resolve, 800));
        setJobStatus('processing');
        await updateGenerationJobStatus(activeJobId, 'processing');
      } catch (error) {
        console.warn('[SpaceFlip] Job status update failed:', error);
      }
    };

    void runMockFlow();
  }, [activeJobId, router]);

  useEffect(() => {
    if (!activeJobId || !stepsDone || navigated.current) return;

    const finish = async () => {
      try {
        const resultUrl =
          currentUpgradePlan?.resultImageUrls[0] ??
          project?.resultImageUrls[0] ??
          'https://images.unsplash.com/photo-1618221197160-8070ed78f1c9?w=600';

        const job = await completeGenerationJobMock(activeJobId, { resultImageUrl: resultUrl });
        setJobStatus('completed');
        await completeCurrentJobMock(job.resultImageUrl ?? resultUrl, 0);

        if (navigated.current) return;
        navigated.current = true;

        router.replace({
          pathname: '/result',
          params: {
            jobId: activeJobId,
            projectType: projectType ?? project?.id ?? '',
            projectTitle: displayTitle,
            goal: goal ?? '',
            imageUrl: job.resultImageUrl ?? resultUrl,
            inputImageUrl: previewUri ?? job.inputPublicUrl ?? job.inputImageUri ?? '',
          },
        });
      } catch (error) {
        console.warn('[SpaceFlip] Upgrade plan generation failed:', error);
        if (navigated.current) return;
        navigated.current = true;
        await failCurrentJob('We could not finish your upgrade plan. Please try again.');
        Alert.alert(
          'Plan generation failed',
          'We could not finish your upgrade plan. Please try again.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
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
    currentUpgradePlan,
  ]);

  useEffect(() => {
    if (!activeJobId) return;
    const poll = async () => {
      try {
        const job = await getGenerationJob(activeJobId);
        if (job) {
          setJobStatus(job.status);
          if (job.status === 'failed' && !navigated.current) {
            navigated.current = true;
            Alert.alert(
              'Plan generation failed',
              job.errorMessage ?? 'Something went wrong. Please try again.',
              [{ text: 'OK', onPress: () => router.back() }]
            );
          }
        }
      } catch {
        // keep polling
      }
    };
    poll();
    const interval = setInterval(poll, 500);
    return () => clearInterval(interval);
  }, [activeJobId, router]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Building your upgrade plan</Text>
        <Text style={styles.toolName}>{displayTitle}</Text>
        <Text style={styles.statusLabel}>{statusLabel}</Text>
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
        onComplete={() => setStepsDone(true)}
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
