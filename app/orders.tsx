import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../src/components/ui/Header';
import SideMenu from '../src/components/ui/SideMenu';
import fonts from '../src/constants/fonts';
import { useCart } from '../src/context/CartContext';
import { useOrders } from '../src/hooks/useOrders';
import { useTheme } from '../src/hooks/useTheme';

export const options = { headerShown: false };

// Fonction pour formater la date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

// Fonction pour obtenir la timeline selon le statut
const getTimeline = (status: string, paymentStatus: string) => {
  if (status === 'cancelled' || status === 'Annulée') {
    return ['Commande reçue', 'Annulée'];
  }
  if (status === 'delivered' || status === 'Livrée') {
    return ['Commande reçue', 'Préparation', 'Expédition', 'Livrée'];
  }
  if (status === 'shipped' || status === 'Expédiée') {
    return ['Commande reçue', 'Préparation', 'Expédition'];
  }
  if (paymentStatus === 'paid' && status === 'pending') {
    return ['Commande reçue', 'Préparation'];
  }
  return ['Commande reçue'];
};

// Fonction pour traduire le statut
const translateStatus = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'pending': 'En cours',
    'paid': 'Payée',
    'shipped': 'Expédiée',
    'delivered': 'Livrée',
    'cancelled': 'Annulée',
  };
  return statusMap[status] || status;
};

export default function OrdersScreen() {
  const router = useRouter();
  const { getCartCount } = useCart();
  const { colors } = useTheme();
  const { orders, loading, refresh } = useOrders();
  const [isMenuVisible, setIsMenuVisible] = React.useState(false);

  const statusStyles: { [key: string]: { bg: string; text: string } } = {
    'En cours': { bg: colors.warning + '20', text: colors.warning },
    'Payée': { bg: colors.primary + '20', text: colors.primary },
    'Expédiée': { bg: colors.info + '20', text: colors.info },
    'Livrée': { bg: colors.success + '20', text: colors.success },
    'Annulée': { bg: colors.danger + '20', text: colors.danger },
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header
          title="Commandes"
          showMenu={true}
          onMenuPress={() => setIsMenuVisible(true)}
          showNotifications={true}
          notificationCount={0}
          onNotificationPress={() => router.push("/notifications")}
        />
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Chargement des commandes...</Text>
        </View>
        <SideMenu
          isVisible={isMenuVisible}
          onClose={() => setIsMenuVisible(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Commandes"
        showMenu={true}
        onMenuPress={() => setIsMenuVisible(true)}
        showNotifications={true}
        notificationCount={0}
        onNotificationPress={() => router.push("/notifications")}
      />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 100 }]}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={[styles.cartCard, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }]}>
          <View>
            <Text style={[styles.cartTitle, { color: colors.text }]}>Panier en cours</Text>
            <Text style={[styles.cartSubtitle, { color: colors.textSecondary }]}>Vérifiez vos articles avant paiement</Text>
          </View>
          <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/cart')}>
            <Text style={[styles.cartButtonText, { color: colors.primary }]}>Voir le panier</Text>
            <Feather name="chevron-right" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="package-variant" size={60} color={colors.grey} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Aucune commande pour le moment
            </Text>
            <TouchableOpacity
              style={[styles.shopButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/home')}
            >
              <Text style={styles.shopButtonText}>Faire des achats</Text>
            </TouchableOpacity>
          </View>
        ) : (
          orders.map((order) => {
            const translatedStatus = translateStatus(order.status);
            const statusStyle = statusStyles[translatedStatus] || {
              bg: colors.secondary,
              text: colors.dark,
            };
            const timeline = getTimeline(order.status, order.payment_status);

            return (
              <View key={order.id} style={[styles.card, { backgroundColor: colors.surface }]}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={[styles.orderId, { color: colors.text }]}>CMD-{order.id.slice(0, 8).toUpperCase()}</Text>
                    <Text style={[styles.orderDate, { color: colors.textSecondary }]}>
                      {formatDate(order.created_at)}
                    </Text>
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                      {translatedStatus}
                    </Text>
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <View style={styles.items}>
                  {order.items.map((item, idx) => (
                    <View key={`${order.id}-${idx}`} style={styles.itemRow}>
                      <Text style={[styles.itemName, { color: colors.text }]}>{item.product_name}</Text>
                      <Text style={[styles.itemQty, { color: colors.textSecondary }]}>
                        {item.quantity_kg} kg
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total</Text>
                  <Text style={[styles.totalValue, { color: colors.primary }]}>
                    {order.total_amount.toFixed(2)}€
                  </Text>
                </View>

                <View style={styles.timeline}>
                  {timeline.map((step, idx) => (
                    <View key={`${order.id}-step-${idx}`} style={styles.timelineRow}>
                      <MaterialCommunityIcons
                        name="checkbox-marked-circle"
                        size={18}
                        color={idx === timeline.length - 1 ? statusStyle.text : colors.primary}
                        style={styles.timelineIcon}
                      />
                      <Text style={[styles.timelineText, { color: colors.text }]}>{step}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
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
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  cartCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  cartTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  cartSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
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
  },
  card: {
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
  },
  orderDate: {
    fontFamily: fonts.regular,
    fontSize: 13,
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
    flex: 1,
    marginRight: 8,
  },
  itemQty: {
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  totalLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  totalValue: {
    fontFamily: fonts.bold,
    fontSize: 16,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  shopButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#fff',
  },
});
