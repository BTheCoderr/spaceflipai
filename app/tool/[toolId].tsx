import { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { ToolUploadScreen } from '../../src/components/ToolUploadScreen';
import { getToolById } from '../../src/data/mockTools';
import { getToolUploadHint } from '../../src/data/toolUploadHints';
import { getDemoPhotosForInputType, type DemoPhoto } from '../../src/data/mockDemoPhotos';
import { createGenerationJob, type GenerationServiceError } from '../../src/lib/generation';
import { useGenerationStore } from '../../src/lib/generationStore';
import {
  demoPhotoToPickedImage,
  handleImagePickerError,
  pickImageFromCamera,
  pickImageFromGallery,
} from '../../src/lib/imagePicker';
import { uploadRoomPhoto } from '../../src/lib/storage';
import { colors, spacing, typography } from '../../src/constants/theme';

export default function ToolScreen() {
  const router = useRouter();
  const { toolId } = useLocalSearchParams<{ toolId: string }>();
  const tool = getToolById(toolId ?? '');
  const {
    selectedInputImage,
    setSelectedTool,
    setSelectedInputImage,
    startMockGeneration,
  } = useGenerationStore();

  const [selectedDemoId, setSelectedDemoId] = useState<string>();
  const [userPrompt, setUserPrompt] = useState('');
  const [continuing, setContinuing] = useState(false);
  const [picking, setPicking] = useState(false);

  if (!tool) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Tool" />
        <Text style={styles.error}>Tool not found</Text>
      </SafeAreaView>
    );
  }

  const demoPhotos = getDemoPhotosForInputType(tool.inputType);
  const uploadHint = getToolUploadHint(tool.id, 'Select a demo photo or use camera/gallery');

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
    if (!selectedInputImage || continuing) return;
    setContinuing(true);
    try {
      setSelectedTool(tool.id, tool.title, tool.loadingType);
      const photo = await uploadRoomPhoto(selectedInputImage.uri);
      const job = await createGenerationJob({
        type: 'design_tool',
        roomType: tool.title,
        designStyle: tool.title,
        inputPhotoId: photo.id,
        inputPhotoStoragePath: photo.storagePath,
        toolId: tool.id,
        inputImageUrl: selectedInputImage.uri,
        userPrompt: userPrompt.trim() || tool.subtitle,
        loadingType: tool.loadingType,
      });
      startMockGeneration({
        jobId: job.id,
        toolId: tool.id,
        toolName: tool.title,
        loadingType: tool.loadingType,
        roomType: tool.title,
        designStyle: tool.title,
      });
      router.push({
        pathname: '/generating',
        params: {
          jobId: job.id,
          toolId: tool.id,
          loadingType: tool.loadingType,
          toolName: tool.title,
          inputImageUrl: selectedInputImage.uri,
        },
      });
    } catch (e) {
      const err = e as GenerationServiceError;
      if (err.code === 'quota_exceeded') {
        Alert.alert('No generations left', 'Upgrade to Pro for more generations.', [
          { text: 'Upgrade', onPress: () => router.push('/paywall') },
          { text: 'Cancel', style: 'cancel' },
        ]);
      } else {
        Alert.alert('Error', err.message ?? 'Could not start generation.');
      }
    } finally {
      setContinuing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="" />
      <ToolUploadScreen
        tool={tool}
        uploadHint={uploadHint}
        demoPhotos={demoPhotos}
        selectedImage={selectedInputImage}
        selectedDemoId={selectedDemoId}
        userPrompt={userPrompt}
        onPromptChange={setUserPrompt}
        onPickCamera={handlePickCamera}
        onPickGallery={handlePickGallery}
        onSelectDemo={handleSelectDemo}
        onContinue={handleContinue}
        continuing={continuing}
        picking={picking}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  error: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
