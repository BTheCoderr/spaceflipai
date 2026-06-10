import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FilterPills } from '../../src/components/FilterPills';
import { ToolGridSection } from '../../src/components/ToolGridSection';
import { TabScreenScroll } from '../../src/components/TabScreenScroll';
import {
  designFilters,
  getToolsByCategory,
  sectionTitles,
  type DesignFilter,
  type DesignTool,
} from '../../src/data/mockTools';
import { colors, spacing, typography } from '../../src/constants/theme';

export default function DesignScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<DesignFilter>('recommend');
  const tools = getToolsByCategory(filter);

  const handleTryIt = (tool: DesignTool) => {
    router.push(`/tool/${tool.id}`);
  };

  const sectionTitle =
    filter === 'recommend' ? undefined : sectionTitles[filter];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>Design</Text>
      <View style={styles.pillsWrap}>
        <FilterPills
          pills={designFilters}
          selected={filter}
          onSelect={(key) => setFilter(key as DesignFilter)}
        />
      </View>
      <TabScreenScroll style={styles.scroll}>
        <ToolGridSection
          title={sectionTitle}
          tools={tools}
          onTryIt={handleTryIt}
        />
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
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  pillsWrap: {
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    zIndex: 1,
  },
  scroll: {
    flex: 1,
  },
});
