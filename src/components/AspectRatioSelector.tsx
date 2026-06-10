import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, interaction, radius, spacing, typography } from '../constants/theme';
import type { AspectRatio } from '../data/mockPaintings';

type Option = { key: AspectRatio; label: string };

type Props = {
  options: Option[];
  selected: AspectRatio;
  onSelect: (key: AspectRatio) => void;
};

export function AspectRatioSelector({ options, selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      {options.map((opt) => {
        const isActive = opt.key === selected;
        return (
          <Pressable
            key={opt.key}
            style={({ pressed }) => [
              styles.pill,
              isActive && styles.pillActive,
              pressed && styles.pressed,
            ]}
            onPress={() => onSelect(opt.key)}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.pillInactive,
  },
  pillActive: {
    backgroundColor: colors.pillActive,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.pillInactiveText,
  },
  labelActive: {
    color: '#FFFFFF',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
