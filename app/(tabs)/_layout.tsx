import { Platform, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../src/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: -2,
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: spacing.sm,
          paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.sm,
        },
      }}
    >
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="folder-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="visualize"
        options={{
          title: 'Visualize',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="scan-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="plans" options={{ href: null }} />
      <Tabs.Screen
        name="advisors"
        options={{
          title: 'Guides',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="design" options={{ href: null }} />
      <Tabs.Screen name="ai-tools" options={{ href: null }} />
      <Tabs.Screen name="mine" options={{ href: null }} />
    </Tabs>
  );
}
