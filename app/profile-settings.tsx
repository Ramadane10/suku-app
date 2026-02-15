import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../src/components/ui/BottomTabBar';
import fonts from '../src/constants/fonts';
import { useTheme } from '../src/hooks/useTheme';
import { useUserSettings } from '../src/hooks/useUserSettings';
import { useAuth } from '../src/context/AuthContext';

export const options = { headerShown: false };

const ProfileSettings = () => {
  const router = useRouter();
  const { colors, theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { settings, loading, updateSetting } = useUserSettings();

  const [faceId, setFaceId] = useState(false);
  const [orderUpdates, setOrderUpdates] = useState(false);
  const [newArrivals, setNewArrivals] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [salesAlerts, setSalesAlerts] = useState(true);

  // Synchroniser les états locaux avec les paramètres depuis Supabase
  useEffect(() => {
    if (settings) {
      setFaceId(settings.face_id_enabled);
      setOrderUpdates(settings.order_updates);
      setNewArrivals(settings.new_arrivals);
      setPromotions(settings.promotions);
      setSalesAlerts(settings.sales_alerts);
    }
  }, [settings]);

  const handleToggleFaceId = async (value: boolean) => {
    setFaceId(value);
    try {
      await updateSetting('face_id_enabled', value);
    } catch (error: any) {
      Alert.alert('Erreur', 'Impossible de mettre à jour ce paramètre.');
      setFaceId(!value); // Revenir à l'état précédent
    }
  };

  const handleToggleOrderUpdates = async (value: boolean) => {
    setOrderUpdates(value);
    try {
      await updateSetting('order_updates', value);
    } catch (error: any) {
      Alert.alert('Erreur', 'Impossible de mettre à jour ce paramètre.');
      setOrderUpdates(!value);
    }
  };

  const handleToggleNewArrivals = async (value: boolean) => {
    setNewArrivals(value);
    try {
      await updateSetting('new_arrivals', value);
    } catch (error: any) {
      Alert.alert('Erreur', 'Impossible de mettre à jour ce paramètre.');
      setNewArrivals(!value);
    }
  };

  const handleTogglePromotions = async (value: boolean) => {
    setPromotions(value);
    try {
      await updateSetting('promotions', value);
    } catch (error: any) {
      Alert.alert('Erreur', 'Impossible de mettre à jour ce paramètre.');
      setPromotions(!value);
    }
  };

  const handleToggleSalesAlerts = async (value: boolean) => {
    setSalesAlerts(value);
    try {
      await updateSetting('sales_alerts', value);
    } catch (error: any) {
      Alert.alert('Erreur', 'Impossible de mettre à jour ce paramètre.');
      setSalesAlerts(!value);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/login');
            } catch (error: any) {
              Alert.alert('Erreur', 'Impossible de se déconnecter.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Paramètres</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.grey }]}>APPEARANCE</Text>
        <View style={[styles.rowBetween, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={styles.themeRow}>
            <Ionicons name={theme === 'dark' ? 'moon' : 'sunny'} size={22} color={colors.primary} style={styles.menuIcon} />
            <Text style={[styles.rowText, { color: colors.text }]}>Mode sombre</Text>
          </View>
          <Switch
            value={theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.light, true: colors.primary }}
            thumbColor={theme === 'dark' ? '#fff' : colors.light}
          />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.grey }]}>SÉCURITÉ</Text>
        <View style={[styles.rowBetween, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.rowText, { color: colors.text }]}>Activer Face ID / Touch ID</Text>
          <Switch
            value={faceId}
            onValueChange={handleToggleFaceId}
            trackColor={{ false: colors.light, true: colors.primary }}
            thumbColor={faceId ? '#fff' : colors.light}
            disabled={loading}
          />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.grey }]}>NOTIFICATIONS</Text>
        <View style={[styles.rowBetween, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.rowText, { color: colors.text }]}>Mises à jour commandes</Text>
          <Switch
            value={orderUpdates}
            onValueChange={handleToggleOrderUpdates}
            trackColor={{ false: colors.light, true: colors.primary }}
            thumbColor={orderUpdates ? '#fff' : colors.light}
            disabled={loading}
          />
        </View>
        <View style={[styles.rowBetween, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.rowText, { color: colors.text }]}>Nouveautés</Text>
          <Switch
            value={newArrivals}
            onValueChange={handleToggleNewArrivals}
            trackColor={{ false: colors.light, true: colors.primary }}
            thumbColor={newArrivals ? '#fff' : colors.light}
            disabled={loading}
          />
        </View>
        <View style={[styles.rowBetween, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.rowText, { color: colors.text }]}>Promotions</Text>
          <Switch
            value={promotions}
            onValueChange={handleTogglePromotions}
            trackColor={{ false: colors.light, true: colors.primary }}
            thumbColor={promotions ? '#fff' : colors.light}
            disabled={loading}
          />
        </View>
        <View style={[styles.rowBetween, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.rowText, { color: colors.text }]}>Alertes soldes</Text>
          <Switch
            value={salesAlerts}
            onValueChange={handleToggleSalesAlerts}
            trackColor={{ false: colors.light, true: colors.primary }}
            thumbColor={salesAlerts ? '#fff' : colors.light}
            disabled={loading}
          />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.grey }]}>COMPTE</Text>
        <TouchableOpacity style={[styles.supportBtn, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
          <Text style={[styles.supportText, { color: colors.primary }]}>Support</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.logoutBtn, { backgroundColor: colors.surface, borderColor: colors.text }]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutText, { color: colors.text }]}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomTabBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  },
  sectionLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
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
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 12,
  },
  rowText: {
    fontFamily: fonts.regular,
    fontSize: 16,
  },
  supportBtn: {
    marginHorizontal: 16,
    marginTop: 24,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  supportText: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutText: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
});

export default ProfileSettings;