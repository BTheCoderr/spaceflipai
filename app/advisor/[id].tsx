import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RemoteImage } from '../../src/components/RemoteImage';
import { AssistantChatComposer } from '../../src/components/AssistantChatComposer';
import { PromptChip } from '../../src/components/PromptChip';
import { advisorPromptChips, getAdvisorById } from '../../src/data/mockAdvisors';
import {
  handleImagePickerError,
  pickImageFromCamera,
  pickImageFromGallery,
  type PickedImage,
} from '../../src/lib/imagePicker';
import { colors, interaction, radius, spacing, typography } from '../../src/constants/theme';

type Message = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  imageUri?: string;
};

const IMAGE_REPLY =
  'Thanks for the photo. I would prioritize layout flow, photo-ready staging, and the highest-ROI visible upgrades first.';

export default function AdvisorChatScreen() {
  const router = useRouter();
  const { id, seedPrompt } = useLocalSearchParams<{ id: string; seedPrompt?: string }>();
  const advisor = getAdvisorById(id);
  const listRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [attachedImage, setAttachedImage] = useState<PickedImage | null>(null);
  const [picking, setPicking] = useState(false);
  const [responseIndex, setResponseIndex] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (seedPrompt && typeof seedPrompt === 'string') {
      setInput(seedPrompt);
    }
  }, [seedPrompt]);

  if (!advisor) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.error}>Advisor not found</Text>
      </SafeAreaView>
    );
  }

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/advisors');
  };

  const sendMessage = (text: string, image?: PickedImage | null) => {
    const trimmed = text.trim();
    const imageToSend = image ?? attachedImage;
    if ((!trimmed && !imageToSend) || typing) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed || 'Shared a property photo',
      imageUri: imageToSend?.uri,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setAttachedImage(null);
    setTyping(true);

    setTimeout(() => {
      const mockReply = imageToSend
        ? IMAGE_REPLY
        : advisor.mockResponses[responseIndex % advisor.mockResponses.length];
      setMessages((prev) => [
        ...prev,
        { id: `assistant-${Date.now()}`, role: 'assistant', text: mockReply },
      ]);
      if (!imageToSend) setResponseIndex((i) => i + 1);
      setTyping(false);
    }, 900);
  };

  const handlePickCamera = async () => {
    setPicking(true);
    try {
      const image = await pickImageFromCamera();
      if (image) setAttachedImage(image);
    } catch (error) {
      handleImagePickerError(error);
    } finally {
      setPicking(false);
    }
  };

  const handlePickGallery = async () => {
    setPicking(true);
    try {
      const image = await pickImageFromGallery();
      if (image) setAttachedImage(image);
    } catch (error) {
      handleImagePickerError(error);
    } finally {
      setPicking(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} hitSlop={interaction.hitSlop} style={styles.headerSide}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={styles.iconWrap}>
            <Ionicons name={advisor.icon} size={22} color={colors.accent} />
          </View>
          <Text style={styles.headerTitle}>{advisor.name}</Text>
          <Text style={styles.headerRole}>{advisor.role}</Text>
        </View>
        <Pressable
          onPress={() => Alert.alert(advisor.name, advisor.description)}
          hitSlop={interaction.hitSlop}
          style={styles.headerSide}
        >
          <Ionicons name="information-circle-outline" size={22} color={colors.text} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.messageList, messages.length === 0 && styles.messageListEmpty]}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={<View style={styles.emptySpace} />}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
              {item.imageUri ? (
                <RemoteImage
                  uri={item.imageUri}
                  style={styles.bubbleImage}
                  containerStyle={styles.bubbleImageWrap}
                  borderRadius={radius.sm}
                />
              ) : null}
              <Text style={[styles.bubbleText, item.role === 'user' && styles.userBubbleText, item.imageUri && styles.bubbleTextWithImage]}>
                {item.text}
              </Text>
            </View>
          )}
        />

        {messages.length === 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestions}>
            {advisorPromptChips.slice(0, 4).map((chip) => (
              <PromptChip key={chip} label={chip} onPress={() => sendMessage(chip)} />
            ))}
          </ScrollView>
        ) : null}

        {typing ? (
          <View style={styles.typingRow}>
            <Text style={styles.typingText}>{advisor.name} is typing…</Text>
          </View>
        ) : null}

        {attachedImage ? (
          <View style={styles.attachmentPreview}>
            <RemoteImage
              uri={attachedImage.uri}
              style={styles.attachmentImage}
              containerStyle={styles.attachmentWrap}
              borderRadius={radius.sm}
            />
            <Pressable onPress={() => setAttachedImage(null)}>
              <Ionicons name="close-circle" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>
        ) : null}

        <AssistantChatComposer
          value={input}
          onChangeText={setInput}
          onSend={() => sendMessage(input, attachedImage)}
          onCamera={handlePickCamera}
          onPhoto={handlePickGallery}
          placeholder="Ask about this property or space"
          canSend={!!input.trim() || !!attachedImage}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerSide: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  headerTitle: { ...typography.heading, fontSize: 15 },
  headerRole: { ...typography.caption },
  messageList: { padding: spacing.md, flexGrow: 1 },
  messageListEmpty: { justifyContent: 'flex-end' },
  emptySpace: { flex: 1, minHeight: 120 },
  bubble: { maxWidth: '82%', padding: spacing.md, borderRadius: 16, marginBottom: spacing.sm },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.pillActive },
  assistantBubble: { alignSelf: 'flex-start', backgroundColor: colors.pillInactive },
  bubbleText: { ...typography.body, fontSize: 15, lineHeight: 21 },
  bubbleTextWithImage: { marginTop: spacing.sm },
  bubbleImageWrap: { width: 180, height: 120 },
  bubbleImage: { width: 180, height: 120 },
  userBubbleText: { color: '#FFFFFF' },
  suggestions: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm, gap: spacing.sm },
  typingRow: { paddingHorizontal: spacing.md, paddingBottom: spacing.xs },
  typingText: { ...typography.caption, fontStyle: 'italic' },
  attachmentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  attachmentWrap: { width: 72, height: 72 },
  attachmentImage: { width: 72, height: 72 },
  error: { ...typography.body, textAlign: 'center', marginTop: spacing.xl },
});
