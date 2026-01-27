import { AntDesign, Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

    const handleMenuPress = () => {
      setIsMenuVisible(true);
    };

    const handleCloseMenu = () => {
      setIsMenuVisible(false);
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
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>Mamadou Ramadane Barry</Text>
        </View>
        {/* Menu options */}
        <View style={styles.menuList}>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile-edit')}>
            <Ionicons name="person-circle-outline" size={22} color={colors.primary} style={styles.menuIcon} />
            <Text style={styles.menuText}>Détails du compte</Text>
            <AntDesign name="right" size={16} color={colors.grey} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/wishlist')}>
            <AntDesign name="hearto" size={22} color={colors.danger} style={styles.menuIcon} />
            <Text style={styles.menuText}>Favoris</Text>
            <AntDesign name="right" size={16} color={colors.grey} />
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/orders')}>
            <Feather name="package" size={22} color={colors.primary} style={styles.menuIcon} />
            <Text style={styles.menuText}>Historique des commandes</Text>
            <AntDesign name="right" size={16} color={colors.grey} />
          </TouchableOpacity> */}
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile-settings')}>
            <Feather name="settings" size={22} color={colors.primary} style={styles.menuIcon} />
            <Text style={styles.menuText}>Paramètres</Text>
            <AntDesign name="right" size={16} color={colors.grey} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile-contact')}>
            <Feather name="phone-call" size={22} color={colors.success} style={styles.menuIcon} />
            <Text style={styles.menuText}>Contactez-nous</Text>
            <AntDesign name="right" size={16} color={colors.grey} />
          </TouchableOpacity>
        </View>
        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logoutText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.dark,
  },
});
export default ProfileScreen;