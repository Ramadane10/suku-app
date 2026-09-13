import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
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
import CategoryTabs from "../src/components/ui/CategoryTabs";
import Header from "../src/components/ui/Header";
import ProductCard from "../src/components/ui/ProductCard";
import SectionTitle from "../src/components/ui/SectionTitle";
import SideMenu from "../src/components/ui/SideMenu";
import { useCart } from "../src/context/CartContext";
import { useNotifications } from "../src/hooks/useNotifications";
import { useProducts } from "../src/hooks/useProducts";
import { useTheme } from "../src/hooks/useTheme";
import { formatPrice } from "../src/utils/formatters";

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
  column: {
    justifyContent: "space-between",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
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
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: "System",
    fontSize: 16,
    textAlign: "center",
  },
  productsGrid: {
    paddingHorizontal: 16,
    paddingTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    height: 48,
  },
  searchTextInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    paddingVertical: 0,
    paddingRight: 8,
  },
});

const HomeScreen = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const { getCartCount } = useCart();
  const { unreadCount } = useNotifications();
  const {
    products,
    categories: dbCategories,
    loading,
    getNewArrivals,
    getFeatured,
    getBestSellers,
    getProductsByCategory,
  } = useProducts();

  const [selectedCategory, setSelectedCategory] = useState<string>("TOUS");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) =>
      p.name?.toLowerCase().includes(q) ||
      p.category?.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  const categoryNames = useMemo(
    () => ["TOUS", ...dbCategories.map((c) => c.name)],
    [dbCategories],
  );

  const handleMenuPress = useCallback(() => {
    setIsMenuVisible(true);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setIsMenuVisible(false);
  }, []);

  const isAllCategories = selectedCategory === "TOUS";

  const newArrivals = useMemo(() => getNewArrivals(), [getNewArrivals]);
  const featured = useMemo(() => getFeatured(), [getFeatured]);
  const bestSellers = useMemo(() => getBestSellers(), [getBestSellers]);
  const displayedProducts = useMemo(
    () => getProductsByCategory(selectedCategory),
    [selectedCategory, getProductsByCategory],
  );

  const handleProductPress = useCallback((product: any) => {
    router.push({
      pathname: "/product-details",
      params: {
        productId: product.id,
        name: product.name,
        price: formatPrice(product.price_per_kg, true),
        category: product.category?.name,
        image: product.image_url,
      },
    });
  }, [router]);

  const renderProduct = useCallback((product: any, style = {}) => (
    <ProductCard
      key={product.id}
      id={product.id}
      productId={product.id}
      name={product.name}
      price={formatPrice(product.price_per_kg, true)}
      image={
        product.image_url
          ? { uri: product.image_url }
          : require("../assets/images/onboarding1.png")
      }
      category={product.category?.name || "BIO"}
      stockQuantity={product.stock_quantity}
      priceFirst={true}
      onPress={() => handleProductPress(product)}
      style={style}
    />
  ), [handleProductPress]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Nwanma"
        onMenuPress={handleMenuPress}
        notificationCount={unreadCount}
        onNotificationPress={() => router.push("/notifications")}
        cartCount={getCartCount()}
      />

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputWrapper, { backgroundColor: colors.surface, borderColor: searchQuery ? colors.primary : colors.border }]}>
          <Feather name="search" size={18} color={searchQuery ? colors.primary : colors.grey} style={{ marginLeft: 12 }} />
          <TextInput
            style={[styles.searchTextInput, { color: colors.text }]}
            placeholder="Rechercher un produit..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={(t) => { setSearchQuery(t); if (selectedCategory !== "TOUS") setSelectedCategory("TOUS"); }}
            returnKeyType="search"
            onSubmitEditing={() => {
              if (searchQuery.trim()) {
                router.push({ pathname: "/boutique", params: { q: searchQuery.trim() } });
                setSearchQuery("");
              }
            }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={{ padding: 8 }}>
              <Ionicons name="close-circle" size={18} color={colors.grey} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : searchQuery.trim() ? (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.column}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews={true}
          ListHeaderComponent={
            <View style={{ paddingBottom: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                {searchResults.length} résultat{searchResults.length !== 1 ? "s" : ""}
              </Text>
              <TouchableOpacity onPress={() => { router.push({ pathname: "/boutique", params: { q: searchQuery } }); setSearchQuery(""); }}>
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "600" }}>Tout voir</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              {renderProduct(item, styles.card)}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Feather name="search" size={48} color={colors.grey} />
              <Text style={[styles.emptyText, { color: colors.textSecondary, marginTop: 12 }]}>
                Aucun résultat pour « {searchQuery} »
              </Text>
            </View>
          }
        />
      ) : (
        <>
          <View
            style={{
              paddingVertical: 4,
              borderBottomColor: colors.border,
              borderBottomWidth: 1,
              backgroundColor: colors.surface,
              zIndex: 999,
            }}
          >
            <CategoryTabs
              categories={categoryNames}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </View>
          {isAllCategories ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 120 }}
            >
              {newArrivals.length > 0 && (
                <>
                  <SectionTitle>Nouveautés</SectionTitle>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.newArrivalsContainer}
                    contentContainerStyle={styles.newArrivalsContent}
                  >
                    {newArrivals.map((p) => renderProduct(p, { width: 140, marginRight: 16 }))}
                  </ScrollView>
                </>
              )}

              {featured.length > 0 && (
                <>
                  <SectionTitle>En Vedette</SectionTitle>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginLeft: 16 }}
                    contentContainerStyle={{ paddingRight: 16 }}
                  >
                    {featured.map((p) => renderProduct(p, { width: 140, marginRight: 16 }))}
                  </ScrollView>
                </>
              )}

              {bestSellers.length > 0 && (
                <>
                  <SectionTitle>Meilleures Ventes</SectionTitle>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginLeft: 16 }}
                    contentContainerStyle={{ paddingRight: 16 }}
                  >
                    {bestSellers.map((p) => renderProduct(p, { width: 140, marginRight: 16 }))}
                  </ScrollView>
                </>
              )}
            </ScrollView>
          ) : (
            <FlatList
              data={displayedProducts}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.column}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              initialNumToRender={6}
              maxToRenderPerBatch={8}
              windowSize={5}
              removeClippedSubviews={true}
              renderItem={({ item }) => (
                <View style={styles.gridItem}>
                  {renderProduct(item, styles.card)}
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    Aucun produit disponible dans cette catégorie
                  </Text>
                </View>
              }
            />
          )}
        </>
      )}
      <SideMenu isVisible={isMenuVisible} onClose={handleCloseMenu} />
    </SafeAreaView>
  );
};

export default HomeScreen;
