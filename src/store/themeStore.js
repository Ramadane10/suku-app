import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

// Palettes de couleurs pour les thèmes
// Palettes de couleurs pour la charte graphique Nwanma
const lightColors = {
  primary: '#2E7F34',        // Vert Feuille / Forest Green
  secondary: '#88BD2A',      // Vert Lime / Lime Green
  accent: '#F59E16',         // Orange Doré / Warm Accent
  darkGreen: '#1B4332',      // Vert Sombre / Deep Pine
  background: '#F7F9F6',     // Fond clair très doux
  surface: '#FFFFFF',
  dark: '#1C1C1E',
  light: '#F7F9F6',
  grey: '#8E8E93',
  success: '#2E7F34',
  danger: '#EA5455',
  warning: '#F59E16',
  transparent: 'transparent',
  text: '#1C1C1E',
  textSecondary: '#555555',
  border: '#E0E6DF',
  card: '#FFFFFF',
  chipBg: '#EAF5EB',
};

const darkColors = {
  primary: '#2E7F34',        // Vert principal
  secondary: '#88BD2A',      // Vert Lime
  accent: '#F59E16',         // Orange Doré
  darkGreen: '#1B4332',      // Vert Sombre
  background: '#0F1E16',     // Fond vert très sombre élégant
  surface: '#1B4332',        // Surface vert sombre
  dark: '#FFFFFF',
  light: '#1F3A2C',
  grey: '#9CA3AF',
  success: '#88BD2A',
  danger: '#FF6B6B',
  warning: '#F59E16',
  transparent: 'transparent',
  text: '#FFFFFF',
  textSecondary: '#A3B8AD',
  border: '#2A5944',
  card: '#1B4332',
  chipBg: '#1F3A2C',
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
