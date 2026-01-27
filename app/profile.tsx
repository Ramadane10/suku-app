import { AntDesign, Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SideMenu from '../src/components/ui/SideMenu';
import colors from '../src/constants/colors';
import fonts from '../src/constants/fonts';
import Header from '../src/components/ui/Header'
import BottomTabBar from '../src/components/ui/BottomTabBar';

export const options = { headerShown: false };

const ProfileScreen = () => {
  const router = useRouter();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  // TODO: Remplacer par la vraie vérification d'authentification (Supabase)
  const [isLoggedIn] = useState(true);

  const handleMenuPress = () => {
    setIsMenuVisible(true);
  };

  const handleCloseMenu = () => {
    setIsMenuVisible(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: () => {
            // TODO: Implémenter la déconnexion (Supabase)
            console.log('Déconnexion...');
            router.replace('/welcome');
          },
        },
      ]
    );
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
    <SafeAreaView style={styles.container}>
      <Header
        title="Profil"
        onMenuPress={handleMenuPress}
        cartCount={2}
        onCartPress={() => router.push('/cart')}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Avatar - affiché seulement si connecté */}
        {isLoggedIn ? (
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
              style={styles.avatar}
            />
            <Text style={styles.name}>Mamadou Ramadane Barry</Text>
          </View>
        ) : (
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle-outline" size={90} color={colors.grey} />
            <Text style={styles.name}>Non connecté</Text>
            <Text style={styles.subtitle}>Connectez-vous pour accéder à votre profil</Text>
          </View>
        )}
        {/* Menu options - affichés seulement si connecté */}
        {isLoggedIn && (
          <View style={styles.menuList}>
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile-edit')}>
              <Ionicons name="person-circle-outline" size={22} color={colors.primary} style={styles.menuIcon} />
              <Text style={styles.menuText}>Détails du compte</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.grey} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/wishlist')}>
              <Ionicons name="heart-outline" size={22} color={colors.danger} style={styles.menuIcon} />
              <Text style={styles.menuText}>Favoris</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.grey} />
            </TouchableOpacity>
            {/* <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/orders')}>
              <Feather name="package" size={22} color={colors.primary} style={styles.menuIcon} />
              <Text style={styles.menuText}>Historique des commandes</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.grey} />
            </TouchableOpacity> */}
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile-settings')}>
              <Ionicons name="settings-outline" size={22} color={colors.primary} style={styles.menuIcon} />
              <Text style={styles.menuText}>Paramètres</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.grey} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile-contact')}>
              <Ionicons name="call-outline" size={22} color={colors.success} style={styles.menuIcon} />
              <Text style={styles.menuText}>Contactez-nous</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.grey} />
            </TouchableOpacity>
          </View>
        )}

        {/* Boutons d'action */}
        {isLoggedIn ? (
          <>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color={colors.dark} style={styles.btnIcon} />
              <Text style={styles.logoutText}>Se déconnecter</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
              <Ionicons name="trash-outline" size={20} color={colors.danger} style={styles.btnIcon} />
              <Text style={styles.deleteText}>Supprimer mon compte</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/login')}
          >
            <Ionicons name="log-in-outline" size={20} color="#fff" style={styles.btnIcon} />
            <Text style={styles.loginText}>Se connecter</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      <BottomTabBar />
      <SideMenu isVisible={isMenuVisible} onClose={() => setIsMenuVisible(false)} />
    </SafeAreaView>
  );
};

// ... styles ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.dark,
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
    color: colors.dark,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.grey,
    marginTop: 4,
    textAlign: 'center',
  },
  menuList: {
    marginHorizontal: 24,
    marginTop: 8,
    backgroundColor: '#fff',
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
    borderBottomColor: colors.light,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.dark,
  },
  logoutBtn: {
    marginHorizontal: 24,
    marginTop: 32,
    borderWidth: 1,
    borderColor: colors.dark,
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  logoutText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.dark,
  },
  loginBtn: {
    marginHorizontal: 24,
    marginTop: 32,
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
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
    borderColor: colors.danger,
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  deleteText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.danger,
  },
  btnIcon: {
    marginRight: 8,
  },
});
export default ProfileScreen;