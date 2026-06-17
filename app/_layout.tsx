import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GenerationProvider } from '../src/lib/generationStore';

const SPLASH_BG = '#F8F7F2';
const SPLASH_ICON = require('../assets/splash-icon.png');

// Keep the native splash visible until our branded loading screen is ready.
SplashScreen.preventAutoHideAsync().catch(() => {});

function BrandedSplash() {
  return (
    <View style={styles.splash}>
      <Image source={SPLASH_ICON} style={styles.splashLogo} resizeMode="contain" />
      <Text style={styles.splashTitle}>SpaceFlip Pro</Text>
      <ActivityIndicator color="#1B4332" style={styles.splashSpinner} />
    </View>
  );
}

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Hide the native splash so our in-app branded loading screen can take over.
    // This guarantees a visible logo + spinner in Expo Go and in native builds.
    SplashScreen.hideAsync().catch(() => {});
    const timer = setTimeout(() => setAppReady(true), 600);
    return () => clearTimeout(timer);
  }, []);

  if (!appReady) {
    return <BrandedSplash />;
  }

  return (
    <GenerationProvider>
      <StatusBar style="dark" />
      <View style={styles.flex}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#FAFAF8' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="project-intake/[projectType]" options={{ presentation: 'card' }} />
        <Stack.Screen name="generating" options={{ presentation: 'card', gestureEnabled: false }} />
        <Stack.Screen name="result" options={{ presentation: 'card' }} />
        <Stack.Screen name="advisor/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="project/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="plan/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
        <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
        <Stack.Screen name="style-transfer" options={{ presentation: 'card' }} />
        <Stack.Screen name="style-detail" options={{ presentation: 'card' }} />
        <Stack.Screen name="tool/[toolId]" options={{ presentation: 'card' }} />
        <Stack.Screen name="assistant/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="assistants" options={{ presentation: 'card' }} />
        <Stack.Screen name="create-painting" options={{ presentation: 'card' }} />
        <Stack.Screen name="painting-result" options={{ presentation: 'card' }} />
      </Stack>
      </View>
    </GenerationProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SPLASH_BG,
  },
  splashLogo: { width: 140, height: 140 },
  splashTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '700',
    color: '#1B4332',
    letterSpacing: 0.3,
  },
  splashSpinner: { marginTop: 20 },
});
