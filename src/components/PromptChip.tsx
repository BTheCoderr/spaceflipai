import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, interaction, radius, spacing } from '../constants/theme';

type Props = {
  label: string;
  selected?: boolean;
  onPress: () => void;
};

export function PromptChip({ label, selected, onPress }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.chip,
        selected && styles.chipSelected,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.text, selected && styles.textSelected]} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.pillInactive,
    maxWidth: 280,
  },
  chipSelected: {
    backgroundColor: colors.pillActive,
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 18,
  },
  textSelected: {
    color: '#FFFFFF',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
