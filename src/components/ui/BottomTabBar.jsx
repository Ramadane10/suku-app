import { AntDesign, Feather, FontAwesome } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../hooks/useTheme';

const BottomTabBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useTheme();
  const { getCartCount } = useCart();

  const tabs = useMemo(() => [
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
      label: 'Commandes',
      icon: (focused) => <Feather name="package" size={24} color={focused ? colors.primary : colors.grey} />,
      route: '/orders',
      matchers: ['/orders'],
    },
    {
      key: 'profile',
      label: 'Profil',
      icon: (focused) => <Feather name="user" size={24} color={focused ? colors.primary : colors.grey} />,
      route: '/profile',
      matchers: ['/profile', '/profile-edit', '/profile-settings', '/profile-contact'],
    },
  ], [colors.primary, colors.grey]);

  const activeTab = useMemo(() => {
    return tabs.find(tab => tab.matchers.some(matcher => pathname.startsWith(matcher)))?.key || 'home';
  }, [pathname, tabs]);

  const cartCount = getCartCount();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {tabs.map((tab) => {
        const isFocused = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => router.push(tab.route)}
          >
            <View style={styles.iconContainer}>
              {tab.icon(isFocused)}
              {tab.showBadge && cartCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, { color: isFocused ? colors.primary : colors.grey }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    paddingHorizontal: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    position: 'relative',
    height: 28,
    width: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default BottomTabBar;