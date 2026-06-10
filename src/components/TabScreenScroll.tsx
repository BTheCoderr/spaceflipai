import { ScrollView, type ScrollViewProps, StyleSheet } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { spacing } from '../constants/theme';

type Props = ScrollViewProps & {
  extraBottom?: number;
};

export function TabScreenScroll({
  contentContainerStyle,
  extraBottom = spacing.lg,
  ...props
}: Props) {
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      {...props}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: tabBarHeight + extraBottom },
        contentContainerStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
});
