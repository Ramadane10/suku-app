import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../src/components/ui/BottomTabBar';
import fonts from '../src/constants/fonts';
import { useTheme } from '../src/hooks/useTheme';

export const options = { headerShown: false };

const ProfileSettings = () => {
  const router = useRouter();
  const { colors, theme, toggleTheme } = useTheme();
  const [faceId, setFaceId] = useState(true);
  const [orderUpdates, setOrderUpdates] = useState(false);
  const [newArrivals, setNewArrivals] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [salesAlerts, setSalesAlerts] = useState(true);

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
            onValueChange={setFaceId}
            trackColor={{ false: colors.light, true: colors.primary }}
            thumbColor={faceId ? '#fff' : colors.light}
          />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.grey }]}>NOTIFICATIONS</Text>
        <View style={[styles.rowBetween, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.rowText, { color: colors.text }]}>Mises à jour commandes</Text>
          <Switch
            value={orderUpdates}
            onValueChange={setOrderUpdates}
            trackColor={{ false: colors.light, true: colors.primary }}
            thumbColor={orderUpdates ? '#fff' : colors.light}
          />
        </View>
        <View style={[styles.rowBetween, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.rowText, { color: colors.text }]}>Nouveautés</Text>
          <Switch
            value={newArrivals}
            onValueChange={setNewArrivals}
            trackColor={{ false: colors.light, true: colors.primary }}
            thumbColor={newArrivals ? '#fff' : colors.light}
          />
        </View>
        <View style={[styles.rowBetween, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.rowText, { color: colors.text }]}>Promotions</Text>
          <Switch
            value={promotions}
            onValueChange={setPromotions}
            trackColor={{ false: colors.light, true: colors.primary }}
            thumbColor={promotions ? '#fff' : colors.light}
          />
        </View>
        <View style={[styles.rowBetween, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.rowText, { color: colors.text }]}>Alertes soldes</Text>
          <Switch
            value={salesAlerts}
            onValueChange={setSalesAlerts}
            trackColor={{ false: colors.light, true: colors.primary }}
            thumbColor={salesAlerts ? '#fff' : colors.light}
          />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.grey }]}>COMPTE</Text>
        <TouchableOpacity style={[styles.supportBtn, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
          <Text style={[styles.supportText, { color: colors.primary }]}>Support</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: colors.surface, borderColor: colors.text }]}>
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