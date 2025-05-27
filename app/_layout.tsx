/**
 * RootLayout
 * -------------
 * This is the root layout for the whole app.
 * It wraps the app in the ThemeProvider, loads custom fonts, and sets up the navigation stack.
 * The theme for navigation and status bar is picked based on the user's choice or the system.
 * 
 */

import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { ThemeProvider, useThemeSelector } from '@/components/ThemeContext';
import { useColorScheme } from '@/hooks/useColorScheme';

function MainLayout() {
  const { theme } = useThemeSelector();
  const systemColorScheme = useColorScheme();

  // Decide which theme to use
  const navTheme =
    theme === 'light'
      ? DefaultTheme
      : theme === 'dark'
      ? DarkTheme
      : systemColorScheme === 'dark'
      ? DarkTheme
      : DefaultTheme;

  // StatusBar style
  const statusBarStyle =
    theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark') ? 'light' : 'dark';

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={statusBarStyle} />
    </>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <MainLayout />
    </ThemeProvider>
  );
}
