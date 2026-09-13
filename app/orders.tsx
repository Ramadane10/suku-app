import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../src/components/ui/Header';
import SideMenu from '../src/components/ui/SideMenu';
import fonts from '../src/constants/fonts';
import { useAuth } from '../src/context/AuthContext';
import { useCart } from '../src/context/CartContext';
import { Order, useOrders } from '../src/hooks/useOrders';
import { useNotifications } from '../src/hooks/useNotifications';
import { useTheme } from '../src/hooks/useTheme';
import { formatPrice } from '../src/utils/formatters';

export const options = { headerShown: false };

// Formater la date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
};

// Timeline selon le statut
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
  if ((paymentStatus === 'paid' || paymentStatus === 'cash_on_delivery') && status === 'pending') {
    return ['Commande reçue', 'Préparation'];
  }
  return ['Commande reçue'];
};

// Traduire le statut
const translateStatus = (status: string, paymentMethod?: string, paymentStatus?: string) => {
  if ((paymentMethod === 'cash' || paymentStatus === 'cash_on_delivery') && (status === 'pending' || status === 'paid')) {
    return 'En cours';
  }
  const statusMap: { [key: string]: string } = {
    'pending': 'En cours',
    'paid': 'Payée',
    'shipped': 'Expédiée',
    'delivered': 'Livrée',
    'cancelled': 'Annulée',
  };
  return statusMap[status] || status;
};

// Traduire le mode de paiement
const translatePayment = (method: string) => {
  const map: { [key: string]: string } = {
    'orange': 'Orange Money',
    'mobile': 'Mobile Money',
    'cash': 'Paiement à la livraison',
  };
  return map[method] || method;
};

export default function OrdersScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const { user } = useAuth();
  const { getCartCount } = useCart();
  const { unreadCount } = useNotifications();
  const { colors } = useTheme();
  const { orders, loading, loadingMore, hasMore, loadMore, refresh } = useOrders();
  const [isMenuVisible, setIsMenuVisible] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);

  // Ouvrir automatiquement la commande si un orderId est fourni (depuis une notification)
  useEffect(() => {
    if (orderId && orders && orders.length > 0) {
      let target: Order | undefined;
      if (orderId === 'latest') {
        target = orders[0];
      } else {
        target = orders.find(
          (o) => o.id === orderId || o.id.toLowerCase().startsWith(orderId.toLowerCase())
        );
        if (!target) target = orders[0];
      }
      if (target) {
        setSelectedOrder(target);
      }
    }
  }, [orderId, orders]);

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header
          title="Commandes"
          showBack={true}
          showMenu={false}
          onBackPress={() => router.back()}
          cartCount={getCartCount()}
          onCartPress={() => router.push('/cart')}
        />
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={80} color={colors.grey} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Connexion requise</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Connectez-vous pour consulter l'historique de vos commandes.
          </Text>
          <TouchableOpacity
            style={[styles.guestBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/login')}
          >
            <Ionicons name="log-in-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.guestBtnText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
        <SideMenu isVisible={isMenuVisible} onClose={() => setIsMenuVisible(false)} />
      </SafeAreaView>
    );
  }

  const statusStyles: { [key: string]: { bg: string; text: string } } = {
    'En cours': { bg: colors.warning + '20', text: colors.warning },
    'Payée': { bg: colors.primary + '20', text: colors.primary },
    'Expédiée': { bg: colors.info + '20', text: colors.info },
    'Livrée': { bg: colors.success + '20', text: colors.success },
    'Annulée': { bg: colors.danger + '20', text: colors.danger },
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    if (orderId) {
      router.setParams({ orderId: undefined });
    }
  };

  // Quand on vient d'une notification et que les commandes chargent encore
  if (orderId && loading && orders.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header
          title="Commandes"
          showMenu={true}
          onMenuPress={() => setIsMenuVisible(true)}
          showNotifications={true}
          notificationCount={unreadCount}
          onNotificationPress={() => router.push("/notifications")}
        />
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Chargement des commandes...</Text>
        </View>
        <SideMenu isVisible={isMenuVisible} onClose={() => setIsMenuVisible(false)} />
      </SafeAreaView>
    );
  }

  if (loading && orders.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header
          title="Commandes"
          showMenu={true}
          onMenuPress={() => setIsMenuVisible(true)}
          showNotifications={true}
          notificationCount={unreadCount}
          onNotificationPress={() => router.push("/notifications")}
        />
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Chargement des commandes...</Text>
        </View>
        <SideMenu isVisible={isMenuVisible} onClose={() => setIsMenuVisible(false)} />
      </SafeAreaView>
    );
  }

  const renderOrderDetail = () => {
    if (!selectedOrder) return null;
    const translatedStatus = translateStatus(selectedOrder.status, selectedOrder.payment?.method, selectedOrder.payment_status);
    const statusStyle = statusStyles[translatedStatus] || { bg: colors.secondary, text: colors.text };
    const timeline = getTimeline(selectedOrder.status, selectedOrder.payment_status);

    // Si on vient d'une notification, pas d'animation pour éviter tout flash
    const fromNotification = !!orderId;

    return (
      <Modal
        visible={!!selectedOrder}
        animationType={fromNotification ? 'none' : 'slide'}
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {/* Header de la modal */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
            <TouchableOpacity onPress={handleCloseModal} style={styles.modalCloseBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              CMD-{selectedOrder.id.slice(0, 8).toUpperCase()}
            </Text>
            <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>{translatedStatus}</Text>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            {/* Date */}
            <View style={[styles.detailSection, { backgroundColor: colors.surface }]}>
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Date de commande</Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {formatDateTime(selectedOrder.created_at)}
              </Text>
            </View>

            {/* Articles */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Articles commandés</Text>
            <View style={[styles.detailSection, { backgroundColor: colors.surface }]}>
              {selectedOrder.items.map((item, idx) => (
                <View
                  key={`${selectedOrder.id}-detail-${idx}`}
                  style={[
                    styles.itemRow,
                    idx < selectedOrder.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 12, marginBottom: 12 }
                  ]}
                >
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: colors.text }]}>{item.product_name}</Text>
                    <Text style={[styles.itemQtySub, { color: colors.textSecondary }]}>
                      {item.quantity_kg} kg × {formatPrice(item.unit_price, true)}
                    </Text>
                  </View>
                  <Text style={[styles.itemTotal, { color: colors.primary }]}>
                    {formatPrice(item.total_price)}
                  </Text>
                </View>
              ))}

              {/* Total */}
              <View style={[styles.totalRow, { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 8, paddingTop: 12 }]}>
                <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
                  {selectedOrder.payment?.method === 'cash' ? 'Total à payer à la livraison' : 'Total payé'}
                </Text>
                <Text style={[styles.totalValue, { color: colors.primary }]}>
                  {formatPrice(selectedOrder.total_amount)}
                </Text>
              </View>
            </View>

            {/* Adresse de livraison */}
            {selectedOrder.shipping_address && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Adresse de livraison</Text>
                <View style={[styles.detailSection, { backgroundColor: colors.surface }]}>
                  <View style={styles.detailRow}>
                    <Ionicons name="location-outline" size={18} color={colors.primary} />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={[styles.detailValue, { color: colors.text }]}>
                        {selectedOrder.shipping_address.address_line}
                      </Text>
                      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                        {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.country}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* Mode de paiement */}
            {selectedOrder.payment && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Paiement</Text>
                <View style={[styles.detailSection, { backgroundColor: colors.surface }]}>
                  <View style={styles.detailRow}>
                    <Ionicons name="card-outline" size={18} color={colors.primary} />
                    <View style={{ marginLeft: 8, flex: 1 }}>
                      <Text style={[styles.detailValue, { color: colors.text }]}>
                        {translatePayment(selectedOrder.payment.method)}
                      </Text>
                      {selectedOrder.payment.method === 'cash' && (
                        <Text style={[styles.detailLabel, { color: colors.warning || '#E67E22', marginTop: 2 }]}>
                          Paiement en espèces ou Mobile Money lors de la réception
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* Suivi / Timeline */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Suivi de commande</Text>
            <View style={[styles.detailSection, { backgroundColor: colors.surface }]}>
              {timeline.map((step, idx) => (
                <View key={`detail-step-${idx}`} style={styles.timelineRow}>
                  <View style={styles.timelineIndicator}>
                    <MaterialCommunityIcons
                      name="checkbox-marked-circle"
                      size={20}
                      color={idx === timeline.length - 1 ? statusStyle.text : colors.primary}
                    />
                    {idx < timeline.length - 1 && (
                      <View style={[styles.timelineLine, { backgroundColor: colors.primary + '40' }]} />
                    )}
                  </View>
                  <Text style={[styles.timelineText, { color: colors.text, fontFamily: idx === timeline.length - 1 ? fonts.bold : fonts.regular }]}>
                    {step}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Commandes"
        showMenu={true}
        onMenuPress={() => setIsMenuVisible(true)}
        showNotifications={true}
        notificationCount={unreadCount}
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
          <>
            {orders.map((order) => {
              const translatedStatus = translateStatus(order.status, order.payment?.method, order.payment_status);
              const statusStyle = statusStyles[translatedStatus] || {
                bg: colors.secondary,
                text: colors.dark,
              };
              const timeline = getTimeline(order.status, order.payment_status);

              return (
                <TouchableOpacity
                  key={order.id}
                  style={[styles.card, { backgroundColor: colors.surface }]}
                  onPress={() => setSelectedOrder(order)}
                  activeOpacity={0.75}
                >
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={[styles.orderId, { color: colors.text }]}>CMD-{order.id.slice(0, 8).toUpperCase()}</Text>
                      <Text style={[styles.orderDate, { color: colors.textSecondary }]}>
                        {formatDate(order.created_at)}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
                        <Text style={[styles.statusText, { color: statusStyle.text }]}>
                          {translatedStatus}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
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
                    <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
                      {order.payment?.method === 'cash' ? 'À payer à la livraison' : 'Total'}
                    </Text>
                    <Text style={[styles.totalValue, { color: colors.primary }]}>
                      {formatPrice(order.total_amount)}
                    </Text>
                  </View>

                  <View style={styles.timeline}>
                    {timeline.map((step, idx) => (
                      <View key={`${order.id}-step-${idx}`} style={styles.timelineRow}>
                        <MaterialCommunityIcons
                          name="checkbox-marked-circle"
                          size={18}
                          color={idx === timeline.length - 1 ? statusStyle.text : colors.primary}
                          style={styles.timelineIconSmall}
                        />
                        <Text style={[styles.timelineText, { color: colors.text }]}>{step}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={[styles.viewDetailHint, { borderTopColor: colors.border }]}>
                    <Text style={[styles.viewDetailText, { color: colors.primary }]}>Voir les détails</Text>
                    <Ionicons name="arrow-forward" size={14} color={colors.primary} />
                  </View>
                </TouchableOpacity>
              );
            })}

            {hasMore && (
              <TouchableOpacity
                style={[styles.loadMoreButton, { borderColor: colors.primary, backgroundColor: colors.surface }]}
                onPress={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Text style={[styles.loadMoreText, { color: colors.primary }]}>
                    Charger plus de commandes
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>

      {renderOrderDetail()}

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
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginRight: 8,
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
  itemQtySub: {
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 2,
  },
  itemTotal: {
    fontFamily: fonts.bold,
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
    alignItems: 'flex-start',
  },
  timelineIndicator: {
    alignItems: 'center',
    marginRight: 8,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 16,
    marginTop: 2,
    alignSelf: 'center',
  },
  timelineIconSmall: {
    marginRight: 8,
  },
  timelineText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    paddingTop: 1,
  },
  viewDetailHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  viewDetailText: {
    fontFamily: fonts.bold,
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
    fontSize: 15,
    color: '#FFFFFF',
  },
  loadMoreButton: {
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreText: {
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  modalCloseBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
  },
  modalContent: {
    padding: 16,
    paddingBottom: 60,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    marginTop: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailSection: {
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontFamily: fonts.regular,
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  detailValue: {
    fontFamily: fonts.medium,
    fontSize: 15,
    marginTop: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    width: '100%',
    maxWidth: 280,
  },
  guestBtnText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
