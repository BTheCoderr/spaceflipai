import { useState } from 'react';
import { Text, StyleSheet, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SegmentedControl } from '../../src/components/SegmentedControl';
import { ExploreSection } from '../../src/components/ExploreSection';
import { TabScreenScroll } from '../../src/components/TabScreenScroll';
import { exploreData, type ExploreCategory, type ExploreImage, type ExploreSegment } from '../../src/data/mockExplore';
import { colors, spacing, typography } from '../../src/constants/theme';

const segments = [
  { key: 'interior', label: 'Interior' },
  { key: 'exterior', label: 'Exterior' },
];

export default function ExploreScreen() {
  const router = useRouter();
  const [segment, setSegment] = useState<ExploreSegment>('interior');

  const categories = segment === 'interior' ? exploreData.interior : exploreData.exterior;

  const handleImagePress = (image: ExploreImage) => {
    router.push({
      pathname: '/style-detail',
      params: {
        imageUrl: image.imageUrl,
        roomType: image.roomType,
        designStyle: image.designStyle,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <TabScreenScroll>
        <Text style={styles.title}>Explore</Text>
        <View style={styles.segmentWrap}>
          <SegmentedControl
            segments={segments}
            selected={segment}
            onSelect={(key) => setSegment(key as ExploreSegment)}
          />
        </View>
        {categories.map((cat) => (
          <ExploreSection
            key={cat.id}
            category={cat}
            onImagePress={handleImagePress}
            onMorePress={(category: ExploreCategory) =>
              Alert.alert(category.name, `Browse all ${category.name} inspiration (mock).`)
            }
          />
        ))}
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
  segmentWrap: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
});
