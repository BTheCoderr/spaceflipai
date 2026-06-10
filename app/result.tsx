import { useState } from 'react';
import { View, StyleSheet, Alert, Share, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text } from 'react-native';
import { RemoteImage } from '../src/components/RemoteImage';
import { ResultActionBar } from '../src/components/ResultActionBar';
import { ResultBottomPanel } from '../src/components/ResultBottomPanel';
import { getToolById } from '../src/data/mockTools';
import { useGenerationStore } from '../src/lib/generationStore';
import { colors, interaction, spacing, typography } from '../src/constants/theme';

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    jobId: string;
    imageUrl: string;
    roomType: string;
    designStyle: string;
    toolId?: string;
    toolName?: string;
    inputImageUrl?: string;
    resultIndex?: string;
  }>();

  const {
    selectedInputImage,
    mockResultImageUrl,
    mockResultIndex,
    cycleMockResult,
    saveProject,
  } = useGenerationStore();

  const tool = params.toolId ? getToolById(params.toolId) : undefined;
  const inputUri = params.inputImageUrl || selectedInputImage?.uri || '';
  const displayName = params.toolName ?? tool?.title ?? 'Result';

  const defaultResultUrls: [string, string, string] = [
    params.imageUrl,
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600',
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600',
  ];
  const resultUrls = tool?.resultImageUrls ?? defaultResultUrls;
  const storeIndex = mockResultImageUrl ? mockResultIndex : Number(params.resultIndex ?? 0);
  const currentImageUrl =
    mockResultImageUrl ?? resultUrls[storeIndex % resultUrls.length] ?? params.imageUrl;

  const [regenerating, setRegenerating] = useState(false);
  const [showBefore, setShowBefore] = useState(false);

  const displayImageUrl = showBefore && inputUri ? inputUri : currentImageUrl;
  const compareLabel = showBefore ? 'Viewing Original' : 'Viewing AI Result';

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/design');
    }
  };

  const handleRegenerate = async () => {
    if (regenerating) return;
    setRegenerating(true);
    await new Promise((r) => setTimeout(r, 1000));
    cycleMockResult([...resultUrls]);
    setRegenerating(false);
  };

  const handleShare = async () => {
    try {
      const message = `Check out my ${displayName} design from SpaceFlip AI`;
      if (Platform.OS === 'web') {
        Alert.alert('Share', message);
        return;
      }
      await Share.share({
        message,
        url: currentImageUrl.startsWith('file://') ? currentImageUrl : undefined,
      });
    } catch {
      Alert.alert('Share', 'Share sheet would open here (mock).');
    }
  };

  const handleAction = async (action: string) => {
    switch (action) {
      case 'Save':
        if (!currentImageUrl) {
          Alert.alert('Save', 'No result image available.');
          return;
        }
        saveProject({
          toolName: displayName,
          toolId: params.toolId,
          resultImageUrl: currentImageUrl,
          inputImageUri: inputUri,
          source: selectedInputImage?.source ?? 'demo',
        });
        Alert.alert('Saved to Mine', 'Your design was saved to My Projects.');
        break;
      case 'Share':
        await handleShare();
        break;
      case 'Export':
        Alert.alert('Export', 'PDF export coming soon.');
        break;
      default:
        Alert.alert(action, `${action} will connect to the ${displayName} tool (mock).`);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={handleClose}
          hitSlop={interaction.hitSlop}
          style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
        >
          <Ionicons name="close" size={26} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{displayName}</Text>
        <View style={styles.closeBtn} />
      </View>

      {inputUri ? (
        <Text style={styles.compareLabel}>{compareLabel}</Text>
      ) : null}

      <View style={styles.imageArea}>
        <RemoteImage
          uri={displayImageUrl}
          style={styles.image}
          containerStyle={styles.imageContainer}
        />
        {inputUri ? (
          <ResultActionBar
            showBefore={showBefore}
            onToggleBefore={() => setShowBefore((v) => !v)}
            onThumbsUp={() => Alert.alert('Thanks!', 'Glad you like this result (mock).')}
            onThumbsDown={() => Alert.alert('Feedback', 'We will improve this style (mock).')}
          />
        ) : null}
      </View>

      <ResultBottomPanel
        toolName={displayName}
        referenceLabel={tool ? 'Tool' : 'Reference'}
        regenerating={regenerating}
        onRegenerate={handleRegenerate}
        onAction={handleAction}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.heading,
    flex: 1,
    textAlign: 'center',
  },
  compareLabel: {
    ...typography.caption,
    textAlign: 'center',
    marginBottom: spacing.xs,
    fontWeight: '600',
    color: colors.text,
  },
  imageArea: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    position: 'relative',
  },
  imageContainer: {
    flex: 1,
    minHeight: 240,
  },
  image: {
    flex: 1,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
