import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../constants/theme';

type Props = {
  text: string;
  light?: boolean;
};

export function PaywallBenefit({ text, light }: Props) {
  return (
    <View style={styles.row}>
      <Ionicons name="checkmark-circle" size={22} color={light ? '#FFFFFF' : colors.text} />
      <Text style={[styles.text, light && styles.textLight]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  text: {
    ...typography.body,
    marginLeft: spacing.md,
    flex: 1,
  },
  textLight: {
    color: '#FFFFFF',
  },
});
