import { useEffect } from 'react';
import useThemeStore from '../store/themeStore';

// Hook personnalisé pour utiliser le thème
export const useTheme = () => {
  const { theme, colors, initTheme, toggleTheme, setTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, []);

  return {
    theme,
    colors,
    isDark: theme === 'dark',
    toggleTheme,
    setTheme,
  };
};

export default useTheme;
