import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../src/components/ui/Header';
import SideMenu from '../src/components/ui/SideMenu';
import fonts from '../src/constants/fonts';
import { useCart } from '../src/context/CartContext';
import { useTheme } from '../src/hooks/useTheme';

export const options = { headerShown: false };

const CartScreen = () => {
  const { cartItems, loading, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const router = useRouter();
  const { colors } = useTheme();

  // Mémoriser les valeurs calculées
  const cartTotal = useMemo(() => getCartTotal(), [getCartTotal, cartItems]);
  const cartCount = useMemo(() => cartItems.length, [cartItems.length]);

  // Mémoriser les handlers
  const handleUpdateQuantity = useCallback((id: string, qty: number) => {
    // S'assurer que la quantité est un multiple de 0.5 et au moins 0.5
    const normalizedQty = Math.max(0.5, Math.round(qty * 2) / 2);
    updateQuantity(id, normalizedQty);
  }, [updateQuantity]);

  const handleRemove = useCallback((id: string) => {
    removeFromCart(id);
  }, [removeFromCart]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header
          title="Mon Panier"
          cartCount={0}
          onMenuPress={() => setIsMenuVisible(true)}
          onCartPress={() => router.push('/cart')}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Chargement du panier...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Mon Panier"
        cartCount={cartCount}
        onMenuPress={() => setIsMenuVisible(true)}
        onCartPress={() => router.push('/cart')}
      />
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="shopping-cart" size={60} color={colors.grey} />
          <Text style={[styles.emptyText, { color: colors.grey }]}>Votre panier est vide.</Text>
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.itemsList}
            contentContainerStyle={{ paddingBottom: 80 }}
          >
            {cartItems.map((item: any) => (
              <View key={item.id} style={[styles.itemRow, { backgroundColor: colors.surface }]}>
                <Image source={item.image} style={styles.itemImage} contentFit="cover" transition={200} />
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.itemPrice, { color: colors.textSecondary }]}>{item.price} x {item.quantity}kg</Text>
                  <Text style={[styles.itemTotal, { color: colors.primary }]}>Total : {item.totalPrice}€</Text>
                  <View style={styles.quantityRow}>
                    <TouchableOpacity onPress={() => handleUpdateQuantity(item.id, item.quantity - 0.5)} style={[styles.qtyBtn, { backgroundColor: colors.secondary }]}>
                      <Text style={[styles.qtyBtnText, { color: colors.text }]}>-</Text>
                    </TouchableOpacity>
                    <Text style={[styles.qtyText, { color: colors.text }]}>{item.quantity} kg</Text>
                    <TouchableOpacity onPress={() => handleUpdateQuantity(item.id, item.quantity + 0.5)} style={[styles.qtyBtn, { backgroundColor: colors.secondary }]}>
                      <Text style={[styles.qtyBtnText, { color: colors.text }]}>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleRemove(item.id)} style={styles.removeBtn}>
                      <MaterialCommunityIcons name="delete-outline" size={22} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={[styles.footer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total :</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>{cartTotal}€</Text>
            <TouchableOpacity style={[styles.clearBtn, { backgroundColor: colors.danger }]} onPress={clearCart}>
              <Text style={styles.clearBtnText}>Vider le panier</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[styles.orderBtn, { backgroundColor: colors.primary }]} onPress={() => router.push('/shipping')}>
            <Text style={styles.orderBtnText}>Commander</Text>
          </TouchableOpacity>
        </>
      )}
      <SideMenu isVisible={isMenuVisible} onClose={() => setIsMenuVisible(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
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
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    marginTop: 12,
  },
  itemsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: 4,
  },
  itemPrice: {
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  itemTotal: {
    fontFamily: fonts.bold,
    fontSize: 15,
    marginTop: 2,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  qtyBtnText: {
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  qtyText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    marginHorizontal: 8,
  },
  removeBtn: {
    marginLeft: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  totalValue: {
    fontFamily: fonts.bold,
    fontSize: 20,
  },
  clearBtn: {
    marginLeft: 16,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  clearBtnText: {
    color: '#fff',
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  orderBtn: {
    marginHorizontal: 16,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 100, // Augmenté pour éviter la TabBar
  },
  orderBtnText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#fff',
  },
});

export default CartScreen;