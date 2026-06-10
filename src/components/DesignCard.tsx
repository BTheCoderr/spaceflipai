import { View, Text, Pressable, StyleSheet } from 'react-native';
import { layout } from '../constants/layout';
import { colors, interaction, radius, shadows, spacing, typography } from '../constants/theme';
import type { DesignCard as DesignCardType } from '../data/mockTools';
import { RemoteImage } from './RemoteImage';

type Props = {
  card: DesignCardType;
  onPress?: () => void;
};

export function DesignCard({ card, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <RemoteImage uri={card.imageUrl} style={styles.image} borderRadius={0} />
      <View style={styles.textWrap}>
        <Text style={styles.title} numberOfLines={2}>{card.title}</Text>
        {card.subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>{card.subtitle}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: layout.gridCardWidth,
    marginBottom: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  image: {
    width: '100%',
    aspectRatio: 1.15,
  },
  textWrap: {
    padding: spacing.sm,
    paddingTop: spacing.sm,
  },
  title: {
    ...typography.heading,
    fontSize: 14,
  },
  subtitle: {
    ...typography.caption,
    fontSize: 12,
    marginTop: 2,
  },
});
