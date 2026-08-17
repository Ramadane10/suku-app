import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../src/components/ui/Header';
import SideMenu from '../src/components/ui/SideMenu';
import fonts from '../src/constants/fonts';
import { useTheme } from '../src/hooks/useTheme';

export const options = { headerShown: false };

import { useAuth } from '../src/context/AuthContext';
import { useCart } from '../src/context/CartContext';
import { useAddresses } from '../src/hooks/useAddresses';
import { useProfile } from '../src/hooks/useProfile';

const ProfileScreen = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const { signOut, user } = useAuth();
  const { addresses, fetchAddresses } = useAddresses();
  const { profile, loading: profileLoading } = useProfile();
  const { getCartCount } = useCart();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Re-fetch addresses every time profile screen gains focus so the count badge stays accurate
  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [fetchAddresses])
  );

  const isLoggedIn = !!user;

  // Utiliser le profil depuis Supabase ou les métadonnées utilisateur en fallback
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const avatarUrl = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;

  const handleMenuPress = () => {
    setIsMenuVisible(true);
  };

  const handleCloseMenu = () => {
    setIsMenuVisible(false);
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
        signOut().then(() => router.replace('/login'));
      }
    } else {
      Alert.alert(
        'Déconnexion',
        'Êtes-vous sûr de vouloir vous déconnecter ?',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Déconnexion',
            style: 'destructive',
            onPress: async () => {
              await signOut();
              router.replace('/login');
            },
          },
        ]
      );
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Supprimer le compte',
      'Cette action est irréversible. Toutes vos données seront définitivement supprimées.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            // TODO: Implémenter la suppression du compte (Supabase)
            Alert.alert('Compte supprimé', 'Votre compte a été supprimé avec succès.');
            router.replace('/welcome');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Profil"
        onMenuPress={handleMenuPress}
        cartCount={getCartCount()}
        onCartPress={() => router.push('/cart')}
        onNotificationPress={() => router.push('/notifications')}
      />
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 }]}>
        {isLoggedIn ? (
          <View style={styles.avatarContainer}>
            {profileLoading ? (
              <View style={[styles.avatar, { backgroundColor: colors.light, justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="person" size={45} color={colors.grey} />
              </View>
            ) : (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatar}
              />
            )}
            <Text style={[styles.name, { color: colors.text }]}>{displayName}</Text>
            {displayEmail && (
              <Text style={[styles.email, { color: colors.textSecondary }]}>{displayEmail}</Text>
            )}
          </View>
        ) : (
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle-outline" size={90} color={colors.grey} />
            <Text style={[styles.name, { color: colors.text }]}>Non connecté</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Connectez-vous pour accéder à votre profil</Text>
          </View>
        )}
        {/* Menu options - affichés seulement si connecté */}
        {isLoggedIn && (
          <View style={[styles.menuList, { backgroundColor: colors.surface }]}>
            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => router.push('/profile-edit')}>
              <Ionicons name="person-circle-outline" size={22} color={colors.primary} style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: colors.text }]}>Détails du compte</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.grey} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => router.push('/addresses')}>
              <Ionicons name="location-outline" size={22} color={colors.primary} style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: colors.text }]}>Mes adresses</Text>
              {addresses.length > 0 && (
                <Text style={[styles.menuBadge, { color: colors.textSecondary }]}>{addresses.length}</Text>
              )}
              <Ionicons name="chevron-forward" size={16} color={colors.grey} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => router.push('/orders')}>
              <Ionicons name="cube-outline" size={22} color={colors.primary} style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: colors.text }]}>Historique des commandes</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.grey} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={() => router.push('/profile-settings')}>
              <Ionicons name="settings-outline" size={22} color={colors.primary} style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: colors.text }]}>Paramètres</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.grey} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile-contact')}>
              <Ionicons name="call-outline" size={22} color={colors.success} style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: colors.text }]}>Contactez-nous</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.grey} />
            </TouchableOpacity>
          </View>
        )}

        {/* Boutons d'action */}
        {isLoggedIn ? (
          <>
            <TouchableOpacity style={[styles.logoutBtn, { borderColor: colors.text, backgroundColor: colors.surface }]} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color={colors.text} style={styles.btnIcon} />
              <Text style={[styles.logoutText, { color: colors.text }]}>Se déconnecter</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.deleteBtn, { borderColor: colors.danger, backgroundColor: colors.surface }]} onPress={handleDeleteAccount}>
              <Ionicons name="trash-outline" size={20} color={colors.danger} style={styles.btnIcon} />
              <Text style={[styles.deleteText, { color: colors.danger }]}>Supprimer mon compte</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/login')}
          >
            <Ionicons name="log-in-outline" size={20} color="#fff" style={styles.btnIcon} />
            <Text style={styles.loginText}>Se connecter</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      <SideMenu isVisible={isMenuVisible} onClose={() => setIsMenuVisible(false)} />
    </SafeAreaView>
  );
};

// ... styles ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 22,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  email: {
    fontFamily: fonts.regular,
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  menuList: {
    marginHorizontal: 24,
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 16,
  },
  logoutBtn: {
    marginHorizontal: 24,
    marginTop: 32,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  loginBtn: {
    marginHorizontal: 24,
    marginTop: 32,
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#fff',
  },
  deleteBtn: {
    marginHorizontal: 24,
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  btnIcon: {
    marginRight: 8,
  },
  menuBadge: {
    fontFamily: fonts.medium,
    fontSize: 14,
    marginRight: 8,
  },
});
export default ProfileScreen;