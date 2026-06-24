import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../src/lib/profileStore';
import { colors, interaction, radius, spacing, typography } from '../src/constants/theme';

const { width } = Dimensions.get('window');

type Slide = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
};

const slides: Slide[] = [
  {
    icon: 'camera-outline',
    title: 'Turn a photo into a plan',
    body: 'Upload a property or space photo and generate a practical upgrade plan in seconds.',
  },
  {
    icon: 'briefcase-outline',
    title: 'Built for your business',
    body: 'Made for Airbnb hosts, landlords, realtors, contractors, and small businesses — budget ranges, materials, checklists, and contractor notes.',
  },
  {
    icon: 'document-text-outline',
    title: 'Export and hand off',
    body: 'Save projects and export a client-ready PDF you can hand to clients, contractors, or your team.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { completeOnboarding } = useProfile();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);

  const isLast = index === slides.length - 1;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== index) setIndex(next);
  };

  const goNext = async () => {
    if (isLast) {
      await completeOnboarding();
      router.replace('/login');
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  const skip = async () => {
    await completeOnboarding();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable onPress={skip} hitSlop={interaction.hitSlop}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(item) => item.title}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon} size={48} color={colors.accent} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {slides.map((slide, i) => (
          <View key={slide.title} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          onPress={goNext}
        >
          <Text style={styles.buttonText}>{isLast ? 'Get Started' : 'Next'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topBar: { alignItems: 'flex-end', paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  skip: { ...typography.body, fontWeight: '600', color: colors.textSecondary },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconWrap: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: { ...typography.largeTitle, fontSize: 26, textAlign: 'center', marginBottom: spacing.md },
  body: {
    ...typography.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs, marginBottom: spacing.lg },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: { backgroundColor: colors.accent, width: 22 },
  footer: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  button: {
    backgroundColor: colors.pillActive,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  pressed: { opacity: interaction.pressedOpacity },
});
