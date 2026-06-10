import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, interaction, spacing, typography } from '../constants/theme';

type Props = {
  label: string;
  onPress: () => void;
  showChevron?: boolean;
};

export function SettingsRow({ label, onPress, showChevron = true }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Text style={styles.label}>{label}</Text>
      {showChevron && <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  label: {
    ...typography.body,
    fontSize: 16,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
