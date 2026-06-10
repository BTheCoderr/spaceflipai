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
import { getAssistantById, aiPromptSuggestions } from '../../src/data/mockAssistants';
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
  "Thanks, I can review this photo. I'd start by improving layout, lighting, and visual balance.";

export default function AssistantChatScreen() {
  const router = useRouter();
  const { id, seedPrompt } = useLocalSearchParams<{ id: string; seedPrompt?: string }>();
  const assistant = getAssistantById(id);
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

  if (!assistant) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.error}>Assistant not found</Text>
      </SafeAreaView>
    );
  }

  const suggestionChips = aiPromptSuggestions.slice(0, 4);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/ai-tools');
    }
  };

  const sendMessage = (text: string, image?: PickedImage | null) => {
    const trimmed = text.trim();
    const imageToSend = image ?? attachedImage;
    if ((!trimmed && !imageToSend) || typing) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed || 'Shared a photo',
      imageUri: imageToSend?.uri,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setAttachedImage(null);
    setTyping(true);

    setTimeout(() => {
      const mockReply = imageToSend
        ? IMAGE_REPLY
        : assistant.mockResponses[responseIndex % assistant.mockResponses.length];
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: mockReply,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      if (!imageToSend) {
        setResponseIndex((i) => i + 1);
      }
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
        <Pressable
          onPress={handleBack}
          hitSlop={interaction.hitSlop}
          style={({ pressed }) => [styles.headerSide, pressed && styles.pressed]}
        >
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={styles.avatarWrap}>
            {assistant.avatarUrl ? (
              <RemoteImage
                uri={assistant.avatarUrl}
                style={styles.avatar}
                containerStyle={styles.avatarContainer}
                borderRadius={24}
              />
            ) : (
              <Text style={styles.emoji}>{assistant.emoji}</Text>
            )}
          </View>
          <Text style={styles.headerTitle}>{assistant.name}</Text>
        </View>
        <Pressable
          onPress={() => Alert.alert(assistant.name, assistant.description)}
          hitSlop={interaction.hitSlop}
          style={({ pressed }) => [styles.headerSide, pressed && styles.pressed]}
        >
          <Ionicons name="ellipsis-horizontal" size={22} color={colors.text} />
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
          contentContainerStyle={[
            styles.messageList,
            messages.length === 0 && styles.messageListEmpty,
          ]}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={<View style={styles.emptySpace} />}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.role === 'user' ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              {item.imageUri ? (
                <RemoteImage
                  uri={item.imageUri}
                  style={styles.bubbleImage}
                  containerStyle={styles.bubbleImageWrap}
                  borderRadius={radius.sm}
                />
              ) : null}
              <Text
                style={[
                  styles.bubbleText,
                  item.role === 'user' && styles.userBubbleText,
                  item.imageUri && styles.bubbleTextWithImage,
                ]}
              >
                {item.text}
              </Text>
            </View>
          )}
        />

        {messages.length === 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestions}
          >
            {suggestionChips.map((chip) => (
              <PromptChip
                key={chip}
                label={chip}
                onPress={() => sendMessage(chip)}
              />
            ))}
          </ScrollView>
        ) : null}

        {typing ? (
          <View style={styles.typingRow}>
            <Text style={styles.typingText}>{assistant.name} is typing…</Text>
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
            <Pressable
              onPress={() => setAttachedImage(null)}
              style={({ pressed }) => [styles.removeAttachment, pressed && styles.pressed]}
            >
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
          placeholder="Ask anything"
          canSend={!!input.trim() || !!attachedImage}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    minHeight: 72,
  },
  headerSide: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.pillInactive,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 4,
  },
  avatarContainer: {
    width: 48,
    height: 48,
  },
  avatar: {
    width: 48,
    height: 48,
  },
  emoji: {
    fontSize: 26,
  },
  headerTitle: {
    ...typography.heading,
    fontSize: 16,
  },
  messageList: {
    padding: spacing.md,
    flexGrow: 1,
  },
  messageListEmpty: {
    justifyContent: 'flex-end',
  },
  emptySpace: {
    flex: 1,
    minHeight: 120,
  },
  bubble: {
    maxWidth: '82%',
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.sm,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.pillActive,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.pillInactive,
  },
  bubbleText: {
    ...typography.body,
    fontSize: 15,
    lineHeight: 21,
  },
  bubbleTextWithImage: {
    marginTop: spacing.sm,
  },
  bubbleImageWrap: {
    width: 180,
    height: 120,
  },
  bubbleImage: {
    width: 180,
    height: 120,
  },
  attachmentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  attachmentWrap: {
    width: 72,
    height: 72,
  },
  attachmentImage: {
    width: 72,
    height: 72,
  },
  removeAttachment: {
    padding: spacing.xs,
  },
  userBubbleText: {
    color: '#FFFFFF',
  },
  suggestions: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  typingRow: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  typingText: {
    ...typography.caption,
    fontStyle: 'italic',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  error: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
