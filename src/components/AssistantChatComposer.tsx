import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, interaction, radius, spacing } from '../constants/theme';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onCamera?: () => void;
  onPhoto?: () => void;
  placeholder?: string;
  canSend?: boolean;
};

export function AssistantChatComposer({
  value,
  onChangeText,
  onSend,
  onCamera,
  onPhoto,
  placeholder = 'Ask anything',
  canSend,
}: Props) {
  const sendEnabled = canSend ?? value.trim().length > 0;

  return (
    <View style={styles.row}>
      <Pressable
        style={({ pressed }) => [styles.mediaBtn, pressed && styles.pressed]}
        onPress={onCamera}
      >
        <Ionicons name="camera-outline" size={22} color={colors.text} />
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.mediaBtn, pressed && styles.pressed]}
        onPress={onPhoto}
      >
        <Ionicons name="image-outline" size={22} color={colors.text} />
      </Pressable>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        multiline
      />
      <Pressable
        style={({ pressed }) => [
          styles.sendBtn,
          pressed && styles.pressed,
          !sendEnabled && styles.sendDisabled,
        ]}
        onPress={onSend}
        disabled={!sendEnabled}
      >
        <Ionicons name="send" size={18} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: spacing.xs,
    backgroundColor: colors.background,
  },
  mediaBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.pillInactive,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 100,
    fontSize: 15,
    color: colors.text,
    minHeight: 40,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.pillActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
