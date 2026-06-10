import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DemoPhotoCarousel } from './DemoPhotoCarousel';
import { RemoteImage } from './RemoteImage';
import type { DemoPhoto } from '../data/mockDemoPhotos';
import type { PickedImage } from '../lib/imagePicker';
import { colors, interaction, radius, spacing, typography } from '../constants/theme';

type Props = {
  uploadHint: string;
  selectedImage?: PickedImage;
  demoPhotos: DemoPhoto[];
  selectedDemoId?: string;
  onPickCamera: () => void;
  onPickGallery: () => void;
  onSelectDemo: (photo: DemoPhoto) => void;
  picking?: boolean;
};

export function PhotoUploadSection({
  uploadHint,
  selectedImage,
  demoPhotos,
  selectedDemoId,
  onPickCamera,
  onPickGallery,
  onSelectDemo,
  picking,
}: Props) {
  return (
    <>
      <Text style={styles.uploadHintText}>{uploadHint}</Text>
      <View style={styles.uploadBox}>
        {selectedImage ? (
          <>
            <RemoteImage
              uri={selectedImage.uri}
              style={styles.selectedPreview}
              containerStyle={styles.selectedWrap}
            />
            <Text style={styles.selectedLabel}>Photo selected</Text>
            {selectedImage.width > 0 && selectedImage.height > 0 ? (
              <Text style={styles.selectedMeta}>
                {selectedImage.width} × {selectedImage.height}
                {selectedImage.source === 'demo' ? ' · Demo' : ` · ${selectedImage.source === 'camera' ? 'Camera' : 'Gallery'}`}
              </Text>
            ) : (
              <Text style={styles.selectedMeta}>Demo photo</Text>
            )}
          </>
        ) : (
          <>
            <Ionicons name="cloud-upload-outline" size={36} color={colors.textSecondary} />
            <Text style={styles.uploadPlaceholder}>Use camera, gallery, or a demo photo</Text>
          </>
        )}
        <View style={styles.uploadActions}>
          <Pressable
            style={({ pressed }) => [styles.uploadBtn, pressed && styles.pressed, picking && styles.disabled]}
            onPress={onPickCamera}
            disabled={picking}
          >
            <Ionicons name="camera-outline" size={20} color={colors.text} />
            <Text style={styles.uploadBtnText}>Camera</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.uploadBtn, pressed && styles.pressed, picking && styles.disabled]}
            onPress={onPickGallery}
            disabled={picking}
          >
            <Ionicons name="images-outline" size={20} color={colors.text} />
            <Text style={styles.uploadBtnText}>Gallery</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.demoLabel}>Demo photos</Text>
      <DemoPhotoCarousel
        photos={demoPhotos}
        selectedId={selectedDemoId}
        onSelect={onSelectDemo}
      />
    </>
  );
}

const styles = StyleSheet.create({
  uploadHintText: {
    ...typography.caption,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    color: colors.textSecondary,
  },
  uploadBox: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    padding: spacing.lg,
    alignItems: 'center',
    backgroundColor: colors.pillInactive,
    minHeight: 200,
    justifyContent: 'center',
  },
  uploadPlaceholder: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  selectedWrap: {
    width: '100%',
    aspectRatio: 4 / 3,
    marginBottom: spacing.sm,
  },
  selectedPreview: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  selectedLabel: {
    ...typography.heading,
    fontSize: 15,
  },
  selectedMeta: {
    ...typography.caption,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  uploadActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  uploadBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  demoLabel: {
    ...typography.heading,
    fontSize: 15,
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  disabled: {
    opacity: 0.5,
  },
});
