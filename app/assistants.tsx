import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { AssistantGridCard } from '../src/components/AssistantGridCard';
import { assistants } from '../src/data/mockAssistants';
import type { Assistant } from '../src/data/mockAssistants';
import { colors, spacing } from '../src/constants/theme';

export default function AssistantsScreen() {
  const router = useRouter();

  const handleChat = (assistant: Assistant) => {
    router.push(`/assistant/${assistant.id}`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="AI Assistant" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.grid}>
          {assistants.map((assistant) => (
            <AssistantGridCard
              key={assistant.id}
              assistant={assistant}
              onChatPress={handleChat}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  scroll: {
    flexGrow: 1,
  },
});
