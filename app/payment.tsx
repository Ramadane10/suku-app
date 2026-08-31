import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../src/constants/colors';
import fonts from '../src/constants/fonts';
import { useCustomAlert } from '../src/context/AlertContext';
import { useOrder } from '../src/context/OrderContext';
import { useTheme } from '../src/hooks/useTheme';

export const options = { headerShown: false };

const paymentMethods = [
  {
    key: 'orange',
    label: 'Orange Money',
    subtitle: 'Paiement mobile rapide via votre compte Orange',
    iconName: 'cellphone-text' as const,
    iconColor: '#FF6600',
    iconBg: '#FFF3EB',
  },
  {
    key: 'mobile',
    label: 'Mobile Money',
    subtitle: 'MTN Mobile Money, Moov Money ou Wave',
    iconName: 'wallet-outline' as const,
    iconColor: '#00875A',
    iconBg: '#E6F4EA',
  },
  {
    key: 'cash',
    label: 'Payer à la livraison',
    subtitle: 'Règlement en espèces ou Mobile Money à la réception',
    iconName: 'hand-coin-outline' as const,
    iconColor: colors.primary,
    iconBg: '#E8F5E9',
  },
];

const PaymentScreen = () => {
  const { payment, savePayment } = useOrder();
  const { colors: themeColors } = useTheme();
  const { showError } = useCustomAlert();
  const [selected, setSelected] = useState(payment || 'cash');
  const router = useRouter();

  const handleContinue = () => {
    if (!selected) {
      showError('Erreur', 'Merci de choisir un mode de paiement.');
      return;
    }
    savePayment(selected);
    router.push('/checkout');
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
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>Mode de paiement</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 }]} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionSubtitle, { color: themeColors.textSecondary }]}>
          Choisissez le moyen de paiement qui vous convient
        </Text>

        <View style={styles.paymentList}>
          {paymentMethods.map((method) => {
            const isSelected = selected === method.key;
            return (
              <TouchableOpacity
                key={method.key}
                style={[
                  styles.paymentCard,
                  {
                    backgroundColor: themeColors.surface,
                    borderColor: isSelected ? colors.primary : themeColors.border,
                  },
                  isSelected && styles.selectedCard,
                ]}
                onPress={() => setSelected(method.key)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconBadge, { backgroundColor: method.iconBg }]}>
                  <MaterialCommunityIcons name={method.iconName} size={26} color={method.iconColor} />
                </View>

                <View style={styles.cardTextContainer}>
                  <Text style={[styles.paymentLabel, { color: themeColors.text }]}>{method.label}</Text>
                  <Text style={[styles.paymentSubtitle, { color: themeColors.textSecondary }]}>
                    {method.subtitle}
                  </Text>
                </View>

                <View style={styles.radioContainer}>
                  <Ionicons
                    name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                    size={22}
                    color={isSelected ? colors.primary : themeColors.grey || '#9E9E9E'}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={[styles.continueBtn, { backgroundColor: colors.primary }]} onPress={handleContinue}>
          <Text style={styles.continueBtnText}>Valider et continuer</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    marginBottom: 20,
  },
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
    fontSize: 20,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentList: {
    gap: 14,
    marginBottom: 32,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  selectedCard: {
    borderWidth: 2,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  cardTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  paymentLabel: {
    fontFamily: fonts.bold,
    fontSize: 16,
    marginBottom: 2,
  },
  paymentSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  radioContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  continueBtnText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#fff',
  },
});

export default PaymentScreen;