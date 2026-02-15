import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import InputField from '../src/components/ui/InputField';
import fonts from '../src/constants/fonts';
import { useOrder } from '../src/context/OrderContext';
import { AntDesign, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/hooks/useTheme';
import { useAddresses } from '../src/hooks/useAddresses';
import { useAuth } from '../src/context/AuthContext';

export const options = { headerShown: false };

const ShippingScreen = () => {
  const { shipping, saveShipping } = useOrder();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { addresses, loading: addressesLoading, getDefaultAddress, createAddress } = useAddresses();
  const [fullName, setFullName] = useState('Thierno Souleymane');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const router = useRouter();

  // Charger l'adresse par défaut si disponible
  useEffect(() => {
    if (user && addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = getDefaultAddress();
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        setFullName(user.user_metadata?.full_name || '');
        setPhone(user.user_metadata?.phone || '');
        setAddress(defaultAddr.address_line);
        setCity(defaultAddr.city);
        setPostalCode(defaultAddr.postal_code);
      }
    }
  }, [addresses, user, getDefaultAddress, selectedAddressId]);

  const handleSelectAddress = (addr: any) => {
    setSelectedAddressId(addr.id);
    setAddress(addr.address_line);
    setCity(addr.city);
    setPostalCode(addr.postal_code);
    setShowNewAddressForm(false);
  };

  const handleContinue = async () => {
    if (!fullName || !phone || !address || !city) {
      Alert.alert('Erreur', 'Merci de remplir tous les champs de livraison.');
      return;
    }

    try {
      // Si une adresse existante est sélectionnée, l'utiliser SANS en créer une nouvelle
      if (selectedAddressId && !showNewAddressForm) {
        const selectedAddr = addresses.find(a => a.id === selectedAddressId);
        if (selectedAddr) {
          console.log('Utilisation de l\'adresse existante:', selectedAddr.id);
          saveShipping({
            address: selectedAddr.address_line,
            city: selectedAddr.city,
            postalCode: selectedAddr.postal_code,
            country: selectedAddr.country,
            fullName,
            phone,
          });
          router.push('/payment');
          return; // IMPORTANT: Sortir ici pour ne pas créer de nouvelle adresse
        }
      }

      // Sinon, vérifier si l'adresse existe déjà avant de la créer (seulement si c'est une nouvelle adresse)
      if (user && (showNewAddressForm || addresses.length === 0)) {
        // Vérifier si une adresse identique existe déjà
        const existingAddress = addresses.find(addr => 
          addr.address_line.toLowerCase().trim() === address.toLowerCase().trim() &&
          addr.city.toLowerCase().trim() === city.toLowerCase().trim() &&
          addr.postal_code === (postalCode || '00000')
        );

        if (!existingAddress) {
          console.log('Création d\'une nouvelle adresse');
          // Créer une nouvelle adresse seulement si elle n'existe pas
          await createAddress({
            address_line: address,
            city: city,
            postal_code: postalCode || '00000',
            country: 'Guinée',
            is_default: addresses.length === 0, // Première adresse = défaut
          });
        } else {
          console.log('Adresse identique trouvée, pas de création');
        }
        // Si l'adresse existe déjà, on ne fait rien, on utilise juste les données pour shipping
      } else if (user && !showNewAddressForm && selectedAddressId) {
        console.log('Adresse existante sélectionnée, pas de création');
      }

      saveShipping({
        address,
        city,
        postalCode: postalCode || '00000',
        country: 'Guinée',
        fullName,
        phone,
      });
      router.push('/payment');
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de sauvegarder l\'adresse.');
    }
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

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 }]}>
        {user && addresses.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Adresses sauvegardées</Text>
            <View style={styles.addressesList}>
              {addresses.map((addr) => (
                <TouchableOpacity
                  key={addr.id}
                  style={[
                    styles.addressCard,
                    { 
                      backgroundColor: selectedAddressId === addr.id ? colors.primary + '20' : colors.surface,
                      borderColor: selectedAddressId === addr.id ? colors.primary : colors.border,
                    }
                  ]}
                  onPress={() => handleSelectAddress(addr)}
                >
                  <View style={styles.addressHeader}>
                    <Ionicons 
                      name={selectedAddressId === addr.id ? "radio-button-on" : "radio-button-off"} 
                      size={20} 
                      color={selectedAddressId === addr.id ? colors.primary : colors.grey} 
                    />
                    {addr.is_default && (
                      <View style={[styles.defaultBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.defaultBadgeText}>Par défaut</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.addressText, { color: colors.text }]}>{addr.address_line}</Text>
                  <Text style={[styles.addressText, { color: colors.textSecondary }]}>
                    {addr.postal_code} {addr.city}, {addr.country}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.newAddressBtn, { borderColor: colors.primary }]}
              onPress={() => {
                setShowNewAddressForm(!showNewAddressForm);
                setSelectedAddressId(null);
              }}
            >
              <Ionicons name={showNewAddressForm ? "close" : "add"} size={20} color={colors.primary} />
              <Text style={[styles.newAddressText, { color: colors.primary }]}>
                {showNewAddressForm ? 'Annuler' : 'Nouvelle adresse'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {(showNewAddressForm || !user || addresses.length === 0) && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {user && addresses.length > 0 ? 'Nouvelle adresse' : 'Informations de livraison'}
            </Text>

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

          <InputField
            placeholder="Code postal (optionnel)"
            value={postalCode}
            onChangeText={setPostalCode}
            keyboardType="numeric"
            leftIcon={<Ionicons name="mail-outline" size={20} color={colors.grey} />}
          />
        </View>
          </>
        )}

        <TouchableOpacity style={[styles.continueBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={handleContinue}>
          <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.btnIcon} />
          <Text style={styles.continueBtnText}>Continuer</Text>
        </TouchableOpacity>
      </ScrollView>
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
  addressesList: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  addressCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  defaultBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: '#fff',
  },
  addressText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    marginBottom: 4,
  },
  newAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  newAddressText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    marginLeft: 8,
  },
});

export default ShippingScreen;