import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../src/components/ui/Header';
import SideMenu from '../src/components/ui/SideMenu';
import colors from '../src/constants/colors';
import fonts from '../src/constants/fonts';
import { useCart } from '../src/context/CartContext';

export const options = { headerShown: false };

const CartScreen = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Mon Panier" cartCount={cartItems.length} onMenuPress={() => setIsMenuVisible(true)} />
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="shopping-cart" size={60} color={colors.grey} />
          <Text style={styles.emptyText}>Votre panier est vide.</Text>
        </View>
      ) : (
        <>
          <ScrollView style={styles.itemsList}>
            {cartItems.map((item: any) => (
              <View key={item.id} style={styles.itemRow}>
                <Image source={item.image} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemPrice}>{item.price} x {item.quantity}kg</Text>
                  <Text style={styles.itemTotal}>Total : {item.totalPrice}€</Text>
                  <View style={styles.quantityRow}>
                    <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)} style={styles.qtyBtn}>
                      <Text style={styles.qtyBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity} kg</Text>
                    <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)} style={styles.qtyBtn}>
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeBtn}>
                      <MaterialCommunityIcons name="delete-outline" size={22} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
          <View style={styles.footer}>
            <Text style={styles.totalLabel}>Total :</Text>
            <Text style={styles.totalValue}>{getCartTotal()}€</Text>
            <TouchableOpacity style={styles.clearBtn} onPress={clearCart}>
              <Text style={styles.clearBtnText}>Vider le panier</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.orderBtn} onPress={() => router.push('/shipping')}>
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
    backgroundColor: '#fff',
    paddingTop: 20,
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
    color: colors.grey,
    marginTop: 16,
  },
  itemsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light,
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
    color: colors.dark,
    marginBottom: 4,
  },
  itemPrice: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.grey,
  },
  itemTotal: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.primary,
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
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  qtyBtnText: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.dark,
  },
  qtyText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.dark,
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
    borderColor: colors.light,
    backgroundColor: '#fff',
  },
  totalLabel: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.dark,
  },
  totalValue: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.primary,
  },
  clearBtn: {
    marginLeft: 16,
    backgroundColor: colors.danger,
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
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  orderBtnText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#fff',
  },
});

export default CartScreen; 