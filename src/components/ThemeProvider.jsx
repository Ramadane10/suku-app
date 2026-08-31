import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import useThemeStore from '../store/themeStore';

export const ThemeProvider = ({ children }) => {
  const { theme, colors, initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, []);

  useEffect(() => {
    // Mettre à jour la barre de navigation Android (boutons de retour/home)
    if (Platform.OS === 'android') {
      try {
        NavigationBar.setButtonStyleAsync(theme === 'dark' ? 'light' : 'dark');
      } catch (e) {
        console.warn('NavigationBar customization skipped:', e);
      }
    }
  }, [theme]);

  return (
    <>
      <StatusBar
        style={theme === 'dark' ? 'light' : 'dark'}
        backgroundColor={colors.background}
        translucent={Platform.OS === 'android'}
        animated
      />
      {children}
    </>
  );
};

export default ThemeProvider;
