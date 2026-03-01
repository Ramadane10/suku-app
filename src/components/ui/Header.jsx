import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import fonts from '../../constants/fonts';
import { useTheme } from '../../hooks/useTheme';

/**
 * @param {Object} props
 * @param {string} props.title
 * @param {function} [props.onMenuPress]
 * @param {number} [props.notificationCount]
 * @param {function} [props.onNotificationPress]
 * @param {boolean} [props.showMenu]
 * @param {boolean} [props.showNotifications]
 * @param {boolean} [props.showBack]
 * @param {function} [props.onBackPress]
 * @param {boolean} [props.fixed]
 * @param {number} [props.cartCount]
 * @param {function} [props.onCartPress]
 * @param {boolean} [props.showCart]
 */
const Header = ({
  title,
  onMenuPress,
  notificationCount = 0,
  onNotificationPress,
  showMenu = true,
  showNotifications = true,
  showBack = false,
  onBackPress,
  fixed = false,
  cartCount = 0,
  onCartPress,
  showCart = true,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleNotificationPress = () => {
    if (onNotificationPress && typeof onNotificationPress === 'function') {
      onNotificationPress();
    } else {
      router.push('/notifications');
    }
  };

  const handleCartPress = () => {
    if (onCartPress && typeof onCartPress === 'function') {
      onCartPress();
    } else {
      router.push('/cart');
    }
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: colors.surface },
      fixed && [styles.fixed, { top: insets.top }]
    ]}>
      {showBack ? (
        <TouchableOpacity onPress={onBackPress || (() => router.back())}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
      ) : showMenu ? (
        <TouchableOpacity onPress={onMenuPress}>
          <Ionicons name="menu" size={28} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.spacer} />
      )}

      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{title}</Text>

      <View style={styles.rightIcons}>
        {showNotifications && (
          <TouchableOpacity onPress={handleNotificationPress} style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={26} color={colors.text} />
            {notificationCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                <Text style={styles.badgeText}>{notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {showCart && (
          <TouchableOpacity onPress={handleCartPress} style={styles.iconButton}>
            <Ionicons name="cart-outline" size={26} color={colors.text} />
            {cartCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {!showNotifications && !showCart && <View style={styles.spacer} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 100,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  fixed: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 12,
  },
  spacer: {
    width: 32,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 18,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    position: 'relative',
    marginLeft: 12,
    padding: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 9,
    fontFamily: fonts.bold,
  },
});

export default Header;