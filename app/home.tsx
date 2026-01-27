import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryTabs from '../src/components/ui/CategoryTabs';
import Header from '../src/components/ui/Header';
import ProductCard from '../src/components/ui/ProductCard';
import SectionTitle from '../src/components/ui/SectionTitle';
import SideMenu from '../src/components/ui/SideMenu';
import BottomTabBar from '../src/components/ui/BottomTabBar';

export const options = { headerShown: false };

// Types
type Product = {
  name: string;
  price: string;
  image: any;
  category: string;
};

type Category = 'TOUS' | 'FRUITS' | 'LÉGUMES' | 'HERBES' | 'ÉPICES' | 'BIO';

// Données des catégories
const categories: Category[] = ['TOUS', 'FRUITS', 'LÉGUMES', 'HERBES', 'ÉPICES', 'BIO'];

// Données des produits
const newArrivals: Product[] = [
  {
    name: 'Pommes Gala Bio',
    price: '4.99€/kg',
    image: require('../assets/images/onboarding1.png'),
    category: 'FRUITS',
  },
  {
    name: 'Bananes Cavendish',
    price: '2.49€/kg',
    image: require('../assets/images/onboarding2.png'),
    category: 'FRUITS',
  },
  {
    name: 'Oranges Valencia',
    price: '3.99€/kg',
    image: require('../assets/images/onboarding3.png'),
    category: 'FRUITS',
  },
];

const featured: Product[] = [
  {
    name: 'Tomates Cerises',
    price: '5.99€/kg',
    image: require('../assets/images/onboarding1.png'),
    category: 'LÉGUMES',
  },
  {
    name: 'Concombres Bio',
    price: '2.99€/kg',
    image: require('../assets/images/onboarding2.png'),
    category: 'LÉGUMES',
  },
  {
    name: 'Poivrons Rouges',
    price: '4.49€/kg',
    image: require('../assets/images/onboarding3.png'),
    category: 'LÉGUMES',
  },
  {
    name: 'Carottes Nouvelles',
    price: '1.99€/kg',
    image: require('../assets/images/onboarding1.png'),
    category: 'LÉGUMES',
  },
];

const bestSellers: Product[] = [
  {
    name: 'Fraises Gariguette',
    price: '8.99€/kg',
    image: require('../assets/images/onboarding2.png'),
    category: 'FRUITS',
  },
  {
    name: 'Avocats Hass Bio',
    price: '6.99€/kg',
    image: require('../assets/images/onboarding3.png'),
    category: 'BIO',
  },
  {
    name: 'Kiwi Zespri',
    price: '5.49€/kg',
    image: require('../assets/images/onboarding1.png'),
    category: 'FRUITS',
  },
  {
    name: 'Poires Williams Bio',
    price: '3.99€/kg',
    image: require('../assets/images/onboarding2.png'),
    category: 'BIO',
  },
];

const HomeScreen = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<Category>('TOUS');
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleMenuPress = () => {
    setIsMenuVisible(true);
  };

  const handleCloseMenu = () => {
    setIsMenuVisible(false);
  };

  // Fonction de filtrage des produits
  const filterProducts = (products: Product[]): Product[] => {
    if (selectedCategory === 'TOUS') {
      return products;
    }
    return products.filter(product => product.category === selectedCategory);
  };

  const filteredNewArrivals = filterProducts(newArrivals);
  const filteredFeatured = filterProducts(featured);
  const filteredBestSellers = filterProducts(bestSellers);

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Shopertino"
        onMenuPress={handleMenuPress}
        cartCount={2}
        onCartPress={() => router.push('/cart')}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <CategoryTabs
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {/* Section New Arrivals */}
        {filteredNewArrivals.length > 0 && (
          <>
            <SectionTitle center>New Arrivals</SectionTitle>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.newArrivalsContainer}
              contentContainerStyle={styles.newArrivalsContent}
            >
              {filteredNewArrivals.map((product, index) => (
                <ProductCard
                  key={index}
                  {...product}
                  style={styles.regularProduct}
                  centerPrice={true}
                />
              ))}
            </ScrollView>
          </>
        )}

        {/* Section Featured */}
        {filteredFeatured.length > 0 && (
          <>
            <SectionTitle>Featured</SectionTitle>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginLeft: 16 }}>
              {filteredFeatured.map((product, idx) => (
                <ProductCard key={idx} {...product} priceFirst={true} />
              ))}
            </ScrollView>
          </>
        )}

        {/* Section Best Sellers */}
        {filteredBestSellers.length > 0 && (
          <>
            <SectionTitle>Best Sellers</SectionTitle>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginLeft: 16 }}>
              {filteredBestSellers.map((product, idx) => (
                <ProductCard key={idx} {...product} priceFirst={true} />
              ))}
            </ScrollView>
          </>
        )}

        {/* Message si aucun produit dans aucune section */}
        {filteredNewArrivals.length === 0 &&
         filteredFeatured.length === 0 &&
         filteredBestSellers.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Aucun produit disponible dans cette catégorie
            </Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  newArrivalsContainer: {
    marginLeft: 16,
  },
  newArrivalsContent: {
    paddingRight: 16,
  },
  newArrivalCard: {
    marginRight: 16,
  },
  regularProduct: {
    width: 140,
    height: 240,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: 'System',
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeScreen;
