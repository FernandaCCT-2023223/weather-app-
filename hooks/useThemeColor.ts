/**
 * useThemeColor
 * --------------
 * This handy hook gives you the right colour for the current theme.
 * Pass in a light and dark value, and it'll pick the right one based on the user's choice.
 * Used by all ThemedView and ThemedText components to keep the look tidy.
 * 
 */

import { useColorScheme } from './useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: string
) {
  const theme = useColorScheme();
  // You'd have a Colors object with all your theme colours
  // For now, just pick the right one from props
  if (theme === 'dark') {
    return props.dark ?? '#222';
  }
  return props.light ?? '#fff';
}
