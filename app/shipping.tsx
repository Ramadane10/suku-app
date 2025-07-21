import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../src/components/ui/BottomTabBar';
import Header from '../src/components/ui/Header';
import colors from '../src/constants/colors';
import fonts from '../src/constants/fonts';
import { useOrder } from '../src/context/OrderContext';

export const options = { headerShown: false };

const ShippingScreen = () => {
  const { shipping, saveShipping } = useOrder();
  const [address, setAddress] = useState(shipping.address);
  const [city, setCity] = useState(shipping.city);
  const [postalCode, setPostalCode] = useState(shipping.postalCode);
  const [country, setCountry] = useState(shipping.country);
  const router = useRouter();

  const handleContinue = () => {
    if (!address || !city || !postalCode || !country) {
      Alert.alert('Erreur', 'Merci de remplir tous les champs de livraison.');
      return;
    }
    saveShipping({ address, city, postalCode, country });
    router.push('/payment');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* <Header title="Adresse de livraison" /> */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Adresse de livraison</Text>
        <View style={styles.formGroup}>
          <TextInput
            style={styles.input}
            placeholder="Adresse complète"
            value={address}
            onChangeText={setAddress}
          />
          <TextInput
            style={styles.input}
            placeholder="Ville"
            value={city}
            onChangeText={setCity}
          />
          <TextInput
            style={styles.input}
            placeholder="Code postal"
            value={postalCode}
            onChangeText={setPostalCode}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Pays"
            value={country}
            onChangeText={setCountry}
          />
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
  formGroup: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  input: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.dark,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
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

export default ShippingScreen; 