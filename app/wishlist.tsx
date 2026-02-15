import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import fonts from '../src/constants/fonts';
import { useFavorites } from '../src/context/FavoritesContext';
import Header from '../src/components/ui/Header';
import SideMenu from '../src/components/ui/SideMenu';
import { useTheme } from '../src/hooks/useTheme';
import { useAuth } from '../src/context/AuthContext';

export const options = { headerShown: false };

const WishlistScreen = () => {
  const { favorites, loading, removeFavorite } = useFavorites();
  const { user } = useAuth();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const router = useRouter();
  const { colors } = useTheme();

   const handleMenuPress = () => {
    setIsMenuVisible(true);
  };

  const handleCloseMenu = () => {
    setIsMenuVisible(false);
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header
          title="Favoris"
          onMenuPress={handleMenuPress}
          cartCount={0}
          onCartPress={() => router.push('/cart')}
        />
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={60} color={colors.grey} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Connectez-vous pour voir vos favoris
          </Text>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginButtonText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header
          title="Favoris"
          onMenuPress={handleMenuPress}
          cartCount={0}
          onCartPress={() => router.push('/cart')}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Chargement des favoris...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Favoris"
        onMenuPress={handleMenuPress}
        cartCount={0}
        onCartPress={() => router.push('/cart')}
      />
      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={60} color={colors.grey} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Aucun favori pour le moment.
          </Text>
          <TouchableOpacity
            style={[styles.shopButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/home')}
          >
            <Text style={styles.shopButtonText}>Découvrir les produits</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          style={styles.itemsList}
          contentContainerStyle={{ paddingBottom: 80 }}
        >
          {favorites.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.itemRow, { backgroundColor: colors.surface }]}
              onPress={() => {
                router.push({
                  pathname: '/product-details',
                  params: {
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    category: item.category || 'FRUITS',
                  }
                });
              }}
              activeOpacity={0.3}
              delayPressIn={0}
            >
              <Image source={item.image} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.itemPrice, { color: colors.textSecondary }]}>{item.price}</Text>
              </View>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  removeFavorite(item.productId);
                }}
                style={[styles.favBtn, { backgroundColor: colors.surface }]}
                activeOpacity={0.7}
              >
                <AntDesign name="heart" size={24} color={colors.danger} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      <SideMenu
        isVisible={isMenuVisible}
        onClose={handleCloseMenu}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    marginTop: 16,
  },
  itemsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontFamily: fonts.bold,
    fontSize: 16,
    marginBottom: 4,
  },
  itemPrice: {
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  favBtn: {
    marginLeft: 12,
    padding: 8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    marginTop: 12,
  },
  loginButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#fff',
  },
  shopButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#fff',
  },
});

export default WishlistScreen;