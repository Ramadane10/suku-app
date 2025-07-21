import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../src/components/ui/BottomTabBar';
import colors from '../src/constants/colors';
import fonts from '../src/constants/fonts';

export const options = { headerShown: false };

const ProfileSettings = () => {
  const router = useRouter();
  const [faceId, setFaceId] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(false);
  const [newArrivals, setNewArrivals] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [salesAlerts, setSalesAlerts] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.dark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Paramètres</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.sectionLabel}>SÉCURITÉ</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.rowText}>Activer Face ID / Touch ID</Text>
          <Switch value={faceId} onValueChange={setFaceId} />
        </View>

        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
        <View style={styles.rowBetween}>
          <Text style={styles.rowText}>Mises à jour commandes</Text>
          <Switch value={orderUpdates} onValueChange={setOrderUpdates} />
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.rowText}>Nouveautés</Text>
          <Switch value={newArrivals} onValueChange={setNewArrivals} />
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.rowText}>Promotions</Text>
          <Switch value={promotions} onValueChange={setPromotions} />
        </View>
        <View style={styles.rowBetween}>
          <Text style={styles.rowText}>Alertes soldes</Text>
          <Switch value={salesAlerts} onValueChange={setSalesAlerts} />
        </View>

        <Text style={styles.sectionLabel}>COMPTE</Text>
        <TouchableOpacity style={styles.supportBtn}>
          <Text style={styles.supportText}>Support</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomTabBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 12,
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.dark,
  },
  sectionLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.grey,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
    backgroundColor: '#fff',
  },
  rowText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.dark,
  },
  supportBtn: {
    marginHorizontal: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  supportText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.primary,
  },
  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.dark,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logoutText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.dark,
  },
});

export default ProfileSettings; 