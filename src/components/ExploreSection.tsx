import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { colors, interaction, spacing, typography } from '../constants/theme';
import type { ExploreCategory, ExploreImage } from '../data/mockExplore';
import { InspirationImageCard } from './InspirationImageCard';

type Props = {
  category: ExploreCategory;
  onImagePress: (image: ExploreImage) => void;
  onMorePress?: (category: ExploreCategory) => void;
};

export function ExploreSection({ category, onImagePress, onMorePress }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{category.name}</Text>
        <Pressable
          onPress={() => onMorePress?.(category)}
          hitSlop={interaction.hitSlop}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={styles.more}>More &gt;</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {category.images.map((img) => (
          <InspirationImageCard key={img.id} image={img} onPress={onImagePress} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  title: {
    ...typography.heading,
    flex: 1,
    marginRight: spacing.sm,
  },
  more: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingRight: spacing.lg,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
