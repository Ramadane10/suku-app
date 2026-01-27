import { AntDesign, Feather, FontAwesome } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../../constants/colors';
import fonts from '../../constants/fonts';
import { useCart } from '../../context/CartContext';

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

const BottomTabBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { getCartCount } = useCart();

  return (
    <View style={styles.container}>
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
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{getCartCount()}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, focused && styles.labelFocused]}>{tab.label}</Text>
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
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: colors.light,
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
    color: colors.grey,
    marginTop: 2,
  },
  labelFocused: {
    color: colors.primary,
    fontFamily: fonts.bold,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -12,
    backgroundColor: colors.danger,
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