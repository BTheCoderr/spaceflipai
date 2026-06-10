import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, interaction, spacing, typography } from '../constants/theme';

type Props = {
  title: string;
  variant?: 'back' | 'close';
  onPress?: () => void;
};

export function ScreenHeader({ title, variant = 'back', onPress }: Props) {
  const router = useRouter();
  const icon = variant === 'close' ? 'close' : 'chevron-back';

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/projects');
    }
  };

  return (
    <View style={styles.row}>
      <Pressable
        onPress={handlePress}
        hitSlop={interaction.hitSlop}
        style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
      >
        <Ionicons name={icon} size={26} color={colors.text} />
      </Pressable>
      {title ? <Text style={styles.title} numberOfLines={1}>{title}</Text> : <View style={styles.spacer} />}
      <View style={styles.iconBtn} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    flex: 1,
  },
  title: {
    ...typography.heading,
    flex: 1,
    textAlign: 'center',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
