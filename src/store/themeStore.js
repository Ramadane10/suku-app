import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

// Palettes de couleurs pour les thèmes
const lightColors = {
  primary: '#FF6B00',
  secondary: '#FFE7D6',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  dark: '#1C1C1E',
  light: '#F5F5F5',
  grey: '#8E8E93',
  success: '#28C76F',
  danger: '#EA5455',
  warning: '#FF9F43',
  transparent: 'transparent',
  text: '#1C1C1E',
  textSecondary: '#8E8E93',
  border: '#E0E0E0',
  card: '#FFFFFF',
};

const darkColors = {
  primary: '#FF6B00',
  secondary: '#4A2C1A',
  background: '#000000',
  surface: '#1C1C1E',
  dark: '#FFFFFF',
  light: '#2C2C2E',
  grey: '#8E8E93',
  success: '#28C76F',
  danger: '#EA5455',
  warning: '#FF9F43',
  transparent: 'transparent',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#3A3A3C',
  card: '#1C1C1E',
};

const useThemeStore = create((set) => ({
  theme: 'light', // 'light' ou 'dark'
  colors: lightColors,

  // Initialiser le thème depuis AsyncStorage
  initTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        set({
          theme: savedTheme,
          colors: savedTheme === 'dark' ? darkColors : lightColors
        });
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  },

  // Changer de thème
  toggleTheme: async () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      const newColors = newTheme === 'dark' ? darkColors : lightColors;

      // Sauvegarder dans AsyncStorage
      AsyncStorage.setItem('theme', newTheme).catch(console.error);

      return {
        theme: newTheme,
        colors: newColors,
      };
    });
  },

  // Définir un thème spécifique
  setTheme: async (theme) => {
    if (theme !== 'light' && theme !== 'dark') return;

    const newColors = theme === 'dark' ? darkColors : lightColors;

    try {
      await AsyncStorage.setItem('theme', theme);
      set({
        theme,
        colors: newColors,
      });
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  },
}));

export default useThemeStore;
