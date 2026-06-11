import { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { PhotoUploadSection } from '../../src/components/PhotoUploadSection';
import {
  budgetRangeOptions,
  getProjectTypeById,
  projectGoals,
  type ProjectTypeId,
} from '../../src/data/mockProjectTypes';
import { getDemoPhotosForInputType, type DemoPhoto } from '../../src/data/mockDemoPhotos';
import { type GenerationJobError } from '../../src/lib/generationJobs';
import { useGenerationStore } from '../../src/lib/generationStore';
import {
  demoPhotoToPickedImage,
  handleImagePickerError,
  pickImageFromCamera,
  pickImageFromGallery,
} from '../../src/lib/imagePicker';
import { StorageUploadError } from '../../src/lib/storage';
import { colors, interaction, radius, spacing, typography } from '../../src/constants/theme';

export default function ProjectIntakeScreen() {
  const router = useRouter();
  const { projectType: projectTypeParam } = useLocalSearchParams<{ projectType: string }>();
  const projectType = getProjectTypeById(projectTypeParam ?? '');

  const {
    selectedInputImage,
    setSelectedInputImage,
    setProjectIntake,
    uploadSelectedImage,
    createJobForSelectedImage,
    clearGenerationError,
    failCurrentJob,
    startMockGeneration,
  } = useGenerationStore();

  const [selectedGoal, setSelectedGoal] = useState<string>();
  const [selectedBudget, setSelectedBudget] = useState<string>();
  const [notes, setNotes] = useState('');
  const [selectedDemoId, setSelectedDemoId] = useState<string>();
  const [continuing, setContinuing] = useState(false);
  const [picking, setPicking] = useState(false);

  const goals = useMemo(() => {
    if (!projectType) return [];
    return projectGoals[projectType.id as ProjectTypeId] ?? [];
  }, [projectType]);

  const demoPhotos = getDemoPhotosForInputType(
    projectType?.id.includes('landscape') || projectType?.id.includes('exterior')
      ? 'exterior'
      : projectType?.id.includes('office') || projectType?.id.includes('retail') || projectType?.id.includes('commercial')
        ? 'commercial'
        : 'interior'
  );

  if (!projectType) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Project Intake" />
        <Text style={styles.error}>Project type not found.</Text>
      </SafeAreaView>
    );
  }

  const handleSelectDemo = (photo: DemoPhoto) => {
    setSelectedDemoId(photo.id);
    setSelectedInputImage(demoPhotoToPickedImage(photo), photo);
  };

  const handlePickCamera = async () => {
    setPicking(true);
    try {
      const image = await pickImageFromCamera();
      if (image) {
        setSelectedDemoId(undefined);
        setSelectedInputImage(image);
      }
    } catch (error) {
      handleImagePickerError(error);
    } finally {
      setPicking(false);
    }
  };

  const handlePickGallery = async () => {
    setPicking(true);
    try {
      const image = await pickImageFromGallery();
      if (image) {
        setSelectedDemoId(undefined);
        setSelectedInputImage(image);
      }
    } catch (error) {
      handleImagePickerError(error);
    } finally {
      setPicking(false);
    }
  };

  const handleContinue = async () => {
    if (!selectedInputImage || !selectedGoal || continuing) {
      if (!selectedInputImage) Alert.alert('Photo needed', 'Please upload or choose a property photo.');
      if (!selectedGoal) Alert.alert('Goal needed', 'Please select your primary upgrade goal.');
      return;
    }

    setContinuing(true);
    clearGenerationError();

    try {
      setProjectIntake({
        projectTypeId: projectType.id,
        goal: selectedGoal,
        budgetRange: selectedBudget,
        notes: notes.trim() || undefined,
        projectTitle: projectType.label,
      });

      const upload = await uploadSelectedImage();
      const job = await createJobForSelectedImage({
        projectTypeId: projectType.id,
        goal: selectedGoal,
        budgetRange: selectedBudget,
        projectTitle: projectType.label,
      });

      startMockGeneration({
        jobId: job.id,
        projectTypeId: projectType.id,
        projectTitle: projectType.label,
        goal: selectedGoal,
      });

      router.push({
        pathname: '/generating',
        params: {
          jobId: job.id,
          projectType: projectType.id,
          projectTitle: projectType.label,
          goal: selectedGoal,
          inputImageUrl: upload.publicUrl ?? selectedInputImage.uri,
        },
      });
    } catch (e) {
      const jobErr = e as GenerationJobError;
      if (jobErr.code === 'quota_exceeded') {
        Alert.alert('No plans left', 'Upgrade to Pro for more property upgrade plans.', [
          { text: 'Upgrade', onPress: () => router.push('/paywall') },
          { text: 'Cancel', style: 'cancel' },
        ]);
      } else if (jobErr.code === 'table_missing') {
        Alert.alert('Database setup needed', jobErr.message);
      } else if (e instanceof StorageUploadError || jobErr.message) {
        const message =
          e instanceof StorageUploadError
            ? e.message
            : jobErr.message ?? 'Could not start your upgrade plan. Please try again.';
        await failCurrentJob(message);
        Alert.alert('Could not continue', message);
      } else {
        Alert.alert('Error', 'Could not start your upgrade plan. Please try again.');
      }
    } finally {
      setContinuing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title={projectType.label} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionLabel}>What kind of space is this?</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>{projectType.label}</Text>
          <Text style={styles.infoBody}>{projectType.description}</Text>
        </View>

        <Text style={styles.sectionLabel}>What is your goal?</Text>
        <View style={styles.chipWrap}>
          {goals.map((goal) => {
            const selected = selectedGoal === goal;
            return (
              <Pressable
                key={goal}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => setSelectedGoal(goal)}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{goal}</Text>
              </Pressable>
            );
          })}
        </View>

        <PhotoUploadSection
          uploadHint="Upload property photos or choose a demo image"
          selectedImage={selectedInputImage}
          demoPhotos={demoPhotos}
          selectedDemoId={selectedDemoId}
          onPickCamera={handlePickCamera}
          onPickGallery={handlePickGallery}
          onSelectDemo={handleSelectDemo}
          picking={picking}
        />

        <Text style={styles.sectionLabel}>Optional budget range</Text>
        <View style={styles.chipWrap}>
          {budgetRangeOptions.map((budget) => {
            const selected = selectedBudget === budget;
            return (
              <Pressable
                key={budget}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => setSelectedBudget(budget)}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{budget}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Optional notes</Text>
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="Client requirements, timeline, constraints…"
          placeholderTextColor={colors.textSecondary}
          multiline
        />
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            (!selectedInputImage || !selectedGoal) && styles.buttonDisabled,
            pressed && selectedInputImage && selectedGoal && styles.pressed,
            continuing && styles.disabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedInputImage || !selectedGoal || continuing}
        >
          {continuing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text
              style={[
                styles.buttonText,
                (!selectedInputImage || !selectedGoal) && styles.buttonTextDisabled,
              ]}
            >
              Continue
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing.lg },
  sectionLabel: {
    ...typography.heading,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  infoCard: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: { ...typography.heading, marginBottom: 4 },
  infoBody: { ...typography.body, color: colors.textSecondary },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.pillInactive,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipSelected: { backgroundColor: colors.pillActive },
  chipText: { ...typography.caption, fontWeight: '600', color: colors.text },
  chipTextSelected: { color: '#FFFFFF' },
  notesInput: {
    marginHorizontal: spacing.md,
    minHeight: 96,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    ...typography.body,
    backgroundColor: colors.surface,
    textAlignVertical: 'top',
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  button: {
    backgroundColor: colors.pillActive,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  buttonDisabled: { backgroundColor: colors.pillInactive },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  buttonTextDisabled: { color: colors.textSecondary },
  pressed: { opacity: interaction.pressedOpacity },
  disabled: { opacity: 0.6 },
  error: { ...typography.body, textAlign: 'center', marginTop: spacing.xl },
});
