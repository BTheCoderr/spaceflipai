import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { PromptTextArea } from '../src/components/PromptTextArea';
import { AspectRatioSelector } from '../src/components/AspectRatioSelector';
import { PaintingStyleCard } from '../src/components/PaintingStyleCard';
import {
  paintingStyles,
  aspectRatios,
  type AspectRatio,
  type FrameOption,
  type PaintingStyle,
} from '../src/data/mockPaintings';
import { colors, interaction, radius, spacing, typography } from '../src/constants/theme';

export default function CreatePaintingScreen() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [frame, setFrame] = useState<FrameOption>('none');
  const [selectedStyle, setSelectedStyle] = useState<PaintingStyle>(paintingStyles[0]);

  const canGenerate = prompt.trim().length > 0;

  const handleGenerate = () => {
    if (!canGenerate) return;
    router.push({
      pathname: '/painting-result',
      params: {
        prompt,
        style: selectedStyle.name,
        aspectRatio,
        frame,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Create Painting" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionLabel}>Enter Your Prompt</Text>
        <View style={styles.section}>
          <PromptTextArea
            value={prompt}
            onChangeText={setPrompt}
            placeholder="Describe the style of painting you want, e.g. abstract and modernist painting"
          />
        </View>

        <View style={styles.optionsSection}>
          <Pressable
            style={({ pressed }) => [styles.optionPill, pressed && styles.pressed]}
            onPress={() => Alert.alert('Inspiration', 'Browse inspiration gallery (mock).')}
          >
            <Text style={styles.optionText}>Inspiration</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.optionPill,
              frame !== 'none' && styles.optionPillActive,
              pressed && styles.pressed,
            ]}
            onPress={() => setFrame(frame === 'none' ? 'black' : 'none')}
          >
            <Text style={[styles.optionText, frame !== 'none' && styles.optionTextActive]}>
              Frame
            </Text>
          </Pressable>
          <View style={styles.aspectWrap}>
            <AspectRatioSelector
              options={aspectRatios}
              selected={aspectRatio}
              onSelect={setAspectRatio}
            />
          </View>
        </View>

        <Text style={styles.sectionLabel}>Explore</Text>
        <View style={styles.styleGrid}>
          {paintingStyles.map((style) => (
            <PaintingStyleCard
              key={style.id}
              style={style}
              selected={selectedStyle.id === style.id}
              onPress={setSelectedStyle}
            />
          ))}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            !canGenerate && styles.buttonDisabled,
            pressed && canGenerate && styles.pressed,
          ]}
          onPress={handleGenerate}
          disabled={!canGenerate}
        >
          <Text style={[styles.buttonText, !canGenerate && styles.buttonTextDisabled]}>
            Generate
          </Text>
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
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionLabel: {
    ...typography.heading,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  optionsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  aspectWrap: {
    flex: 1,
    minWidth: '100%',
  },
  optionPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.pillInactive,
  },
  optionPillActive: {
    backgroundColor: colors.pillActive,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.pillInactiveText,
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
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
});
