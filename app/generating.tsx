import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GenerationProgress } from '../src/components/GenerationProgress';
import { RemoteImage } from '../src/components/RemoteImage';
import { getGenerationStatus } from '../src/lib/generation';
import { useGenerationStore } from '../src/lib/generationStore';
import { getToolById } from '../src/data/mockTools';
import {
  getStepsForLoadingType,
  type LoadingType,
} from '../src/lib/mockGenerationSteps';
import { colors, radius, spacing, typography } from '../src/constants/theme';

export default function GeneratingScreen() {
  const router = useRouter();
  const { jobId, toolId, loadingType, toolName, inputImageUrl, roomType, designStyle } =
    useLocalSearchParams<{
      jobId: string;
      toolId?: string;
      loadingType?: LoadingType;
      toolName?: string;
      inputImageUrl?: string;
      roomType?: string;
      designStyle?: string;
    }>();
  const navigated = useRef(false);
  const [stepsDone, setStepsDone] = useState(false);
  const { selectedInputImage, completeMockGeneration } = useGenerationStore();

  const tool = toolId ? getToolById(toolId) : undefined;
  const displayToolName = toolName ?? tool?.title ?? 'Style Transfer';
  const previewUri = inputImageUrl ?? selectedInputImage?.uri;
  const steps = getStepsForLoadingType((loadingType as LoadingType) ?? tool?.loadingType ?? 'redesign');

  useEffect(() => {
    if (!jobId) {
      router.back();
      return;
    }

    const poll = async () => {
      try {
        const job = await getGenerationStatus(jobId);
        if (job.status === 'completed' && job.resultUrl && stepsDone && !navigated.current) {
          navigated.current = true;
          completeMockGeneration(job.resultUrl, job.resultIndex ?? 0);
          router.replace({
            pathname: '/result',
            params: {
              jobId,
              imageUrl: job.resultUrl,
              roomType: roomType ?? job.roomType,
              designStyle: designStyle ?? job.designStyle,
              toolId: toolId ?? job.toolId ?? '',
              toolName: displayToolName,
              inputImageUrl: previewUri ?? job.inputImageUrl ?? '',
              resultIndex: String(job.resultIndex ?? 0),
            },
          });
        }
        if (job.status === 'failed' && !navigated.current) {
          navigated.current = true;
          router.back();
        }
      } catch {
        // keep polling
      }
    };

    poll();
    const interval = setInterval(poll, 500);
    return () => clearInterval(interval);
  }, [
    jobId,
    roomType,
    designStyle,
    toolId,
    displayToolName,
    previewUri,
    stepsDone,
    router,
    completeMockGeneration,
  ]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.toolName}>{displayToolName}</Text>
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
        loadingType={(loadingType as LoadingType) ?? tool?.loadingType ?? 'redesign'}
        onComplete={() => setStepsDone(true)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    alignItems: 'center',
  },
  toolName: {
    ...typography.title,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  previewWrap: {
    width: '100%',
    maxWidth: 280,
    aspectRatio: 4 / 3,
    marginBottom: spacing.sm,
  },
  previewImage: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
});
