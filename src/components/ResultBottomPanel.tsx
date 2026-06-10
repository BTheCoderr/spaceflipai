import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, interaction, radius, spacing, typography } from '../constants/theme';

const ACTION_CHIPS = [
  'Save',
  'Share',
  'Replace',
  'Rearrange',
  'Decor',
  'Walls',
  'Floor',
  'Window',
  'Declutter',
  'Remove',
  'Cleanup',
  'Export',
] as const;

type Props = {
  toolName: string;
  referenceLabel?: string;
  regenerating?: boolean;
  onRegenerate: () => void;
  onAction: (action: string) => void;
};

export function ResultBottomPanel({
  toolName,
  referenceLabel = 'Reference',
  regenerating,
  onRegenerate,
  onAction,
}: Props) {
  return (
    <View style={styles.panel}>
      <View style={styles.refRow}>
        <View style={styles.refBadge}>
          <Ionicons name="image-outline" size={16} color={colors.text} />
          <Text style={styles.refText}>{referenceLabel}</Text>
        </View>
        <Text style={styles.toolName} numberOfLines={1}>{toolName}</Text>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.regenerateBtn,
          pressed && styles.pressed,
          regenerating && styles.disabled,
        ]}
        onPress={onRegenerate}
        disabled={regenerating}
      >
        {regenerating ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Ionicons name="refresh-outline" size={18} color="#FFFFFF" />
            <Text style={styles.regenerateText}>Regenerate</Text>
          </>
        )}
      </Pressable>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {ACTION_CHIPS.map((chip) => (
          <Pressable
            key={chip}
            style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
            onPress={() => onAction(chip)}
          >
            <Text style={styles.chipText}>{chip}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  refBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.pillInactive,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  refText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  toolName: {
    ...typography.heading,
    fontSize: 15,
    flex: 1,
  },
  regenerateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.text,
    marginHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    marginBottom: spacing.md,
    minHeight: 48,
  },
  regenerateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  chips: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.pillInactive,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  disabled: {
    opacity: 0.5,
  },
});
