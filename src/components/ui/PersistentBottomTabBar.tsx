import { usePathname } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import BottomTabBar from './BottomTabBar';

// Liste des routes où la BottomTabBar doit être affichée
const SHOW_TAB_BAR_ROUTES = [
  '/home',
  '/boutique',
  '/orders',
  '/cart',
  '/profile',
  '/profile-edit',
  '/profile-settings',
  '/profile-contact',
  '/wishlist',
  '/addresses',
];

// Routes où la BottomTabBar ne doit PAS être affichée
const HIDE_TAB_BAR_ROUTES = [
  '/product-details',
  '/shipping',
  '/payment',
  '/checkout',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/welcome',
  '/onboarding',
  '/signup-success',
];

export default function PersistentBottomTabBar() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  // Vérifier si on doit afficher la barre
  const shouldShow = React.useMemo(() => {
    // Ne pas afficher sur les routes d'auth
    if (HIDE_TAB_BAR_ROUTES.some(route => pathname.startsWith(route))) {
      return false;
    }
    // Afficher sur les routes principales
    return SHOW_TAB_BAR_ROUTES.some(route => pathname.startsWith(route));
  }, [pathname]);

  if (!shouldShow) {
    return null;
  }

  return (
    <View style={[
      styles.wrapper,
      {
        paddingBottom: insets.bottom,
        backgroundColor: colors.surface
      }
    ]}>
      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
});

