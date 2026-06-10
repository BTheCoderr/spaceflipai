import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { RemoteImage } from '../src/components/RemoteImage';
import { mockPaintingResultUrls } from '../src/data/mockPaintings';
import { colors, interaction, radius, spacing, typography } from '../src/constants/theme';

export default function PaintingResultScreen() {
  const router = useRouter();
  const { prompt, style, aspectRatio, frame } = useLocalSearchParams<{
    prompt: string;
    style: string;
    aspectRatio: string;
    frame: string;
  }>();

  const [imageIndex, setImageIndex] = useState(0);
  const [regenerating, setRegenerating] = useState(false);
  const currentImageUrl = mockPaintingResultUrls[imageIndex % mockPaintingResultUrls.length];

  const handleRegenerate = async () => {
    if (regenerating) return;
    setRegenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setImageIndex((prev) => (prev + 1) % mockPaintingResultUrls.length);
    setRegenerating(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Your Painting" />
      <View style={styles.imageWrap}>
        <RemoteImage
          uri={currentImageUrl}
          style={styles.image}
          containerStyle={styles.imageContainer}
        />
      </View>
      <Text style={styles.meta} numberOfLines={2}>{prompt}</Text>
      <Text style={styles.tags}>{style} · {aspectRatio} · {frame} frame</Text>
      <View style={styles.actions}>
        <ActionButton
          icon="download-outline"
          label="Save"
          onPress={() => Alert.alert('Saved', 'Painting saved (mock).')}
        />
        <ActionButton
          icon="share-outline"
          label="Share"
          onPress={() => Alert.alert('Share', 'Share sheet would open here (mock).')}
        />
        <ActionButton
          icon="refresh-outline"
          label="Regenerate"
          onPress={handleRegenerate}
          disabled={regenerating}
          loading={regenerating}
        />
        <ActionButton
          icon="home-outline"
          label="Try in Room"
          onPress={() =>
            router.push({
              pathname: '/style-transfer',
              params: { roomType: 'Living Room', designStyle: style },
            })
          }
        />
      </View>
    </SafeAreaView>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  disabled,
  loading,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionBtn,
        (pressed || disabled) && styles.pressed,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.text} />
      ) : (
        <Ionicons name={icon} size={22} color={colors.text} />
      )}
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  imageWrap: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 200,
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    flex: 1,
  },
  meta: {
    ...typography.body,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: 4,
  },
  tags: {
    ...typography.caption,
    textAlign: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 4,
    minWidth: 68,
    minHeight: 52,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  disabled: {
    opacity: 0.4,
  },
});
