import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, interaction, spacing, typography } from '../constants/theme';

type Props = {
  label: string;
  onPress: () => void;
  showChevron?: boolean;
  destructive?: boolean;
};

export function SettingsRow({ label, onPress, showChevron = true, destructive = false }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Text style={[styles.label, destructive && styles.labelDestructive]}>{label}</Text>
      {showChevron && !destructive && (
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      )}
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
  labelDestructive: {
    color: '#C0392B',
    fontWeight: '600',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
