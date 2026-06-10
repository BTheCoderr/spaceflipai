import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GenerationProvider } from '../src/lib/generationStore';

export default function RootLayout() {
  return (
    <GenerationProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FFFFFF' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="style-detail" options={{ presentation: 'card' }} />
        <Stack.Screen name="style-transfer" options={{ presentation: 'card' }} />
        <Stack.Screen name="generating" options={{ presentation: 'card', gestureEnabled: false }} />
        <Stack.Screen name="result" options={{ presentation: 'card' }} />
        <Stack.Screen name="create-painting" options={{ presentation: 'card' }} />
        <Stack.Screen name="painting-result" options={{ presentation: 'card' }} />
        <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
        <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
        <Stack.Screen name="assistant/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="assistants" options={{ presentation: 'card' }} />
        <Stack.Screen name="tool/[toolId]" options={{ presentation: 'card' }} />
      </Stack>
    </GenerationProvider>
  );
}
