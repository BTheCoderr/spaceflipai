import { ScrollView, Pressable, Text, Image, StyleSheet } from 'react-native';
import { layout } from '../constants/layout';
import { colors, interaction, radius, spacing } from '../constants/theme';
import type { ExamplePropertyPhoto } from '../data/examplePropertyPhotos';

type Props = {
  photos: ExamplePropertyPhoto[];
  selectedId?: string;
  onSelect: (photo: ExamplePropertyPhoto) => void;
};

export function ExamplePhotoCarousel({ photos, selectedId, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {photos.map((photo) => {
        const selected = photo.id === selectedId;
        return (
          <Pressable
            key={photo.id}
            style={({ pressed }) => [
              styles.card,
              selected && styles.cardSelected,
              pressed && styles.pressed,
            ]}
            onPress={() => onSelect(photo)}
          >
            <Image source={photo.asset} style={styles.image} resizeMode="cover" />
            <Text style={styles.label} numberOfLines={1}>{photo.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const CARD_SIZE = Math.min(112, layout.screenWidth * 0.28);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  card: {
    width: CARD_SIZE,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: colors.text,
  },
  image: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: radius.md,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
