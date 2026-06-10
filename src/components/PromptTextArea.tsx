import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '../constants/theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  maxLength?: number;
  placeholder?: string;
};

export function PromptTextArea({
  value,
  onChangeText,
  maxLength = 500,
  placeholder = 'Describe your painting...',
}: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        multiline
        maxLength={maxLength}
        textAlignVertical="top"
      />
      <Text style={styles.counter}>
        {value.length}/{maxLength}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.pillInactive,
    borderRadius: radius.lg,
    padding: spacing.md,
    minHeight: 120,
  },
  input: {
    ...typography.body,
    minHeight: 80,
    color: colors.text,
  },
  counter: {
    ...typography.caption,
    textAlign: 'right',
    marginTop: spacing.sm,
  },
});
