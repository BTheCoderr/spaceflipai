import { ScrollView, Text, Pressable, StyleSheet } from 'react-native';
import { colors, interaction, radius, spacing } from '../constants/theme';

type Pill = { key: string; label: string };

type Props = {
  pills: Pill[];
  selected: string;
  onSelect: (key: string) => void;
};

export function FilterPills({ pills, selected, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {pills.map((pill) => {
        const isActive = pill.key === selected;
        return (
          <Pressable
            key={pill.key}
            style={({ pressed }) => [
              styles.pill,
              isActive && styles.pillActive,
              pressed && styles.pressed,
            ]}
            onPress={() => onSelect(pill.key)}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{pill.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.pillInactive,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  pillActive: {
    backgroundColor: colors.background,
    borderColor: colors.text,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.text,
    fontWeight: '700',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
