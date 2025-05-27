/**
 * useColorScheme
 * --------------
 * This wee hook figures out what theme the app should be using.
 * If the user picked "system", it follows the device's theme.
 * Otherwise, it uses whatever the user picked (light or dark).
 * Used by all themed components to keep the look consistent.
 * 
 */

import { useThemeSelector } from '@/components/ThemeContext';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export function useColorScheme() {
  const { theme } = useThemeSelector();
  const system = useSystemColorScheme();
  if (theme === 'system') return system;
  return theme;
}
