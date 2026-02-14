import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../src/components/ui/BottomTabBar';
import CategoryTabs from '../src/components/ui/CategoryTabs';
import Header from '../src/components/ui/Header';
import ProductCard from '../src/components/ui/ProductCard';
import SectionTitle from '../src/components/ui/SectionTitle';
import SideMenu from '../src/components/ui/SideMenu';
import { useProducts } from '../src/hooks/useProducts';
import { useTheme } from '../src/hooks/useTheme';

export const options = { headerShown: false };

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  newArrivalsContainer: {
    marginLeft: 16,
  },
  newArrivalsContent: {
    paddingRight: 16,
  },
  regularProduct: {
    width: 140,
    height: 240,
    marginRight: 16,
  },
  gridProduct: {
    width: '47%',
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: 'System', // Ou fonts.regular
    fontSize: 16,
    textAlign: 'center',
  },
  filteredContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

const HomeScreen = () => {
  const router = useRouter();
  const { colors } = useTheme();
  // Utilisation du hook useProducts pour les données dynamiques
  const {
    categories: dbCategories,
    loading,
    getNewArrivals,
    getFeatured,
    getBestSellers,
    getProductsByCategory
  } = useProducts();

  const [selectedCategory, setSelectedCategory] = useState<string>('TOUS');
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Construction de la liste des catégories pour les tabs
  const categoryNames = ['TOUS', ...dbCategories.map(c => c.name)]; // Ou c.slug selon préférence

  const handleMenuPress = () => {
    setIsMenuVisible(true);
  };

  const handleCloseMenu = () => {
    setIsMenuVisible(false);
  };

  // Filtrage dynamique
  const displayedProducts = getProductsByCategory(selectedCategory);

  // Si "TOUS" est sélectionné, on affiche les sections par défaut (New, Featured, Best)
  // Sinon, on affiche la liste filtrée
  const isAllCategories = selectedCategory === 'TOUS';

  const newArrivals = getNewArrivals();
  const featured = getFeatured();
  const bestSellers = getBestSellers();

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Shopertino"
        onMenuPress={handleMenuPress}
        cartCount={2} // TODO: Connecter avec le vrai CartContext plus tard
        onCartPress={() => router.push('/cart')}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <CategoryTabs
          categories={categoryNames}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {isAllCategories ? (
          <>
            {/* Section New Arrivals */}
            {newArrivals.length > 0 && (
              <>
                <SectionTitle center>Nouveautés</SectionTitle>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.newArrivalsContainer}
                  contentContainerStyle={styles.newArrivalsContent} // Gap géré par margin
                >
                  {newArrivals.map((product) => (
                    <ProductCard
                      key={product.id}
                      name={product.name}
                      price={`${product.price_per_kg}€/kg`}
                      image={product.image_url ? { uri: product.image_url } : require('../assets/images/onboarding1.png')}
                      category={product.category?.name || 'FRUIT'}
                      style={styles.regularProduct} // Carte verticale standard utilisée aussi pour New Arrivals ici
                      centerPrice={true}
                      onPress={() => router.push({
                        pathname: '/product-details',
                        params: {
                          name: product.name,
                          price: `${product.price_per_kg}€/kg`,
                          category: product.category?.name,
                          // On pourrait passer l'ID pour fetcher les détails, mais product-details utilise params pour l'instant
                        }
                      })}
                    />
                  ))}
                </ScrollView>
              </>
            )}

            {/* Section Featured */}
            {featured.length > 0 && (
              <>
                <SectionTitle>En Vedette</SectionTitle>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginLeft: 16 }}>
                  {featured.map((product) => (
                    <ProductCard
                      key={product.id}
                      name={product.name}
                      price={`${product.price_per_kg}€/kg`}
                      image={product.image_url ? { uri: product.image_url } : require('../assets/images/onboarding1.png')}
                      category={product.category?.name || 'LÉGUME'}
                      priceFirst={true}
                      onPress={() => router.push({
                        pathname: '/product-details',
                        params: {
                          name: product.name,
                          price: `${product.price_per_kg}€/kg`,
                          category: product.category?.name
                        }
                      })}
                    />
                  ))}
                </ScrollView>
              </>
            )}

            {/* Section Best Sellers */}
            {bestSellers.length > 0 && (
              <>
                <SectionTitle>Meilleures Ventes</SectionTitle>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginLeft: 16 }}>
                  {bestSellers.map((product) => (
                    <ProductCard
                      key={product.id}
                      name={product.name}
                      price={`${product.price_per_kg}€/kg`}
                      image={product.image_url ? { uri: product.image_url } : require('../assets/images/onboarding1.png')}
                      category={product.category?.name || 'BIO'}
                      priceFirst={true}
                      onPress={() => router.push({
                        pathname: '/product-details',
                        params: {
                          name: product.name,
                          price: `${product.price_per_kg}€/kg`,
                          category: product.category?.name
                        }
                      })}
                    />
                  ))}
                </ScrollView>
              </>
            )}
          </>
        ) : (
          /* Vue Filtrée par Catégorie */
          <View style={styles.filteredContainer}>
            {displayedProducts.length > 0 ? (
              <View style={styles.gridContainer}>
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    name={product.name}
                    price={`${product.price_per_kg}€/kg`}
                    image={product.image_url ? { uri: product.image_url } : require('../assets/images/onboarding1.png')}
                    category={product.category?.name || ''}
                    style={styles.gridProduct}
                    centerPrice={true}
                    onPress={() => router.push({
                      pathname: '/product-details',
                      params: {
                        name: product.name,
                        price: `${product.price_per_kg}€/kg`,
                        category: product.category?.name
                      }
                    })}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Aucun produit disponible dans cette catégorie
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
      <BottomTabBar />
      <SideMenu
        isVisible={isMenuVisible}
        onClose={handleCloseMenu}
      />
    </SafeAreaView>
  );
};


export default HomeScreen;
