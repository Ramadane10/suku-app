import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../src/components/ui/BottomTabBar';
import Header from '../src/components/ui/Header';
import colors from '../src/constants/colors';
import fonts from '../src/constants/fonts';
import { useCart } from '../src/context/CartContext';

export const options = { headerShown: false };

const orders = [
  {
    id: 'CMD-1042',
    date: '12 Jan 2026',
    status: 'En cours',
    total: '24.90€',
    items: [
      { name: 'Pommes Gala Bio', qty: '1.0 kg' },
      { name: 'Tomates Cerises', qty: '0.5 kg' },
    ],
    timeline: ['Commande reçue', 'Préparation', 'Expédition'],
  },
  {
    id: 'CMD-1036',
    date: '04 Jan 2026',
    status: 'Livrée',
    total: '12.98€',
    items: [
      { name: 'Bananes Cavendish', qty: '1.2 kg' },
      { name: 'Fraises Gariguette', qty: '0.4 kg' },
    ],
    timeline: ['Commande reçue', 'Préparation', 'Expédition', 'Livrée'],
  },
  {
    id: 'CMD-1029',
    date: '29 Dec 2025',
    status: 'Annulée',
    total: '9.50€',
    items: [{ name: 'Concombres Bio', qty: '1.0 kg' }],
    timeline: ['Commande reçue', 'Annulée'],
  },
];

const statusStyles = {
  'En cours': { bg: colors.warning + '20', text: colors.warning },
  'Livrée': { bg: colors.success + '20', text: colors.success },
  'Annulée': { bg: colors.danger + '20', text: colors.danger },
};

export default function OrdersScreen() {
  const router = useRouter();
  const { getCartCount } = useCart();

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Commandes"
        showMenu={false}
        showCart={true}
        cartCount={getCartCount()}
        onCartPress={() => router.push('/cart')}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.cartCard}>
          <View>
            <Text style={styles.cartTitle}>Panier en cours</Text>
            <Text style={styles.cartSubtitle}>Vérifiez vos articles avant paiement</Text>
          </View>
          <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/cart')}>
            <Text style={styles.cartButtonText}>Voir le panier</Text>
            <Feather name="chevron-right" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {orders.map((order) => {
          const statusStyle = statusStyles[order.status] || {
            bg: colors.secondary,
            text: colors.dark,
          };

          return (
            <View key={order.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.orderId}>{order.id}</Text>
                  <Text style={styles.orderDate}>{order.date}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
                  <Text style={[styles.statusText, { color: statusStyle.text }]}>
                    {order.status}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.items}>
                {order.items.map((item, idx) => (
                  <View key={`${order.id}-${idx}`} style={styles.itemRow}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemQty}>{item.qty}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{order.total}</Text>
              </View>

              <View style={styles.timeline}>
                {order.timeline.map((step, idx) => (
                  <View key={`${order.id}-step-${idx}`} style={styles.timelineRow}>
                    <MaterialCommunityIcons
                      name="checkbox-marked-circle"
                      size={18}
                      color={idx === order.timeline.length - 1 ? statusStyle.text : colors.primary}
                      style={styles.timelineIcon}
                    />
                    <Text style={styles.timelineText}>{step}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
      <BottomTabBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  cartCard: {
    backgroundColor: colors.secondary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  cartTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.dark,
  },
  cartSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.grey,
    marginTop: 4,
  },
  cartButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  cartButtonText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.primary,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderId: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.dark,
  },
  orderDate: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.grey,
    marginTop: 4,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: colors.light,
    marginVertical: 12,
  },
  items: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemName: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.dark,
    flex: 1,
    marginRight: 8,
  },
  itemQty: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.grey,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  totalLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.grey,
  },
  totalValue: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.primary,
  },
  timeline: {
    marginTop: 14,
    gap: 6,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineIcon: {
    marginRight: 8,
  },
  timelineText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.dark,
  },
});
