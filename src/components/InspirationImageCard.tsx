import { Pressable, StyleSheet } from 'react-native';
import { layout } from '../constants/layout';
import { interaction, radius, shadows, spacing } from '../constants/theme';
import type { ExploreImage } from '../data/mockExplore';
import { RemoteImage } from './RemoteImage';

type Props = {
  image: ExploreImage;
  onPress: (image: ExploreImage) => void;
};

export function InspirationImageCard({ image, onPress }: Props) {
  const size = layout.inspirationCardSize;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, { width: size, height: size }, pressed && styles.pressed]}
      onPress={() => onPress(image)}
    >
      <RemoteImage uri={image.imageUrl} style={{ width: size, height: size }} borderRadius={radius.lg} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginRight: spacing.sm,
    ...shadows.card,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
