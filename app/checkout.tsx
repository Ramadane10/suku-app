import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../src/constants/colors';
import fonts from '../src/constants/fonts';
import { useCustomAlert } from '../src/context/AlertContext';
import { useCart } from '../src/context/CartContext';
import { useOrder } from '../src/context/OrderContext';
import { useNotifications } from '../src/hooks/useNotifications';
import { useOrders } from '../src/hooks/useOrders';
import { useTheme } from '../src/hooks/useTheme';
import { useUserSettings } from '../src/hooks/useUserSettings';
import { formatPrice } from '../src/utils/formatters';

export const options = { headerShown: false };

const paymentMethods = [
  { key: 'orange', label: 'Orange Money', icon: <MaterialCommunityIcons name="cellphone-text" size={22} color="#FF6600" /> },
  { key: 'mobile', label: 'Mobile Money', icon: <MaterialCommunityIcons name="wallet-outline" size={22} color="#00875A" /> },
  { key: 'cash', label: 'Payer à la livraison', icon: <MaterialCommunityIcons name="hand-coin-outline" size={22} color={colors.primary} /> },
];

const CheckoutScreen = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { shipping, payment, directPurchase, clearOrder, clearDirectPurchase } = useOrder();
  const { createOrder } = useOrders();
  const { showConfirm, showSuccess, showError } = useCustomAlert();
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const { colors: themeColors } = useTheme();
  const { sendLocalNotification, createNotification } = useNotifications();
  const { settings: userSettings } = useUserSettings();
  const insets = useSafeAreaInsets();

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
      showError('Erreur', 'Informations incomplètes. Veuillez vérifier votre adresse de livraison et votre mode de paiement.');
      return;
    }

    if (itemsToOrder.length === 0) {
      showError('Erreur', isDirectPurchase ? 'Aucun produit à commander pour l\'achat direct.' : 'Votre panier est vide.');
      return;
    }

    setProcessing(true);

    try {
      // S'assurer que les items ont le bon format pour createOrder
      const formattedItems = itemsToOrder.map((item: any) => ({
        productId: item.productId || item.id,
        name: item.name,
        pricePerKilo: item.pricePerKilo || item.unit_price || 0,
        quantity: item.quantity || item.quantity_kg || 0,
        totalPrice: item.totalPrice || item.total_price || '0',
      }));

      // Créer la commande dans Supabase
      const createdOrder = await createOrder({
        cartItems: formattedItems,
        shippingAddress: {
          id: shipping.id,
          address_line: shipping.address,
          city: shipping.city,
          postal_code: shipping.postalCode || '00000',
          country: shipping.country,
        },
        paymentMethod: payment,
        totalAmount: calculateTotal(),
      });

      const shortId = createdOrder?.id ? `CMD-${createdOrder.id.slice(0, 8).toUpperCase()}` : '';
      const orderRef = shortId ? ` (#${shortId})` : '';
      const itemsCount = formattedItems.length;
      const formattedTotal = formatPrice(calculateTotal());

      const orderTitle = payment === 'cash'
        ? `Commande enregistrée !`
        : `Commande confirmée !`;

      const orderMessage = payment === 'cash'
        ? `Votre commande de ${itemsCount} article(s) d'une valeur de ${formattedTotal} a bien été prise en compte. Le règlement s'effectuera à la livraison.`
        : `Votre commande de ${itemsCount} article(s) d'une valeur de ${formattedTotal} a été enregistrée avec succès. Merci pour votre confiance !`;

      // Notif push locale : respecte le réglage de l'utilisateur
      if (userSettings?.order_updates !== false) {
        await sendLocalNotification(orderTitle, orderMessage, { orderId: createdOrder?.id });
      }
      // Toujours sauvegarder dans l'historique des notifications
      await createNotification(orderTitle, orderMessage, 'order', { orderId: createdOrder?.id });

      const handleOnConfirm = async () => {
        if (!isDirectPurchase) await clearCart();
        clearDirectPurchase();
        clearOrder();
        router.push('/orders');
      };

      const handleOnHome = async () => {
        if (!isDirectPurchase) await clearCart();
        clearDirectPurchase();
        clearOrder();
        router.replace('/home');
      };

      if (payment === 'cash') {
        // Paiement à la livraison : pas de simulation, juste un message informatif
        showConfirm(
          'Commande enregistrée',
          `Votre commande de ${formatPrice(calculateTotal())} a bien été passée.\n\nVous paierez à la livraison en espèces ou Mobile Money.\n\nNous vous contacterons pour confirmer la livraison.`,
          handleOnConfirm,
          'Voir mes commandes',
          'Accueil',
          handleOnHome
        );
      } else {
        // Orange Money / Mobile Money : confirmation simple (sans traitement réel)
        showConfirm(
          'Commande enregistrée',
          `Votre commande via ${paymentMethods.find(m => m.key === payment)?.label} a été enregistrée.\n\n`,
          handleOnConfirm,
          'Voir mes commandes',
          'Accueil',
          handleOnHome
        );
      }
    } catch (error: any) {
      console.error('Error processing payment:', error);
      showError(
        'Erreur',
        error.message || 'Une erreur est survenue lors du traitement de votre commande. Veuillez réessayer.'
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.iconButton, { backgroundColor: themeColors.light }]}
          activeOpacity={0.3}
          delayPressIn={0}
        >
          <Ionicons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>Finalisation de la commande</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}>
        {/* Section Adresse de livraison */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Adresse de livraison</Text>
          <TouchableOpacity onPress={() => router.push('/shipping')}>
            <Text style={[styles.editLink, { color: themeColors.primary }]}>Modifier</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.infoBox, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={20} color={themeColors.primary} style={styles.infoIcon} />
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoTextBold, { color: themeColors.text }]}>
                {shipping.address || 'Aucune adresse renseignée'}
              </Text>
              <Text style={[styles.infoTextSub, { color: themeColors.textSecondary }]}>
                {shipping.city}{shipping.city && shipping.country ? ', ' : ''}{shipping.country}
              </Text>
            </View>
          </View>
        </View>

        {/* Section Mode de paiement */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Mode de paiement</Text>
          <TouchableOpacity onPress={() => router.push('/payment')}>
            <Text style={[styles.editLink, { color: themeColors.primary }]}>Modifier</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.infoBox, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              {paymentMethods.find(m => m.key === payment)?.icon || <Ionicons name="card-outline" size={20} color={themeColors.primary} />}
            </View>
            <Text style={[styles.infoTextBold, { color: themeColors.text }]}>
              {paymentMethods.find(m => m.key === payment)?.label || 'Sélectionner un moyen de paiement'}
            </Text>
          </View>
        </View>

        {/* Section Résumé de la commande */}
        <Text style={[styles.sectionTitle, { color: themeColors.text, marginHorizontal: 16 }]}>Résumé de la commande</Text>
        <View style={[styles.infoBox, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}>
          {itemsToOrder.length > 0 ? (
            itemsToOrder.map((item: any, index: number) => (
              <View key={index} style={[styles.orderItemRow, { borderBottomColor: themeColors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.orderItemName, { color: themeColors.text }]}>{item.name || 'Produit'}</Text>
                  <Text style={[styles.orderItemDetails, { color: themeColors.textSecondary }]}>
                    {(item.quantity || item.quantity_kg || 0)} kg × {formatPrice(item.pricePerKilo || item.unit_price || 0, true)}
                  </Text>
                </View>
                <Text style={[styles.orderItemPrice, { color: themeColors.primary }]}>
                  {formatPrice(item.totalPrice || item.total_price || 0)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.orderItemName, { color: themeColors.textSecondary }]}>
              {isDirectPurchase ? 'Aucun produit sélectionné pour l\'achat direct' : 'Aucun article dans le panier'}
            </Text>
          )}

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: themeColors.textSecondary }]}>Sous-total</Text>
            <Text style={[styles.summaryValue, { color: themeColors.text }]}>{formatPrice(calculateTotal())}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: themeColors.textSecondary }]}>Livraison</Text>
            <Text style={[styles.summaryValue, { color: themeColors.success || '#4CAF50' }]}>Offerte</Text>
          </View>
          <View style={[styles.summaryRowTotal, { borderTopColor: themeColors.border }]}>
            <Text style={[styles.totalLabel, { color: themeColors.text }]}>Total à payer</Text>
            <Text style={[styles.totalValue, { color: themeColors.primary }]}>{formatPrice(calculateTotal())}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.orderBtn, { backgroundColor: themeColors.primary }, processing && styles.orderBtnDisabled]}
          onPress={handlePay}
          disabled={processing}
          activeOpacity={0.8}
        >
          {processing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.orderBtnText}>Traitement en cours...</Text>
            </View>
          ) : (
            <Text style={styles.orderBtnText}>Payer {formatPrice(calculateTotal())}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  editLink: {
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  infoBox: {
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTextBold: {
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  infoTextSub: {
    fontFamily: fonts.regular,
    fontSize: 13,
    marginTop: 2,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  orderItemName: {
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  orderItemDetails: {
    fontFamily: fonts.regular,
    fontSize: 13,
    marginTop: 2,
  },
  orderItemPrice: {
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  summaryLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  summaryValue: {
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  totalValue: {
    fontFamily: fonts.bold,
    fontSize: 20,
  },
  orderBtn: {
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
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
});

export default CheckoutScreen;