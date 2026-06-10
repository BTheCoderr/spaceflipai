import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { RemoteImage } from '../src/components/RemoteImage';
import { PhotoUploadSection } from '../src/components/PhotoUploadSection';
import { designStyles } from '../src/data/mockStyles';
import { getDemoPhotosForInputType } from '../src/data/mockDemoPhotos';
import { createGenerationJob, type GenerationServiceError } from '../src/lib/generation';
import { useGenerationStore } from '../src/lib/generationStore';
import {
  demoPhotoToPickedImage,
  handleImagePickerError,
  pickImageFromCamera,
  pickImageFromGallery,
} from '../src/lib/imagePicker';
import { uploadRoomPhoto } from '../src/lib/storage';
import { mapRoomTypeToPromptParams } from '../src/lib/ai/promptBuilder';
import { layout } from '../src/constants/layout';
import { colors, interaction, radius, spacing, typography } from '../src/constants/theme';
import type { DemoPhoto } from '../src/data/mockDemoPhotos';

export default function StyleTransferScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ roomType?: string; designStyle?: string }>();
  const {
    selectedInputImage,
    setSelectedInputImage,
    setSelectedStyle,
    startMockGeneration,
  } = useGenerationStore();

  const [selectedStyle, setSelectedStyleLocal] = useState(
    params.designStyle ?? 'Modern'
  );
  const [selectedDemoId, setSelectedDemoId] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [picking, setPicking] = useState(false);
  const roomType = params.roomType ?? 'Living Room';
  const demoPhotos = getDemoPhotosForInputType('interior');

  const handleSelectStyle = (name: string) => {
    setSelectedStyleLocal(name);
    setSelectedStyle(name);
  };

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

  const handleGenerate = async () => {
    if (loading || !selectedInputImage) return;
    setLoading(true);
    try {
      const photo = await uploadRoomPhoto(selectedInputImage.uri);
      const promptParams = mapRoomTypeToPromptParams(roomType, selectedStyle);
      const job = await createGenerationJob({
        roomType,
        designStyle: selectedStyle,
        type: 'style_transfer',
        inputPhotoId: photo.id,
        inputPhotoStoragePath: photo.storagePath,
        promptParams,
        toolId: 'style-transfer',
        inputImageUrl: selectedInputImage.uri,
      });
      startMockGeneration({
        jobId: job.id,
        toolId: 'style-transfer',
        toolName: 'Style Transfer',
        loadingType: 'redesign',
        roomType,
        designStyle: selectedStyle,
      });
      router.push({
        pathname: '/generating',
        params: {
          jobId: job.id,
          toolId: 'style-transfer',
          loadingType: 'redesign',
          toolName: 'Style Transfer',
          inputImageUrl: selectedInputImage.uri,
          roomType,
          designStyle: selectedStyle,
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
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Style Transfer" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <PhotoUploadSection
          uploadHint="Upload a room photo or choose a demo image"
          selectedImage={selectedInputImage}
          demoPhotos={demoPhotos}
          selectedDemoId={selectedDemoId}
          onPickCamera={handlePickCamera}
          onPickGallery={handlePickGallery}
          onSelectDemo={handleSelectDemo}
          picking={picking}
        />

        <Text style={styles.sectionLabel}>Room Type</Text>
        <Text style={styles.roomType}>{roomType}</Text>

        <Text style={styles.sectionLabel}>Choose Style</Text>
        <View style={styles.styleGrid}>
          {designStyles.map((style) => {
            const isSelected = style.name === selectedStyle;
            return (
              <Pressable
                key={style.id}
                style={({ pressed }) => [
                  styles.styleCard,
                  isSelected && styles.styleCardSelected,
                  pressed && styles.pressed,
                ]}
                onPress={() => handleSelectStyle(style.name)}
              >
                <RemoteImage
                  uri={style.imageUrl}
                  style={styles.styleImage}
                  containerStyle={styles.styleImageWrap}
                  borderRadius={radius.sm}
                />
                <Text style={[styles.styleName, isSelected && styles.styleNameSelected]}>
                  {style.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            !selectedInputImage && styles.buttonDisabled,
            pressed && selectedInputImage && styles.pressed,
            loading && styles.disabled,
          ]}
          onPress={handleGenerate}
          disabled={!selectedInputImage || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={[styles.buttonText, !selectedInputImage && styles.buttonTextDisabled]}>
              Generate
            </Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.heading,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  roomType: {
    ...typography.body,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    color: colors.textSecondary,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  styleCard: {
    width: layout.styleGridCardWidth,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: spacing.sm,
  },
  styleCardSelected: {
    borderColor: colors.text,
  },
  styleImageWrap: {
    width: '100%',
    aspectRatio: 1,
  },
  styleImage: {
    width: '100%',
    aspectRatio: 1,
  },
  styleName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 4,
  },
  styleNameSelected: {
    color: colors.text,
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
  buttonDisabled: {
    backgroundColor: colors.pillInactive,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  buttonTextDisabled: {
    color: colors.textSecondary,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  disabled: {
    opacity: 0.6,
  },
});
