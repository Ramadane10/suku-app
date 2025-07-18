import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import CategoryTabs from '../../src/components/ui/CategoryTabs';
import Header from '../../src/components/ui/Header';
import ProductCard from '../../src/components/ui/ProductCard';
import ProductListHorizontal from '../../src/components/ui/ProductListHorizontal';
import SectionTitle from '../../src/components/ui/SectionTitle';
import colors from '../../src/constants/colors';

// Données mockées pour les catégories
const categories = ['CLOTHING', 'ACCESSORIES', 'SHOES', 'BAGS', 'JEWELRY'];

// Données mockées pour les produits
const newArrivals = [
  {
    image: require('../../assets/images/onboarding1.png'),
    name: 'PEBBLE BEACH ROMPER',
    price: '$16.50',
  },
  {
    image: require('../../assets/images/onboarding1.png'),
    name: "DON'T TELL A SOUL METALLIC ROMPER",
    price: '$18.50',
  },
  {
    image: require('../../assets/images/onboarding1.png'),
    name: 'SUMMER BREEZE DRESS',
    price: '$22.99',
  },
];

const featured = [
  {
    image: require('../../assets/images/onboarding1.png'),
    name: 'Katie Ruched Tube Top',
    price: '$12.99',
  },
  {
    image: require('../../assets/images/onboarding2.png'),
    name: 'Gema White Sandals',
    price: '$79',
  },
  {
    image: require('../../assets/images/onboarding3.png'),
    name: 'FIONA BLACK',
    price: '$119',
  },
];

const bestSellers = [
  {
    image: require('../../assets/images/onboarding1.png'),
    name: 'Classic romper',
    price: '$14',
  },
  {
    image: require('../../assets/images/onboarding1.png'),
    name: "Don't Tell A Soul Metallic Romp...",
    price: '$18.50',
  },
  {
    image: require('../../assets/images/onboarding3.png'),
    name: 'Bess Mode Blazer',
    price: '$59.99',
  },
  {
    image: require('../../assets/images/onboarding1.png'),
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

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Shopertino" onMenuPress={handleMenuPress} />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <CategoryTabs
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {/* Section New Arrivals */}
        <SectionTitle>New Arrivals</SectionTitle>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.newArrivalsContainer}>
          {newArrivals.map((product, index) => (
            <View key={index} style={styles.newArrivalCard}>
              <ProductCard {...product} style={styles.newArrivalProduct} />
            </View>
          ))}
        </ScrollView>

        {/* Section Featured */}
        <SectionTitle>Featured</SectionTitle>
        <ProductListHorizontal products={featured} />

        {/* Section Best Sellers */}
        <SectionTitle>Best Sellers</SectionTitle>
        <ProductListHorizontal products={bestSellers} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 100,
    flex: 1,
    backgroundColor: colors.light,
  },
  newArrivalsContainer: {
    marginLeft: 16,
  },
  newArrivalCard: {
    marginRight: 16,
  },
  newArrivalProduct: {
    width: 160,
    height: 200,
  },
});

export default HomeScreen;
