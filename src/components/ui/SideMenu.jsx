import {
  Ionicons
} from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import fonts from '../../constants/fonts';
import { useTheme } from '../../hooks/useTheme';

import { useCustomAlert } from '../../context/AlertContext';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const SideMenu = ({ isVisible, onClose }) => {
  const router = useRouter();
  const { colors } = useTheme();
  const { signOut } = useAuth();
  const { showConfirm } = useCustomAlert();

  const mainMenuItems = [
    { id: 'home', title: 'Accueil', icon: 'home', route: '/home' },
    { id: 'bag', title: 'Panier', icon: 'shopping-bag', route: '/cart' },
    { id: 'orders', title: 'Commandes', icon: 'package', route: '/orders' },
    { id: 'wishlist', title: 'Favoris', icon: 'heart', route: '/wishlist' },
    { id: 'profile', title: 'Compte', icon: 'user', route: '/profile' },
  ];

  const logoutItem = { id: 'logout', title: 'Déconnexion', icon: 'log-out', route: '/logout' };

  const handleMenuItemPress = (item) => {
    onClose();
    if (item.id === 'logout') {
      showConfirm(
        'Déconnexion',
        'Êtes-vous sûr de vouloir vous déconnecter ?',
        async () => {
          try {
            await signOut();
            router.replace('/welcome');
          } catch (error) {
            console.error('Logout error:', error);
          }
        },
        'Déconnexion',
        'Annuler'
      );
    } else {
      router.push(item.route);
    }
  };

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case 'home':
        return <Ionicons name="home-outline" size={24} color={colors.text} />;
      case 'grid':
        return <Ionicons name="grid-outline" size={24} color={colors.text} />;
      case 'shopping-bag':
        return <Ionicons name="bag-outline" size={24} color={colors.text} />;
      // case 'search':
      //   return <Ionicons name="search-outline" size={24} color={colors.text} />;
      case 'package':
        return <Ionicons name="cube-outline" size={24} color={colors.text} />;
      case 'heart':
        return <Ionicons name="heart-outline" size={24} color={colors.text} />;
      case 'user':
        return <Ionicons name="person-outline" size={24} color={colors.text} />;
      case 'log-out':
        return <Ionicons name="log-out-outline" size={24} color={colors.text} />;
      default:
        return <Ionicons name="ellipse-outline" size={24} color={colors.text} />;
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Overlay sombre */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Menu latéral */}
      <View style={styles.menuContainer}>
        <View style={[styles.menuContent, { backgroundColor: colors.surface }]}>
          {/* En-tête du menu */}
          <View style={[styles.menuHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.menuTitle, { color: colors.text }]}>Menu</Text>
            <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: colors.light }]}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Liste des options principales */}
          <View style={styles.mainMenuItems}>
            {mainMenuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuItem, { borderBottomColor: colors.border }]}
                onPress={() => handleMenuItemPress(item)}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemIcon}>
                  {getIconComponent(item.icon)}
                </View>
                <Text style={[styles.menuItemText, { color: colors.text }]}>{item.title}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.grey} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Espace flexible qui pousse le logout vers le bas */}
          <View style={styles.spacer} />

          {/* Option de déconnexion */}
          <TouchableOpacity
            style={[styles.logoutItem, { borderColor: colors.border }]}
            onPress={() => handleMenuItemPress(logoutItem)}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemIcon}>
              {getIconComponent(logoutItem.icon)}
            </View>
            <Text style={[styles.menuItemText, styles.logoutText, { color: colors.danger }]}>{logoutItem.title}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.grey} />
          </TouchableOpacity>

          {/* Informations supplémentaires */}
          <View style={styles.menuFooter}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>Version 1.0.0</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.75,
    height: '100%',
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
    paddingBottom: 20,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  menuTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainMenuItems: {
    // flex: 1, // Retiré pour permettre au spacer de fonctionner
  },
  spacer: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 10,
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
  },
  logoutText: {
    // Couleur gérée dynamiquement
  },
  menuFooter: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  footerText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    textAlign: 'center',
  },
});

export default SideMenu;