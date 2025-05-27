/**
 * TabLayout
 * -------------
 * This is the main tab navigator for the app.
 * It sets up the Search and News tabs, each with their own icon and title.
 * The tab bar follows the app's theme (light/dark/system) and uses a bit of haptic feedback for a nice touch.
 * The theme is decided by the user's choice or the system, and passed to the navigation container.
 * 
 */

import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { useThemeSelector } from '@/components/ThemeContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const systemColorScheme = useColorScheme();
  const { theme } = useThemeSelector();

  const navTheme =
    theme === 'light'
      ? DefaultTheme
      : theme === 'dark'
      ? DarkTheme
      : systemColorScheme === 'dark'
      ? DarkTheme
      : DefaultTheme;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[systemColorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}
    >
      {/* 🔍 Search tab first */}
      <Tabs.Screen
        name="search"
        options={{
          title: '🔍 Search',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="magnifyingglass" color={color} />
          ),
        }}
      />

      {/* 📰 News tab second (was Home) */}
      <Tabs.Screen
        name="index"
        options={{
          title: '📰 News',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="newspaper.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
