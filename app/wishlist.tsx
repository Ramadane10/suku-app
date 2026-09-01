import { AntDesign, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../src/components/ui/Header';
import SideMenu from '../src/components/ui/SideMenu';
import fonts from '../src/constants/fonts';
import { useAuth } from '../src/context/AuthContext';
import { useCart } from '../src/context/CartContext';
import { useFavorites } from '../src/context/FavoritesContext';
import { useTheme } from '../src/hooks/useTheme';

export const options = { headerShown: false };

const WishlistScreen = () => {
  const { favorites, loading, removeFavorite } = useFavorites();
  const { getCartCount } = useCart();
  const { user } = useAuth();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const router = useRouter();
  const { colors } = useTheme();

  const handleMenuPress = () => {
    setIsMenuVisible(true);
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header
          title="Favoris"
          showBack={true}
          showMenu={false}
          onBackPress={() => router.back()}
          cartCount={getCartCount()}
          onCartPress={() => router.push('/cart')}
        />
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color={colors.grey} />
          <Text style={[styles.emptyText, { color: colors.text }]}>Connectez-vous pour voir vos favoris</Text>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.btnText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
        <SideMenu isVisible={isMenuVisible} onClose={() => setIsMenuVisible(false)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Favoris"
        showBack={true}
        showMenu={false}
        onBackPress={() => router.back()}
        cartCount={getCartCount()}
        onCartPress={() => router.push('/cart')}
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color={colors.grey} />
          <Text style={[styles.emptyText, { color: colors.text }]}>Votre liste de favoris est vide</Text>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/home')}
          >
            <Text style={styles.btnText}>Découvrir nos produits</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.grid}>
            {favorites.map((item: any) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.card, { backgroundColor: colors.surface }]}
                onPress={() => router.push({
                  pathname: '/product-details',
                  params: { productId: item.id }
                })}
              >
                <Image source={item.image} style={styles.image} contentFit="cover" transition={200} />
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={() => removeFavorite(item.productId)}
                >
                  <AntDesign name="heart" size={20} color={colors.danger} />
                </TouchableOpacity>
                <View style={styles.info}>
                  <Text style={[styles.category, { color: colors.primary }]}>{item.category?.name || 'BIO'}</Text>
                  <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                  <View style={styles.priceRow}>
                    <Text style={[styles.price, { color: colors.primary }]}>{item.price}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      <SideMenu isVisible={isMenuVisible} onClose={() => setIsMenuVisible(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: fonts.medium,
    marginTop: 20,
    marginBottom: 30,
    textAlign: 'center',
  },
  btn: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  btnText: {
    color: 'white',
    fontSize: 16,
    fontFamily: fonts.bold,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Espace pour la TabBar
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    borderRadius: 15,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: '100%',
    height: 150,
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20,
    elevation: 4,
  },
  info: {
    padding: 12,
  },
  category: {
    fontSize: 12,
    fontFamily: fonts.bold,
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontFamily: fonts.bold,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
    fontFamily: fonts.bold,
  },
});

export default WishlistScreen;