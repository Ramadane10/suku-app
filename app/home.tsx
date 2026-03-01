import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CategoryTabs from "../src/components/ui/CategoryTabs";
import Header from "../src/components/ui/Header";
import ProductCard from "../src/components/ui/ProductCard";
import SectionTitle from "../src/components/ui/SectionTitle";
import SideMenu from "../src/components/ui/SideMenu";
import { useCart } from "../src/context/CartContext";
import { useProducts } from "../src/hooks/useProducts";
import { useTheme } from "../src/hooks/useTheme";

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
});

const HomeScreen = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const { getCartCount } = useCart();
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
  const [isMenuVisible, setIsMenuVisible] = useState(false);

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

  const insets = useSafeAreaInsets();

  const handleProductPress = (product: any) => {
    router.push({
      pathname: "/product-details",
      params: {
        productId: product.id,
        name: product.name,
        price: `${product.price_per_kg}€/kg`,
        category: product.category?.name,
        image: product.image_url,
      },
    });
  };

  const renderProduct = (product: any, style = {}) => (
    <ProductCard
      key={product.id}
      id={product.id}
      productId={product.id}
      name={product.name}
      price={`${product.price_per_kg}€/kg`}
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
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Accueil"
        onMenuPress={handleMenuPress}
        notificationCount={0}
        onNotificationPress={() => router.push("/notifications")}
        fixed={true}
        cartCount={getCartCount()}
      />

      <View style={{ height: 60 + insets.top }} />

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
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
    </View>
  );
};

export default HomeScreen;
