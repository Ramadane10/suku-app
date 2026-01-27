import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
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
  }, [theme, colors.background]);

  return <>{children}</>;
};

export default ThemeProvider;
