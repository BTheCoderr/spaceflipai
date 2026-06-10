import { View, Text, StyleSheet } from 'react-native';
import { ToolFeatureCard } from './ToolFeatureCard';
import { colors, spacing, typography } from '../constants/theme';
import type { DesignTool } from '../data/mockTools';

type Props = {
  title?: string;
  tools: DesignTool[];
  onTryIt: (tool: DesignTool) => void;
};

export function ToolGridSection({ title, tools, onTryIt }: Props) {
  return (
    <View style={styles.section}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      <View style={styles.grid}>
        {tools.map((tool) => (
          <ToolFeatureCard key={tool.id} tool={tool} onTryIt={() => onTryIt(tool)} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.heading,
    fontSize: 20,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    color: colors.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
});
