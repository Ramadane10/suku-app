import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../src/components/ui/BottomTabBar';
import InputField from '../src/components/ui/InputField';
import fonts from '../src/constants/fonts';
import { useOrder } from '../src/context/OrderContext';
import { AntDesign, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/hooks/useTheme';

export const options = { headerShown: false };

const ShippingScreen = () => {
  const { shipping, saveShipping } = useOrder();
  const { colors } = useTheme();
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.iconButton, { backgroundColor: colors.light }]}
          activeOpacity={0.3}
          delayPressIn={0}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Adresse de livraison</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Informations de livraison</Text>

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

        <TouchableOpacity style={[styles.continueBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={handleContinue}>
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
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 20,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
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
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
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