import { View, StyleSheet } from 'react-native';
import { BeforeAfterButton } from './BeforeAfterButton';
import { spacing } from '../constants/theme';

type Props = {
  showBefore: boolean;
  onToggleBefore: () => void;
};

export function ResultActionBar({ showBefore, onToggleBefore }: Props) {
  return (
    <View style={styles.bar}>
      <BeforeAfterButton
        active={showBefore}
        onPress={onToggleBefore}
        activeLabel="Original"
        inactiveLabel="Concept"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    gap: spacing.sm,
    alignItems: 'center',
  },
});
