import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../src/components/ui/BottomTabBar';
import Header from '../src/components/ui/Header';
import colors from '../src/constants/colors';
import fonts from '../src/constants/fonts';
import { useOrder } from '../src/context/OrderContext';

export const options = { headerShown: false };

const paymentMethods = [
  { key: 'orange', label: 'Orange Money', icon: <MaterialCommunityIcons name="cellphone" size={22} color={colors.primary} /> },
  { key: 'mobile', label: 'Mobile Money', icon: <MaterialCommunityIcons name="cellphone" size={22} color={colors.success} /> },
  { key: 'card', label: 'Carte bancaire', icon: <AntDesign name="creditcard" size={22} color={colors.dark} /> },
];

const PaymentScreen = () => {
  const { payment, savePayment } = useOrder();
  const [selected, setSelected] = useState(payment || 'orange');
  const router = useRouter();

  const handleContinue = () => {
    if (!selected) {
      Alert.alert('Erreur', 'Merci de choisir un mode de paiement.');
      return;
    }
    savePayment(selected);
    router.push('/checkout');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <Header title="Paiement" /> */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Mode de paiement</Text>
        <View style={styles.paymentGroup}>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.key}
              style={[styles.paymentOption, selected === method.key && styles.paymentOptionSelected]}
              onPress={() => setSelected(method.key)}
              activeOpacity={0.8}
            >
              {method.icon}
              <Text style={styles.paymentLabel}>{method.label}</Text>
              {selected === method.key && <AntDesign name="checkcircle" size={20} color={colors.primary} style={{ marginLeft: 8 }} />}
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueBtnText}>Continuer</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomTabBar />
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
  paymentGroup: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.light,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  paymentOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.secondary,
  },
  paymentLabel: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.dark,
    marginLeft: 12,
  },
  continueBtn: {
    marginHorizontal: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
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