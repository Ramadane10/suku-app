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
  primary: '#F59E16',        // Orange Doré Nwanma (Couleur principale en Mode Sombre)
  secondary: '#FF7D00',      // Orange Vif (Accent)
  accent: '#88BD2A',         // Vert Lime (Bio)
  darkGreen: '#1B4332',      // Vert Sombre Nwanma
  background: '#121212',     // Fond Noir Profond OLED
  surface: '#1E1E1E',        // Surface & Cartes Anthracite
  dark: '#FFFFFF',
  light: '#262626',          // Éléments légers sombres
  grey: '#9E9E9E',           // Texte secondaire / icônes inactives
  success: '#2E7F34',        // Vert Nwanma
  danger: '#FF5252',         // Rouge Erreur
  warning: '#F59E16',        // Orange Avertissement
  transparent: 'transparent',
  text: '#FFFFFF',           // Texte blanc pur
  textSecondary: '#AAAAAA',  // Texte secondaire gris doux
  border: '#2C2C2C',         // Bordures fines anthracite
  card: '#1E1E1E',           // Fond carte
  chipBg: '#2B2319',         // Fond badge teinté d'orange chaud
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
