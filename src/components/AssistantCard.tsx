import { View, Text, Pressable, StyleSheet } from 'react-native';
import { RemoteImage } from './RemoteImage';
import { colors, interaction, radius, shadows, spacing, typography } from '../constants/theme';
import type { Assistant } from '../data/mockAssistants';

type Props = {
  assistant: Assistant;
  onChatPress: (assistant: Assistant) => void;
};

export function AssistantCard({ assistant, onChatPress }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.avatarWrap}>
        {assistant.avatarUrl ? (
          <RemoteImage
            uri={assistant.avatarUrl}
            style={styles.avatar}
            containerStyle={styles.avatarContainer}
            borderRadius={24}
          />
        ) : (
          <Text style={styles.emoji}>{assistant.emoji}</Text>
        )}
      </View>
      <Text style={styles.name} numberOfLines={1}>{assistant.name}</Text>
      <Text style={styles.tagline} numberOfLines={3}>{assistant.tagline}</Text>
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
    width: 150,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginRight: spacing.md,
    ...shadows.card,
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.pillInactive,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  avatarContainer: {
    width: 48,
    height: 48,
  },
  avatar: {
    width: 48,
    height: 48,
  },
  emoji: {
    fontSize: 28,
  },
  name: {
    ...typography.heading,
    fontSize: 15,
    marginBottom: 4,
  },
  tagline: {
    ...typography.caption,
    fontSize: 12,
    marginBottom: spacing.sm,
    minHeight: 48,
  },
  chatBtn: {
    backgroundColor: colors.pillActive,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
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
