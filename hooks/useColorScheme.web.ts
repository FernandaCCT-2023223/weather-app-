import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * useColorScheme (web)
 * --------------
 * This wee hook figures out what theme the app should be using on the web.
 * If the user picked "system", it follows the browser's theme.
 * Otherwise, it uses whatever the user picked (light or dark).
 * Used by all themed components to keep the look consistent, even in the browser.
 * 
 */

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
