import { useRouter } from 'expo-router';
import React, { useState, useMemo, useCallback } from 'react';
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
import { useCart } from '../src/context/CartContext';

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
  const { getCartCount } = useCart();
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

  // Construction de la liste des catégories pour les tabs (mémorisé)
  const categoryNames = useMemo(() => ['TOUS', ...dbCategories.map(c => c.name)], [dbCategories]);

  const handleMenuPress = useCallback(() => {
    setIsMenuVisible(true);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setIsMenuVisible(false);
  }, []);

  // Filtrage dynamique (mémorisé)
  const displayedProducts = useMemo(() => getProductsByCategory(selectedCategory), [selectedCategory, getProductsByCategory]);

  // Si "TOUS" est sélectionné, on affiche les sections par défaut (New, Featured, Best)
  // Sinon, on affiche la liste filtrée
  const isAllCategories = selectedCategory === 'TOUS';

  // Mémoriser les produits spéciaux
  const newArrivals = useMemo(() => getNewArrivals(), [getNewArrivals]);
  const featured = useMemo(() => getFeatured(), [getFeatured]);
  const bestSellers = useMemo(() => getBestSellers(), [getBestSellers]);

  // Mémoriser le compteur de panier
  const cartCount = useMemo(() => getCartCount(), [getCartCount]);

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
        cartCount={cartCount}
        onCartPress={() => router.push('/cart')}
      />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
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
                      id={product.id}
                      productId={product.id}
                      name={product.name}
                      price={`${product.price_per_kg}€/kg`}
                      image={product.image_url ? { uri: product.image_url } : require('../assets/images/onboarding1.png')}
                      category={product.category?.name || 'FRUIT'}
                      stockQuantity={product.stock_quantity}
                      style={styles.regularProduct} // Carte verticale standard utilisée aussi pour New Arrivals ici
                      centerPrice={true}
                      onPress={() => router.push({
                        pathname: '/product-details',
                        params: {
                          productId: product.id,
                          name: product.name,
                          price: `${product.price_per_kg}€/kg`,
                          category: product.category?.name,
                          image: product.image_url,
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
                      id={product.id}
                      productId={product.id}
                      name={product.name}
                      price={`${product.price_per_kg}€/kg`}
                      image={product.image_url ? { uri: product.image_url } : require('../assets/images/onboarding1.png')}
                      category={product.category?.name || 'LÉGUME'}
                      stockQuantity={product.stock_quantity}
                      priceFirst={true}
                      onPress={() => router.push({
                        pathname: '/product-details',
                        params: {
                          productId: product.id,
                          name: product.name,
                          price: `${product.price_per_kg}€/kg`,
                          category: product.category?.name,
                          image: product.image_url,
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
                      id={product.id}
                      productId={product.id}
                      name={product.name}
                      price={`${product.price_per_kg}€/kg`}
                      image={product.image_url ? { uri: product.image_url } : require('../assets/images/onboarding1.png')}
                      category={product.category?.name || 'BIO'}
                      stockQuantity={product.stock_quantity}
                      priceFirst={true}
                      onPress={() => router.push({
                        pathname: '/product-details',
                        params: {
                          productId: product.id,
                          name: product.name,
                          price: `${product.price_per_kg}€/kg`,
                          category: product.category?.name,
                          image: product.image_url,
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
            {displayedProducts && displayedProducts.length > 0 ? (
              <View style={styles.gridContainer}>
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    productId={product.id}
                    name={product.name}
                    price={`${product.price_per_kg}€/kg`}
                    image={product.image_url ? { uri: product.image_url } : require('../assets/images/onboarding1.png')}
                    category={product.category?.name || ''}
                    stockQuantity={product.stock_quantity}
                    style={styles.gridProduct}
                    centerPrice={true}
                    onPress={() => router.push({
                      pathname: '/product-details',
                      params: {
                        productId: product.id,
                        name: product.name,
                        price: `${product.price_per_kg}€/kg`,
                        category: product.category?.name,
                        image: product.image_url,
                      }
                    })}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Aucun produit disponible dans la catégorie "{selectedCategory}"
                </Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary, marginTop: 10, fontSize: 14 }]}>
                  {displayedProducts ? `(${displayedProducts.length} produit trouvé)` : 'Chargement...'}
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
