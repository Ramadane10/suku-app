import React from 'react';
import { View, StyleSheet } from 'react-native';
import { usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomTabBar from './BottomTabBar';

// Liste des routes où la BottomTabBar doit être affichée
const SHOW_TAB_BAR_ROUTES = [
  '/home',
  '/boutique',
  '/product-details',
  '/orders',
  '/cart',
  '/shipping',
  '/payment',
  '/checkout',
  '/profile',
  '/profile-edit',
  '/profile-settings',
  '/profile-contact',
  '/wishlist',
  '/addresses',
];

// Routes où la BottomTabBar ne doit PAS être affichée
const HIDE_TAB_BAR_ROUTES = [
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
    <View style={[styles.wrapper, { paddingBottom: insets.bottom }]} pointerEvents="box-none">
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
    pointerEvents: 'box-none', // Permet aux touches de passer à travers sauf sur les éléments enfants
  },
});

