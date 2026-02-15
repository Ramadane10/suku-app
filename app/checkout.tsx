import { AntDesign, Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../src/components/ui/Header';
import colors from '../src/constants/colors';
import fonts from '../src/constants/fonts';
import { useCart } from '../src/context/CartContext';
import { useOrder } from '../src/context/OrderContext';
import { useOrders } from '../src/hooks/useOrders';

export const options = { headerShown: false };

const paymentMethods = [
  { key: 'orange', label: 'Orange Money', icon: <MaterialCommunityIcons name="cellphone" size={22} color={colors.primary} /> },
  { key: 'mobile', label: 'Mobile Money', icon: <MaterialCommunityIcons name="cellphone" size={22} color={colors.success} /> },
  { key: 'card', label: 'Carte bancaire', icon: <AntDesign name="creditcard" size={22} color={colors.dark} /> },
];

const CheckoutScreen = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { shipping, payment, directPurchase, clearOrder, clearDirectPurchase } = useOrder();
  const { createOrder } = useOrders();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);

  // Déterminer si c'est un achat direct ou depuis le panier
  const isDirectPurchase = directPurchase !== null;
  const itemsToOrder = isDirectPurchase ? [directPurchase] : cartItems;
  
  // Calculer le total
  const calculateTotal = () => {
    if (isDirectPurchase) {
      return parseFloat(directPurchase.totalPrice);
    }
    return parseFloat(getCartTotal());
  };

  const handlePay = async () => {
    if (!shipping.address || !shipping.city || !shipping.country || !payment) {
      Alert.alert('Erreur', 'Informations incomplètes. Veuillez vérifier votre adresse de livraison et votre mode de paiement.');
      console.log('Shipping data:', shipping);
      console.log('Payment:', payment);
      return;
    }

    // Vérifier les items à commander
    console.log('=== DEBUG CHECKOUT ===');
    console.log('isDirectPurchase:', isDirectPurchase);
    console.log('directPurchase:', JSON.stringify(directPurchase, null, 2));
    console.log('cartItems:', cartItems);
    console.log('itemsToOrder:', itemsToOrder);
    console.log('itemsToOrder.length:', itemsToOrder.length);

    // Vérifier que directPurchase a toutes les propriétés nécessaires
    if (isDirectPurchase) {
      if (!directPurchase) {
        Alert.alert('Erreur', 'Le produit d\'achat direct a été perdu. Veuillez réessayer depuis la page du produit.');
        router.push('/home');
        return;
      }
      if (!directPurchase.productId || !directPurchase.name || !directPurchase.pricePerKilo || !directPurchase.quantity) {
        console.error('DirectPurchase invalide:', directPurchase);
        Alert.alert('Erreur', 'Les informations du produit sont incomplètes. Veuillez réessayer.');
        return;
      }
    }

    if (itemsToOrder.length === 0) {
      Alert.alert('Erreur', isDirectPurchase ? 'Aucun produit à commander pour l\'achat direct.' : 'Votre panier est vide.');
      return;
    }

    setProcessing(true);

    try {
      // S'assurer que les items ont le bon format pour createOrder
      const formattedItems = itemsToOrder.map(item => ({
        productId: item.productId || item.id,
        name: item.name,
        pricePerKilo: item.pricePerKilo || item.unit_price || 0,
        quantity: item.quantity || item.quantity_kg || 0,
        totalPrice: item.totalPrice || item.total_price || '0',
      }));

      console.log('Formatted items for createOrder:', formattedItems);
      console.log('Total amount:', calculateTotal());

      // Créer la commande dans Supabase
      await createOrder({
        cartItems: formattedItems,
        shippingAddress: {
          address_line: shipping.address,
          city: shipping.city,
          postal_code: shipping.postalCode || '00000',
          country: shipping.country,
        },
        paymentMethod: payment,
        totalAmount: calculateTotal(),
      });

      // Vider le panier (si achat depuis panier) et les données de commande
      if (!isDirectPurchase) {
        await clearCart();
      }
      clearDirectPurchase();
      clearOrder();

      Alert.alert(
        'Paiement réussi',
        `Merci pour votre achat via ${paymentMethods.find(m => m.key === payment)?.label} ! Votre commande a été enregistrée.`,
        [
          {
            text: 'Voir mes commandes',
            onPress: () => router.push('/orders'),
          },
          {
            text: 'Continuer',
            onPress: () => router.push('/home'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error processing payment:', error);
      Alert.alert(
        'Erreur',
        error.message || 'Une erreur est survenue lors du traitement de votre commande. Veuillez réessayer.'
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.iconButton}
                activeOpacity={0.3}
                delayPressIn={0}
              >
                <Ionicons name="arrow-back" size={24} color={colors.dark} />
              </TouchableOpacity>

              {/* <TouchableOpacity
                style={styles.iconButton}
                activeOpacity={0.3}
                delayPressIn={0}
              >
                <Feather name="share-2" size={22} color={colors.dark} />
              </TouchableOpacity> */}
            </View>
      {/* <Header title="Récapitulatif" /> */}
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 }]}>
        <Text style={styles.sectionTitle}>Adresse de livraison</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>{shipping.address}</Text>
          <Text style={styles.infoText}>{shipping.postalCode} {shipping.city}</Text>
          <Text style={styles.infoText}>{shipping.country}</Text>
        </View>
        <Text style={styles.sectionTitle}>Mode de paiement</Text>
        <View style={styles.infoBoxRow}>
          {paymentMethods.find(m => m.key === payment)?.icon}
          <Text style={styles.infoText}>{paymentMethods.find(m => m.key === payment)?.label}</Text>
        </View>
        <Text style={styles.sectionTitle}>Résumé de la commande</Text>
        <View style={styles.infoBox}>
          {itemsToOrder.length > 0 ? (
            itemsToOrder.map((item, index) => (
              <View key={index} style={styles.orderItemRow}>
                <Text style={styles.orderItemName}>{item.name || 'Produit'}</Text>
                <Text style={styles.orderItemDetails}>
                  {(item.quantity || item.quantity_kg || 0)} kg × {(item.pricePerKilo || item.unit_price || 0)}€/kg = {(item.totalPrice || item.total_price || 0)}€
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.orderItemName, { color: colors.textSecondary }]}>
              {isDirectPurchase ? 'Aucun produit sélectionné pour l\'achat direct' : 'Aucun article dans le panier'}
            </Text>
          )}
        </View>
        <Text style={styles.sectionTitle}>Total à payer</Text>
        <View style={styles.infoBoxRow}>
          <Ionicons name="cart-outline" size={22} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={styles.totalValue}>{calculateTotal().toFixed(2)}€</Text>
        </View>
        <TouchableOpacity 
          style={[styles.orderBtn, processing && styles.orderBtnDisabled]} 
          onPress={handlePay}
          disabled={processing}
        >
          {processing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.orderBtnText}>Traitement...</Text>
            </View>
          ) : (
            <Text style={styles.orderBtnText}>Payer maintenant</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 100 },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.dark,
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 16,
  },
    header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoBox: {
    backgroundColor: colors.light,
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
  },
  infoBoxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light,
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
  },
  infoText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.dark,
    marginBottom: 2,
    marginLeft: 8,
  },
  totalValue: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.primary,
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
  orderBtnDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
  },
  orderItemName: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.dark,
    flex: 1,
  },
  orderItemDetails: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.grey,
    marginLeft: 8,
  },
});

export default CheckoutScreen;