import * as NavigationBar from 'expo-navigation-bar';
import React, { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import useThemeStore from '../store/themeStore';

export const ThemeProvider = ({ children }) => {
  const { theme, colors, initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, []);

  useEffect(() => {
    // Mettre à jour la StatusBar selon le thème
    StatusBar.setBarStyle(theme === 'dark' ? 'light-content' : 'dark-content');
    StatusBar.setBackgroundColor(colors.background);

    // Mettre à jour la barre de navigation Android
    if (Platform.OS === 'android') {
      try {
        // En mode edge-to-edge (SDK 51+), setBackgroundColorAsync n'est plus supporté
        // On se contente de régler le style des boutons
        NavigationBar.setButtonStyleAsync(theme === 'dark' ? 'light' : 'dark');
      } catch (e) {
        console.warn('NavigationBar customization skipped:', e);
      }
    }
  }, [theme, colors.background, colors.surface]);

  return <>{children}</>;
};

export default ThemeProvider;
