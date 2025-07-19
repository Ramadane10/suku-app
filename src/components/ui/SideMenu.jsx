import {
    AntDesign,
    Feather
} from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import colors from '../../constants/colors';
import fonts from '../../constants/fonts';

const { width } = Dimensions.get('window');

const SideMenu = ({ isVisible, onClose }) => {
  const router = useRouter();

  const menuItems = [
    { id: 'home', title: 'HOME', icon: 'home', route: '/home' },
    { id: 'shop', title: 'SHOP', icon: 'grid', route: '/shop' },
    { id: 'bag', title: 'BAG', icon: 'shopping-bag', route: '/bag' },
    { id: 'search', title: 'SEARCH', icon: 'search', route: '/search' },
    { id: 'orders', title: 'ORDERS', icon: 'package', route: '/orders' },
    { id: 'wishlist', title: 'WISHLIST', icon: 'heart', route: '/wishlist' },
    { id: 'profile', title: 'PROFILE', icon: 'user', route: '/profile' },
    { id: 'logout', title: 'LOGOUT', icon: 'log-out', route: '/logout' },
  ];

  const handleMenuItemPress = (item) => {
    if (item.id === 'logout') {
      // Gérer la déconnexion
      console.log('Logout pressed');
    } else {
      router.push(item.route);
    }
    onClose();
  };

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'home':
        return <AntDesign name="home" size={24} color={colors.dark} />;
      case 'grid':
        return <Feather name="grid" size={24} color={colors.dark} />;
      case 'shopping-bag':
        return <Feather name="shopping-bag" size={24} color={colors.dark} />;
      case 'search':
        return <Feather name="search" size={24} color={colors.dark} />;
      case 'package':
        return <Feather name="package" size={24} color={colors.dark} />;
      case 'heart':
        return <AntDesign name="hearto" size={24} color={colors.dark} />;
      case 'user':
        return <Feather name="user" size={24} color={colors.dark} />;
      case 'log-out':
        return <Feather name="log-out" size={24} color={colors.dark} />;
      default:
        return <Feather name="circle" size={24} color={colors.dark} />;
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay sombre */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />
      
      {/* Menu latéral */}
      <View style={styles.menuContainer}>
        <View style={styles.menuContent}>
          {/* En-tête du menu */}
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Shopertino</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <AntDesign name="close" size={24} color={colors.dark} />
            </TouchableOpacity>
          </View>

          {/* Liste des options */}
          <View style={styles.menuItems}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handleMenuItemPress(item)}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemIcon}>
                  {getIconComponent(item.icon)}
                </View>
                <Text style={styles.menuItemText}>{item.title}</Text>
                {/* <AntDesign name="right" size={16} color={colors.grey} /> */}
              </TouchableOpacity>
            ))}
          </View>

          {/* Informations supplémentaires */}
          {/* <View style={styles.menuFooter}>
            <Text style={styles.footerText}>Version 1.0.0</Text>
          </View> */}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width * 0.75,
    height: '100%',
    backgroundColor: '#fff',
    zIndex: 1001,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  menuContent: {
    flex: 1,
    paddingTop: 60,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
  },
  menuTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.dark,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItems: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
  },
  menuItemIcon: {
    width: 40,
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.dark,
  },
  menuFooter: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: colors.light,
  },
  footerText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.grey,
    textAlign: 'center',
  },
});

export default SideMenu; 