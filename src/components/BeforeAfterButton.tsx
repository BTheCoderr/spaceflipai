import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, interaction, radius, spacing } from '../constants/theme';

type Props = {
  active: boolean;
  onPress: () => void;
  /** Label shown when active (defaults to "After"). */
  activeLabel?: string;
  /** Label shown when inactive (defaults to "Before"). */
  inactiveLabel?: string;
};

export function BeforeAfterButton({
  active,
  onPress,
  activeLabel = 'After',
  inactiveLabel = 'Before',
}: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.btn, active && styles.btnActive, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Text style={styles.text}>{active ? activeLabel : inactiveLabel}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.45)',
    minWidth: 72,
    alignItems: 'center',
  },
  btnActive: {
    backgroundColor: colors.text,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
