import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../src/components/ui/BottomTabBar';
import Header from '../src/components/ui/Header';
import ProductCard from '../src/components/ui/ProductCard';
import SideMenu from '../src/components/ui/SideMenu';
import fonts from '../src/constants/fonts';
import { useTheme } from '../src/hooks/useTheme';

export const options = { headerShown: false };

type Product = {
  name: string;
  price: string;
  image: any;
  category: string;
};

const allProducts: Product[] = [
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

export default function BoutiqueScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return allProducts;
    const q = searchQuery.trim().toLowerCase();
    return allProducts.filter((product) => product.name.toLowerCase().includes(q));
  }, [searchQuery]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Boutique"
        onMenuPress={() => setIsMenuVisible(true)}
        cartCount={0}
        onCartPress={() => router.push('/cart')}
      />
      <View style={styles.searchContainer}>
        <View style={[styles.searchInput, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Feather name="search" size={18} color={colors.grey} />
          <TextInput
            style={[styles.searchText, { color: colors.text }]}
            placeholder="Rechercher un produit"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <Text style={[styles.resultCount, { color: colors.textSecondary }]}>{filteredProducts.length} produits</Text>
      </View>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.name}
        numColumns={2}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <ProductCard {...item} style={styles.card} />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Aucun produit trouvé.</Text>
          </View>
        }
      />
      <BottomTabBar />
      <SideMenu isVisible={isMenuVisible} onClose={() => setIsMenuVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  searchText: {
    flex: 1,
    marginLeft: 8,
    fontFamily: fonts.regular,
    fontSize: 15,
  },
  resultCount: {
    marginTop: 8,
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  column: {
    justifyContent: 'space-between',
  },
  gridItem: {
    flex: 1,
    alignItems: 'center',
  },
  card: {
    marginRight: 0,
    marginBottom: 16,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
  },
});
