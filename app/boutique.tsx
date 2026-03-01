import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../src/components/ui/Header";
import ProductCard from "../src/components/ui/ProductCard";
import SideMenu from "../src/components/ui/SideMenu";
import fonts from "../src/constants/fonts";
import { useCart } from "../src/context/CartContext";
import { useProducts } from "../src/hooks/useProducts";
import { useTheme } from "../src/hooks/useTheme";

export const options = { headerShown: false };

export default function BoutiqueScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { products, loading, getProductsByCategory, categories } =
    useProducts();
  const { getCartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "price_asc" | "price_desc">(
    "name",
  );
  const [showFilters, setShowFilters] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleMenuPress = useCallback(() => {
    setIsMenuVisible(true);
  }, []);

  const handleCartPress = useCallback(() => {
    router.push("/cart");
  }, [router]);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filtre par recherche
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(q) ||
          product.category?.name.toLowerCase().includes(q) ||
          product.description?.toLowerCase().includes(q),
      );
    }

    // Filtre par catégorie
    if (selectedCategory) {
      filtered = filtered.filter(
        (product) =>
          product.category?.id === selectedCategory ||
          product.category?.slug === selectedCategory,
      );
    }

    // Tri
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return (a.price_per_kg || 0) - (b.price_per_kg || 0);
        case "price_desc":
          return (b.price_per_kg || 0) - (a.price_per_kg || 0);
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, sortBy, products]);

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <Header
          title="Boutique"
          onMenuPress={handleMenuPress}
          cartCount={getCartCount()}
          onCartPress={handleCartPress}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Chargement des produits...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Header
        title="Boutique"
        onMenuPress={handleMenuPress}
        cartCount={getCartCount()}
        onCartPress={handleCartPress}
        onNotificationPress={() => router.push('/notifications')}
      />
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchInput,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Feather name="search" size={18} color={colors.grey} />
          <TextInput
            style={[styles.searchText, { color: colors.text }]}
            placeholder="Rechercher un produit"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={[
              styles.filterButton,
              { backgroundColor: showFilters ? colors.primary : "transparent" },
            ]}
          >
            <Feather
              name="sliders"
              size={18}
              color={showFilters ? "#fff" : colors.grey}
            />
          </TouchableOpacity>
        </View>
        <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
          {filteredProducts.length} produits
        </Text>

        {showFilters && (
          <View
            style={[
              styles.filtersContainer,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.filterTitle, { color: colors.text }]}>
              Catégorie
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryFilters}
            >
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      selectedCategory === null ? colors.primary : colors.light,
                  },
                ]}
                onPress={() => setSelectedCategory(null)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: selectedCategory === null ? "#fff" : colors.text },
                  ]}
                >
                  Toutes
                </Text>
              </TouchableOpacity>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor:
                        selectedCategory === cat.id
                          ? colors.primary
                          : colors.light,
                    },
                  ]}
                  onPress={() =>
                    setSelectedCategory(
                      selectedCategory === cat.id ? null : cat.id,
                    )
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      {
                        color:
                          selectedCategory === cat.id ? "#fff" : colors.text,
                      },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text
              style={[
                styles.filterTitle,
                { color: colors.text, marginTop: 16 },
              ]}
            >
              Trier par
            </Text>
            <View style={styles.sortOptions}>
              {[
                { key: "name", label: "Nom (A-Z)" },
                { key: "price_asc", label: "Prix croissant" },
                { key: "price_desc", label: "Prix décroissant" },
              ].map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.sortButton,
                    {
                      backgroundColor:
                        sortBy === option.key ? colors.primary : colors.light,
                      borderColor:
                        sortBy === option.key ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setSortBy(option.key as any)}
                >
                  <Text
                    style={[
                      styles.sortButtonText,
                      { color: sortBy === option.key ? "#fff" : colors.text },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.column}
        contentContainerStyle={[styles.listContent, { paddingBottom: 80 }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <ProductCard
              id={item.id}
              productId={item.id}
              name={item.name}
              price={`${item.price_per_kg}€/kg`}
              image={
                item.image_url
                  ? { uri: item.image_url }
                  : require("../assets/images/onboarding1.png")
              }
              category={item.category?.name || "FRUITS"}
              stockQuantity={item.stock_quantity}
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/product-details",
                  params: {
                    productId: item.id,
                    name: item.name,
                    price: `${item.price_per_kg}€/kg`,
                    category: item.category?.name,
                    image: item.image_url,
                  },
                })
              }
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Aucun produit trouvé.
            </Text>
          </View>
        }
      />
      <SideMenu
        isVisible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
      />
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
    flexDirection: "row",
    alignItems: "center",
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
    justifyContent: "space-between",
  },
  gridItem: {
    flex: 1,
    alignItems: "center",
  },
  card: {
    marginRight: 0,
    marginBottom: 16,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    marginTop: 12,
  },
  filterButton: {
    padding: 6,
    borderRadius: 6,
  },
  filtersContainer: {
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    marginBottom: 8,
  },
  categoryFilters: {
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipText: {
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  sortOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 120,
  },
  sortButtonText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    textAlign: "center",
  },
});
