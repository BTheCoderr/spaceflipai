import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, interaction, radius, spacing, typography } from '../constants/theme';

type Props = {
  onGetPro: () => void;
};

export function ProBanner({ onGetPro }: Props) {
  return (
    <LinearGradient
      colors={[colors.proGradientStart, colors.proGradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.banner}
    >
      <View style={styles.content}>
        <Text style={styles.title}>SpaceFlip AI ✦</Text>
        <Text style={styles.subtitle}>Unlimited access to all design features</Text>
      </View>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        onPress={onGetPro}
      >
        <Text style={styles.buttonText}>Get Pro</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  buttonText: {
    ...typography.heading,
    fontSize: 14,
    color: colors.text,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
