import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CategoryTabs from '../src/components/ui/CategoryTabs';
import Header from '../src/components/ui/Header';
import ProductCard from '../src/components/ui/ProductCard';
import SectionTitle from '../src/components/ui/SectionTitle';

// Données mockées pour les catégories
const categories = ['CLOTHING', 'ACCESSORIES', 'SHOES', 'BAGS', 'JEWELRY'];

// Données mockées pour les produits
const newArrivals = [
  {
    image: require('../assets/images/onboarding1.png'),
    name: 'PEBBLE BEACH ROMPER',
    price: '$16.50',
  },
  {
    image: require('../assets/images/onboarding2.png'),
    name: "DON'T TELL A SOUL METALLIC ROMPER",
    price: '$18.50',
  },
  {
    image: require('../assets/images/onboarding3.png'),
    name: 'SUMMER BREEZE DRESS',
    price: '$22.99',
  },
];

const featured = [
  {
    image: require('../assets/images/onboarding1.png'),
    name: 'Katie Ruched Tube Top',
    price: '$12.99',
  },
  {
    image: require('../assets/images/onboarding2.png'),
    name: 'Gema White Sandals',
    price: '$79',
  },
  {
    image: require('../assets/images/onboarding3.png'),
    name: 'FIONA BLACK',
    price: '$119',
  },
];

const bestSellers = [
  {
    image: require('../assets/images/onboarding1.png'),
    name: 'Classic romper',
    price: '$14',
  },
  {
    image: require('../assets/images/onboarding2.png'),
    name: "Don't Tell A Soul Metallic Romp...",
    price: '$18.50',
  },
  {
    image: require('../assets/images/onboarding3.png'),
    name: 'Bess Mode Blazer',
    price: '$59.99',
  },
  {
    image: require('../assets/images/onboarding1.png'),
    name: "You'll Never Be Like Me",
    price: '$39.99',
  },
];

const HomeScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('CLOTHING');

  const handleMenuPress = () => {
    // Gérer l'ouverture du menu
    console.log('Menu pressed');
  };

  const renderNewArrivalCard = (product: any, index: number) => {
    return (
      <View
        key={index}
        style={styles.newArrivalCard}
      >
        <ProductCard 
          {...product} 
          style={styles.regularProduct}
          centerPrice={true}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Shopertino" onMenuPress={handleMenuPress} cartCount={2} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <CategoryTabs
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {/* Section New Arrivals */}
        <SectionTitle center>New Arrivals</SectionTitle>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.newArrivalsContainer}
          contentContainerStyle={styles.newArrivalsContent}
        >
          {newArrivals.map((product, index) => renderNewArrivalCard(product, index))}
        </ScrollView>

        {/* Section Featured */}
        <SectionTitle>Featured</SectionTitle>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginLeft: 16 }}>
          {featured.map((product, idx) => (
            <ProductCard key={idx} {...product} priceFirst={true} />
          ))}
        </ScrollView>

        {/* Section Best Sellers */}
        <SectionTitle>Best Sellers</SectionTitle>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginLeft: 16 }}>
          {bestSellers.map((product, idx) => (
            <ProductCard key={idx} {...product} priceFirst={true} />
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Fond blanc pour toute l'app
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
});

export default HomeScreen;
