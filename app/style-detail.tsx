import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '../src/components/ScreenHeader';
import { RemoteImage } from '../src/components/RemoteImage';
import { colors, interaction, radius, spacing, typography } from '../src/constants/theme';

export default function StyleDetailScreen() {
  const router = useRouter();
  const { imageUrl, roomType, designStyle } = useLocalSearchParams<{
    imageUrl: string;
    roomType: string;
    designStyle: string;
  }>();

  const handleTryStyle = () => {
    router.push({
      pathname: '/style-transfer',
      params: { roomType, designStyle },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.imageWrap}>
          <RemoteImage uri={imageUrl} style={styles.image} containerStyle={styles.imageContainer} />
        </View>
        <View style={styles.info}>
          <View style={styles.row}>
            <Text style={styles.label}>Room Type</Text>
            <Text style={styles.value}>{roomType}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Design Style</Text>
            <Text style={styles.value}>{designStyle}</Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          onPress={handleTryStyle}
        >
          <Text style={styles.buttonText}>Try This Style</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: spacing.lg,
  },
  imageWrap: {
    paddingHorizontal: spacing.md,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  info: {
    padding: spacing.lg,
  },
  row: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    marginBottom: 4,
  },
  value: {
    ...typography.title,
    fontSize: 20,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  button: {
    backgroundColor: colors.pillActive,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
