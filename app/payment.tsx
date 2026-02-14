import { AntDesign, Feather, Ionicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../src/components/ui/BottomTabBar';
import colors from '../src/constants/colors';
import fonts from '../src/constants/fonts';
import { useOrder } from '../src/context/OrderContext';

export const options = { headerShown: false };

const paymentMethods = [
  {
    key: 'orange',
    label: 'Orange Money',
    icon: <MaterialCommunityIcons name="cellphone" size={24} color={colors.primary} />
  },
  {
    key: 'mobile',
    label: 'Mobile Money',
    icon: <MaterialCommunityIcons name="cellphone" size={24} color={colors.success} />
  },
  {
    key: 'card',
    label: 'Carte bancaire',
    icon: <FontAwesome name="credit-card" size={22} color={colors.dark} />
  },
  {
    key: 'visa',
    label: 'Carte Visa',
    icon: <FontAwesome name="cc-visa" size={24} color={colors.info} />
  },
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

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 }]}>
        <Text style={styles.sectionTitle}>Mode de paiement</Text>

        <View style={styles.paymentGrid}>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.key}
              style={[
                styles.paymentCard,
                selected === method.key && styles.paymentCardSelected
              ]}
              onPress={() => setSelected(method.key)}
              activeOpacity={0.3}
              delayPressIn={0}
            >
              <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  {method.icon}
                </View>
                <Text style={styles.paymentLabel}>{method.label}</Text>
                {selected === method.key && (
                  <View style={styles.checkIcon}>
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  </View>
                )}
              </View>
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
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scrollContent: {
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.dark,
    marginTop: 24,
    marginBottom: 16,
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
  paymentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  paymentCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.light,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.secondary,
  },
  cardContent: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 12,
  },
  paymentLabel: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.dark,
    textAlign: 'center',
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  continueBtn: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  continueBtnText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#fff',
  },
});

export default PaymentScreen;