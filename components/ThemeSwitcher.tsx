/**
 * ThemeSwitcher
 * -------------
 * This wee component lets you switch between light, dark, and system themes.
 * Pops up in the top right corner of every tab, so you can change the look of the app any time you fancy.
 * Uses the theme context to update the whole app's appearance on the fly.
 * 
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useThemeSelector } from './ThemeContext';

const icons = {
  light: 'sunny-outline',
  dark: 'moon-outline',
  system: 'desktop-outline',
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeSelector();

  return (
    <View style={styles.container}>
      {(['light', 'dark', 'system'] as const).map((opt) => (
        <TouchableOpacity
          key={opt}
          onPress={() => setTheme(opt)}
          style={[
            styles.iconBtn,
            theme === opt && styles.active,
          ]}
          accessibilityLabel={`Switch to ${opt} theme`}
        >
          <Ionicons
            name={icons[opt]}
            size={22}
            color={theme === opt ? '#0a7ea4' : '#888'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    position: 'absolute',
    top: 12,
    right: 16,
    zIndex: 10,
    gap: 2,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'transparent',
    marginLeft: 2,
  },
  active: {
    backgroundColor: '#e0e0e0',
  },
});