import { AntDesign, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../src/components/ui/BottomTabBar';
import Header from '../src/components/ui/Header';
import colors from '../src/constants/colors';
import fonts from '../src/constants/fonts';
import { useCart } from '../src/context/CartContext';
import { useOrder } from '../src/context/OrderContext';

export const options = { headerShown: false };

const paymentMethods = [
  { key: 'orange', label: 'Orange Money', icon: <MaterialCommunityIcons name="cellphone" size={22} color={colors.primary} /> },
  { key: 'mobile', label: 'Mobile Money', icon: <MaterialCommunityIcons name="cellphone" size={22} color={colors.success} /> },
  { key: 'card', label: 'Carte bancaire', icon: <AntDesign name="creditcard" size={22} color={colors.dark} /> },
];

const CheckoutScreen = () => {
  const { getCartTotal, clearCart } = useCart();
  const { shipping, payment, clearOrder } = useOrder();
  const router = useRouter();

  const handlePay = () => {
    if (!shipping.address || !shipping.city || !shipping.postalCode || !shipping.country || !payment) {
      Alert.alert('Erreur', 'Informations incomplètes.');
      return;
    }
    clearCart();
    clearOrder();
    Alert.alert('Paiement réussi', `Merci pour votre achat via ${paymentMethods.find(m => m.key === payment)?.label} !`);
    router.push('/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
              <TouchableOpacity 
                onPress={() => router.back()} 
                style={styles.iconButton}
                activeOpacity={0.7}
              >
                <AntDesign name="arrowleft" size={24} color={colors.dark} />
              </TouchableOpacity>
              
              {/* <TouchableOpacity 
                style={styles.iconButton}
                activeOpacity={0.7}
              >
                <Feather name="share-2" size={22} color={colors.dark} />
              </TouchableOpacity> */}
            </View>
      {/* <Header title="Récapitulatif" /> */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
        <Text style={styles.sectionTitle}>Total à payer</Text>
        <View style={styles.infoBoxRow}>
          <AntDesign name="shoppingcart" size={22} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={styles.totalValue}>{getCartTotal()}€</Text>
        </View>
        <TouchableOpacity style={styles.orderBtn} onPress={handlePay}>
          <Text style={styles.orderBtnText}>Payer maintenant</Text>
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
});

export default CheckoutScreen; 