import { Text, Pressable, StyleSheet } from 'react-native';
import { RemoteImage } from './RemoteImage';
import { layout } from '../constants/layout';
import { colors, interaction, radius } from '../constants/theme';
import type { PaintingStyle } from '../data/mockPaintings';

type Props = {
  style: PaintingStyle;
  selected: boolean;
  onPress: (style: PaintingStyle) => void;
};

export function PaintingStyleCard({ style, selected, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && styles.pressed,
      ]}
      onPress={() => onPress(style)}
    >
      <RemoteImage
        uri={style.imageUrl}
        style={styles.image}
        containerStyle={styles.imageWrap}
        borderRadius={radius.sm}
      />
      <Text style={[styles.name, selected && styles.nameSelected]} numberOfLines={1}>
        {style.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: layout.styleGridCardWidth,
    marginBottom: 12,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: colors.text,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  nameSelected: {
    color: colors.text,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
