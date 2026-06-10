import { View, Text, Pressable, StyleSheet } from 'react-native';
import { RemoteImage } from './RemoteImage';
import { layout } from '../constants/layout';
import { colors, interaction, radius, shadows, spacing, typography } from '../constants/theme';
import type { DesignTool } from '../data/mockTools';

type Props = {
  tool: DesignTool;
  onTryIt: () => void;
};

export function ToolFeatureCard({ tool, onTryIt }: Props) {
  return (
    <View style={styles.card}>
      <RemoteImage uri={tool.imageUrl} style={styles.image} borderRadius={0} />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{tool.title}</Text>
        <Text style={styles.subtitle} numberOfLines={2}>{tool.subtitle}</Text>
        <Pressable
          style={({ pressed }) => [styles.tryBtn, pressed && styles.pressed]}
          onPress={onTryIt}
        >
          <Text style={styles.tryText}>Try It!</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: layout.gridCardWidth,
    marginBottom: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  image: {
    width: '100%',
    aspectRatio: 1.1,
  },
  body: {
    padding: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.heading,
    fontSize: 15,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.caption,
    fontSize: 12,
    marginBottom: spacing.sm,
    minHeight: 32,
  },
  tryBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    minHeight: 36,
    justifyContent: 'center',
  },
  tryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
