import { View, Text, Pressable, StyleSheet } from 'react-native';
import { RemoteImage } from './RemoteImage';
import { layout } from '../constants/layout';
import { colors, interaction, radius, shadows, spacing, typography } from '../constants/theme';
import type { Assistant } from '../data/mockAssistants';

type Props = {
  assistant: Assistant;
  onChatPress: (assistant: Assistant) => void;
};

export function AssistantGridCard({ assistant, onChatPress }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.avatarWrap}>
        {assistant.avatarUrl ? (
          <RemoteImage
            uri={assistant.avatarUrl}
            style={styles.avatar}
            containerStyle={styles.avatarContainer}
            borderRadius={32}
          />
        ) : (
          <Text style={styles.emoji}>{assistant.emoji}</Text>
        )}
      </View>
      <Text style={styles.name} numberOfLines={1}>{assistant.name}</Text>
      <Text style={styles.desc} numberOfLines={2}>{assistant.tagline}</Text>
      <Pressable
        style={({ pressed }) => [styles.chatBtn, pressed && styles.pressed]}
        onPress={() => onChatPress(assistant)}
      >
        <Text style={styles.chatText}>Chat</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: layout.gridCardWidth,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    ...shadows.card,
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.pillInactive,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  avatarContainer: {
    width: 64,
    height: 64,
  },
  avatar: {
    width: 64,
    height: 64,
  },
  emoji: {
    fontSize: 32,
  },
  name: {
    ...typography.heading,
    fontSize: 15,
    marginBottom: 4,
    textAlign: 'center',
  },
  desc: {
    ...typography.caption,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: spacing.sm,
    minHeight: 32,
  },
  chatBtn: {
    backgroundColor: colors.text,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    minWidth: 88,
    alignItems: 'center',
  },
  chatText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
