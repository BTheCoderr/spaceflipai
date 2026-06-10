import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getStepDurationMs, type LoadingType } from '../lib/mockGenerationSteps';
import { colors, radius, spacing, typography } from '../constants/theme';

type Props = {
  steps: string[];
  loadingType: LoadingType;
  onComplete?: () => void;
};

export function GenerationProgress({ steps, loadingType, onComplete }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const duration = getStepDurationMs(loadingType);

  useEffect(() => {
    if (stepIndex >= steps.length - 1) {
      const t = setTimeout(() => onComplete?.(), duration);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStepIndex((i) => i + 1), duration);
    return () => clearTimeout(t);
  }, [stepIndex, steps.length, duration, onComplete]);

  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color={colors.text} />
      <Text style={styles.title}>Creating your design…</Text>
      <View style={styles.steps}>
        {steps.map((step, i) => {
          const done = i < stepIndex;
          const active = i === stepIndex;
          return (
            <View key={step} style={styles.stepRow}>
              <Ionicons
                name={done ? 'checkmark-circle' : active ? 'ellipse' : 'ellipse-outline'}
                size={18}
                color={done || active ? colors.text : colors.textSecondary}
              />
              <Text
                style={[
                  styles.stepText,
                  (done || active) && styles.stepTextActive,
                ]}
              >
                {step}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  title: {
    ...typography.title,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  steps: {
    alignSelf: 'stretch',
    backgroundColor: colors.pillInactive,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepText: {
    ...typography.body,
    fontSize: 15,
    color: colors.textSecondary,
    flex: 1,
  },
  stepTextActive: {
    color: colors.text,
    fontWeight: '600',
  },
});
