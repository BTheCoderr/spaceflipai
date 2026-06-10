import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, interaction, radius, shadows, spacing } from '../constants/theme';

type Segment = {
  key: string;
  label: string;
};

type Props = {
  segments: Segment[];
  selected: string;
  onSelect: (key: string) => void;
};

export function SegmentedControl({ segments, selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      {segments.map((seg) => {
        const isActive = seg.key === selected;
        return (
          <Pressable
            key={seg.key}
            style={({ pressed }) => [
              styles.segment,
              isActive && styles.segmentActive,
              pressed && styles.pressed,
            ]}
            onPress={() => onSelect(seg.key)}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{seg.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.pillInactive,
    borderRadius: radius.md,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  segmentActive: {
    backgroundColor: colors.background,
    ...shadows.subtle,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.pillInactiveText,
  },
  labelActive: {
    color: colors.text,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
