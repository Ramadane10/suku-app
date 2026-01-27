import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState }from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../src/components/ui/BottomTabBar';
import colors from '../src/constants/colors';
import fonts from '../src/constants/fonts';
import { useFavorites } from '../src/context/FavoritesContext';
import Header from '../src/components/ui/Header'
import SideMenu from '@/src/components/ui/SideMenu';
export const options = { headerShown: false };

const WishlistScreen = () => {
  const { favorites, removeFavorite } = useFavorites();
  const [isMenuVisible, setIsMenuVisible] = useState(false)
  const router = useRouter();

   const handleMenuPress = () => {
    setIsMenuVisible(true);
  };

  const handleCloseMenu = () => {
    setIsMenuVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <Header title="Shopertino" onMenuPress={handleMenuPress} cartCount={2} /> */}
      <Header
        title="Favoris"
        onMenuPress={handleMenuPress}
        cartCount={2}
        onCartPress={() => router.push('/cart')}
      />
      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={60} color={colors.grey} />
          <Text style={styles.emptyText}>Aucun favori pour le moment.</Text>
        </View>
      ) : (
        <ScrollView style={styles.itemsList}>
          {favorites.map((item) => (
            <TouchableOpacity
              key={item.name}
              style={styles.itemRow}
              onPress={() => {
                router.push({
                  pathname: '/product-details',
                  params: {
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
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>{item.price}</Text>
              </View>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  removeFavorite(item.name);
                }}
                style={styles.favBtn}
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
      <BottomTabBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    color: colors.grey,
    marginTop: 16,
  },
  itemsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light,
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
    color: colors.dark,
    marginBottom: 4,
  },
  itemPrice: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.grey,
  },
  favBtn: {
    marginLeft: 12,
  },
});

export default WishlistScreen;