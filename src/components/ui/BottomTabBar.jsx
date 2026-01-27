import { AntDesign, Feather, FontAwesome } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import fonts from '../../constants/fonts';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../hooks/useTheme';

const BottomTabBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { getCartCount } = useCart();
  const { colors } = useTheme();

  const tabs = [
    {
      key: 'home',
      label: 'Accueil',
      icon: (focused) => <AntDesign name="home" size={24} color={focused ? colors.primary : colors.grey} />,
      route: '/home',
      matchers: ['/home'],
    },
    {
      key: 'shop',
      label: 'Boutique',
      icon: (focused) => <FontAwesome name="shopping-bag" size={22} color={focused ? colors.primary : colors.grey} />,
      route: '/boutique',
      matchers: ['/boutique', '/product-details'],
    },
    {
      key: 'orders',
      label: 'Commande',
      icon: (focused) => <Feather name="package" size={24} color={focused ? colors.primary : colors.grey} />,
      route: '/orders',
      matchers: ['/orders', '/cart', '/shipping', '/payment', '/checkout'],
      showBadge: true,
    },
    {
      key: 'profile',
      label: 'Profil',
      icon: (focused) => <Feather name="user" size={24} color={focused ? colors.primary : colors.grey} />,
      route: '/profile',
      matchers: ['/profile', '/profile-edit', '/profile-settings', '/profile-contact', '/wishlist'],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {tabs.map((tab) => {
        const focused = tab.matchers.some((matcher) => pathname.startsWith(matcher));
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => {
              if (focused) return;
              router.push(tab.route);
            }}
            activeOpacity={0.3}
            delayPressIn={0}
          >
            <View style={styles.iconWrapper}>
              {tab.icon(focused)}
              {tab.showBadge && getCartCount() > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                  <Text style={styles.badgeText}>{getCartCount()}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, { color: focused ? colors.primary : colors.grey }, focused && styles.labelFocused]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingVertical: 8,
    paddingBottom: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 2,
  },
  labelFocused: {
    fontFamily: fonts.bold,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -12,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: fonts.bold,
  },
});

export default BottomTabBar;