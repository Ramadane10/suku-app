import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../src/components/ui/BottomTabBar';
import InputField from '../src/components/ui/InputField';
import colors from '../src/constants/colors';
import fonts from '../src/constants/fonts';
import { useOrder } from '../src/context/OrderContext';
import { AntDesign, FontAwesome, Ionicons } from '@expo/vector-icons';

export const options = { headerShown: false };

const ShippingScreen = () => {
  const { shipping, saveShipping } = useOrder();
  const [fullName, setFullName] = useState('Thierno Souleymane');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const router = useRouter();

  const handleContinue = () => {
    if (!fullName || !phone || !address || !city) {
      Alert.alert('Erreur', 'Merci de remplir tous les champs de livraison.');
      return;
    }
    saveShipping({
      address,
      city,
      postalCode: '',
      country: 'Guinée'
    });
    router.push('/payment');
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
        <Text style={styles.headerTitle}>Adresse de livraison</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Informations de livraison</Text>

        <View style={styles.formGroup}>
          <InputField
            placeholder="Nom complet"
            value={fullName}
            onChangeText={setFullName}
            leftIcon={<FontAwesome name="user" size={18} color={colors.grey} />}
          />

          <InputField
            placeholder="Numéro de téléphone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            leftIcon={<FontAwesome name="phone" size={18} color={colors.grey} />}
          />

          <InputField
            placeholder="Sonfonia rail, juste avant la station shell à côté AfricoF"
            value={address}
            onChangeText={setAddress}
            leftIcon={<Ionicons name="location-outline" size={20} color={colors.grey} />}
          />

          <InputField
            placeholder="Labé, Conakry"
            value={city}
            onChangeText={setCity}
            leftIcon={<Ionicons name="map-outline" size={20} color={colors.grey} />}
          />
        </View>

        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.btnIcon} />
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
    backgroundColor: colors.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.dark,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 20,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.dark,
    marginTop: 8,
    marginBottom: 20,
    marginHorizontal: 16,
  },
  formGroup: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  continueBtn: {
    marginHorizontal: 16,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnIcon: {
    marginRight: 8,
  },
  continueBtnText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#fff',
  },
});

export default ShippingScreen;