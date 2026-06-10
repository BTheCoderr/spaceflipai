import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ToolHeroCard } from '../../src/components/ToolHeroCard';
import { AssistantCarousel } from '../../src/components/AssistantCarousel';
import { PromptChip } from '../../src/components/PromptChip';
import { TabScreenScroll } from '../../src/components/TabScreenScroll';
import { assistants, aiPromptSuggestions } from '../../src/data/mockAssistants';
import type { Assistant } from '../../src/data/mockAssistants';
import { colors, spacing, typography } from '../../src/constants/theme';

export default function AIToolsScreen() {
  const router = useRouter();

  const handleAssistantPress = (assistant: Assistant) => {
    router.push(`/assistant/${assistant.id}`);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TabScreenScroll>
        <Text style={styles.title}>AI Tools</Text>
        <View style={styles.heroSection}>
          <ToolHeroCard
            title="Create Space"
            subtitle="Start creating your dream space"
            icon="home-outline"
            onPress={() => router.push('/tool/interior-design')}
          />
          <ToolHeroCard
            title="Create Painting"
            subtitle="Design unique paintings for your home"
            icon="brush-outline"
            onPress={() => router.push('/create-painting')}
          />
        </View>
        <AssistantCarousel
          assistants={assistants}
          onAssistantPress={handleAssistantPress}
          onMorePress={() => router.push('/assistants')}
        />
        <Text style={styles.chipsTitle}>Try asking</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {aiPromptSuggestions.map((prompt) => (
            <PromptChip
              key={prompt}
              label={prompt}
              onPress={() =>
                router.push({
                  pathname: '/assistant/designer',
                  params: { seedPrompt: prompt },
                })
              }
            />
          ))}
        </ScrollView>
      </TabScreenScroll>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.largeTitle,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  heroSection: {
    paddingHorizontal: spacing.md,
  },
  chipsTitle: {
    ...typography.heading,
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  chips: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
});
