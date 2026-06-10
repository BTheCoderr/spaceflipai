import { Text, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { RemoteImage } from './RemoteImage';
import { PhotoUploadSection } from './PhotoUploadSection';
import { colors, interaction, radius, spacing, typography } from '../constants/theme';
import type { DemoPhoto } from '../data/mockDemoPhotos';
import type { DesignTool } from '../data/mockTools';
import type { PickedImage } from '../lib/imagePicker';

type Props = {
  tool: DesignTool;
  uploadHint: string;
  demoPhotos: DemoPhoto[];
  selectedImage?: PickedImage;
  selectedDemoId?: string;
  userPrompt: string;
  onPromptChange: (text: string) => void;
  onPickCamera: () => void;
  onPickGallery: () => void;
  onSelectDemo: (photo: DemoPhoto) => void;
  onContinue: () => void;
  continuing?: boolean;
  picking?: boolean;
};

export function ToolUploadScreen({
  tool,
  uploadHint,
  demoPhotos,
  selectedImage,
  selectedDemoId,
  userPrompt,
  onPromptChange,
  onPickCamera,
  onPickGallery,
  onSelectDemo,
  onContinue,
  continuing,
  picking,
}: Props) {
  const canContinue = !!selectedImage && !continuing;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      <RemoteImage
        uri={tool.imageUrl}
        style={styles.heroImage}
        containerStyle={styles.heroWrap}
      />
      <Text style={styles.toolName}>{tool.title}</Text>
      <Text style={styles.description}>{tool.description}</Text>

      <Text style={styles.sectionLabel}>What do you want to do?</Text>
      <TextInput
        style={styles.promptInput}
        value={userPrompt}
        onChangeText={onPromptChange}
        placeholder={tool.promptPlaceholder}
        placeholderTextColor={colors.textSecondary}
        multiline
      />

      <PhotoUploadSection
        uploadHint={uploadHint}
        selectedImage={selectedImage}
        demoPhotos={demoPhotos}
        selectedDemoId={selectedDemoId}
        onPickCamera={onPickCamera}
        onPickGallery={onPickGallery}
        onSelectDemo={onSelectDemo}
        picking={picking}
      />

      <Pressable
        style={({ pressed }) => [
          styles.continueBtn,
          !canContinue && styles.continueDisabled,
          pressed && canContinue && styles.pressed,
        ]}
        onPress={onContinue}
        disabled={!canContinue}
      >
        <Text style={[styles.continueText, !canContinue && styles.continueTextDisabled]}>
          Continue
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: spacing.xl,
  },
  heroWrap: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    aspectRatio: 16 / 10,
  },
  heroImage: {
    width: '100%',
    aspectRatio: 16 / 10,
  },
  toolName: {
    ...typography.title,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  description: {
    ...typography.body,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    color: colors.textSecondary,
  },
  sectionLabel: {
    ...typography.heading,
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  promptInput: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.pillInactive,
    borderRadius: radius.lg,
    padding: spacing.md,
    minHeight: 80,
    fontSize: 15,
    color: colors.text,
    textAlignVertical: 'top',
  },
  continueBtn: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    backgroundColor: colors.pillActive,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  continueDisabled: {
    backgroundColor: colors.pillInactive,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  continueTextDisabled: {
    color: colors.textSecondary,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
