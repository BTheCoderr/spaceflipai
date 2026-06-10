import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../constants/theme';
import type { Assistant } from '../data/mockAssistants';
import { AssistantCard } from './AssistantCard';

type Props = {
  assistants: Assistant[];
  onAssistantPress: (assistant: Assistant) => void;
  onMorePress?: () => void;
};

export function AssistantCarousel({ assistants, onAssistantPress, onMorePress }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Assistant</Text>
        <Pressable onPress={onMorePress}>
          <Text style={styles.more}>More &gt;</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {assistants.map((a) => (
          <AssistantCard key={a.id} assistant={a} onChatPress={onAssistantPress} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  title: {
    ...typography.heading,
  },
  more: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  scroll: {
    paddingHorizontal: spacing.md,
  },
});
