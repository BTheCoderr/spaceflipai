import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BeforeAfterButton } from './BeforeAfterButton';
import { colors, interaction, spacing } from '../constants/theme';

type Props = {
  showBefore: boolean;
  onToggleBefore: () => void;
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
};

export function ResultActionBar({
  showBefore,
  onToggleBefore,
  onThumbsUp,
  onThumbsDown,
}: Props) {
  return (
    <View style={styles.bar}>
      <Pressable
        style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
        onPress={onThumbsDown}
      >
        <Ionicons name="thumbs-down-outline" size={22} color="#FFFFFF" />
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
        onPress={onThumbsUp}
      >
        <Ionicons name="thumbs-up-outline" size={22} color="#FFFFFF" />
      </Pressable>
      <BeforeAfterButton
        active={showBefore}
        onPress={onToggleBefore}
        activeLabel="Original"
        inactiveLabel="Concept"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    gap: spacing.sm,
    alignItems: 'center',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
