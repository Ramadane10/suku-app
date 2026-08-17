import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import fonts from '../src/constants/fonts';
import { useAuth } from '../src/context/AuthContext';
import { useAddresses } from '../src/hooks/useAddresses';
import { useTheme } from '../src/hooks/useTheme';

export default function AddressesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { addresses, loading, fetchAddresses, deleteAddress, setDefaultAddress } = useAddresses();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Refresh the list every time this screen comes into focus (e.g. navigating back from address-form)
  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [fetchAddresses])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAddresses();
    setRefreshing(false);
  }, [fetchAddresses]);

  const handleDelete = (addressId: string) => {
    Alert.alert(
      'Supprimer l\'adresse',
      'Êtes-vous sûr de vouloir supprimer cette adresse ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingId(addressId);
              await deleteAddress(addressId);
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Impossible de supprimer l\'adresse.');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await setDefaultAddress(addressId);
      Alert.alert('Succès', 'Adresse par défaut mise à jour.');
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de définir l\'adresse par défaut.');
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Mes adresses</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="location-outline" size={64} color={colors.grey} />
          <Text style={[styles.emptyText, { color: colors.text }]}>Connectez-vous pour gérer vos adresses</Text>
          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.loginBtnText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Mes adresses</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/address-form')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || loading}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Chargement...</Text>
          </View>
        ) : addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={64} color={colors.grey} />
            <Text style={[styles.emptyText, { color: colors.text }]}>Aucune adresse enregistrée</Text>
            <TouchableOpacity
              style={[styles.addAddressBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/address-form')}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addAddressBtnText}>Ajouter une adresse</Text>
            </TouchableOpacity>
          </View>
        ) : (
          addresses.map((address) => (
            <View
              key={address.id}
              style={[
                styles.addressCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: address.is_default ? colors.primary : colors.border,
                },
              ]}
            >
              <View style={styles.addressHeader}>
                <View style={styles.addressInfo}>
                  {address.is_default && (
                    <View style={[styles.defaultBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.defaultBadgeText}>Par défaut</Text>
                    </View>
                  )}
                  <Text style={[styles.addressLine, { color: colors.text }]}>{address.address_line}</Text>
                  <Text style={[styles.addressDetails, { color: colors.textSecondary }]}>
                    {address.postal_code} {address.city}, {address.country}
                  </Text>
                </View>
                <View style={styles.addressActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.info + '20' }]}
                    onPress={() => router.push({ pathname: '/address-form', params: { id: address.id } })}
                  >
                    <Ionicons name="create-outline" size={18} color={colors.info || colors.primary} />
                  </TouchableOpacity>

                  {!address.is_default && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
                      onPress={() => handleSetDefault(address.id)}
                    >
                      <Ionicons name="star" size={18} color={colors.primary} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.danger + '20' }]}
                    onPress={() => handleDelete(address.id)}
                    disabled={deletingId === address.id}
                  >
                    <Ionicons name="trash" size={18} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

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
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  loginBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginBtnText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#fff',
  },
  addAddressBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addAddressBtnText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#fff',
    marginLeft: 8,
  },
  addressCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  addressInfo: {
    flex: 1,
    marginRight: 12,
  },
  defaultBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  defaultBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 10,
    color: '#fff',
  },
  addressLine: {
    fontFamily: fonts.medium,
    fontSize: 16,
    marginBottom: 4,
  },
  addressDetails: {
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

