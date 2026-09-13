import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../src/components/ui/Header';
import fonts from '../src/constants/fonts';
import { useCustomAlert } from '../src/context/AlertContext';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/hooks/useTheme';
import { useUserSettings } from '../src/hooks/useUserSettings';

export const options = { headerShown: false };

const ProfileSettings = () => {
  const router = useRouter();
  const { colors, theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();
  const { settings, loading, updateSetting } = useUserSettings();
  const { showConfirm, showError } = useCustomAlert();

  const [orderUpdates, setOrderUpdates] = useState(true);

  useEffect(() => {
    if (settings) {
      setOrderUpdates(settings.order_updates ?? true);
    }
  }, [settings]);

  const handleToggleOrderUpdates = async (value: boolean) => {
    setOrderUpdates(value);
    try { await updateSetting('order_updates', value); }
    catch { showError('Erreur', 'Impossible de mettre à jour ce paramètre.'); setOrderUpdates(!value); }
  };

  const handleLogout = () => {
    showConfirm(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      async () => {
        try { await signOut(); router.replace('/login'); }
        catch { showError('Erreur', 'Impossible de se déconnecter.'); }
      },
      'Déconnexion',
      'Annuler'
    );
  };

  const handleDeleteAccount = () => {
    showConfirm(
      'Supprimer le compte',
      'Cette action est irréversible. Toutes vos données seront définitivement supprimées.\n\nPour procéder, contactez le support au +224 628 17 96 58.',
      async () => { router.push('/profile-contact'); },
      'Contacter le support',
      'Annuler'
    );
  };

  const trackColor = { false: theme === 'dark' ? '#3A3A3C' : '#D1D1D6', true: colors.primary };
  const iosBg = theme === 'dark' ? '#3A3A3C' : '#D1D1D6';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Header
          title="Paramètres"
          showBack={true}
          showMenu={false}
          showCart={false}
          showNotifications={false}
          onBackPress={() => router.back()}
        />

        {/* APPARENCE */}
        <Text style={[styles.sectionLabel, { color: colors.grey }]}>APPARENCE</Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.rowBetween}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name={theme === 'dark' ? 'moon' : 'sunny'} size={18} color={colors.primary} />
              </View>
              <Text style={[styles.rowText, { color: colors.text }]}>Mode sombre</Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={trackColor}
              thumbColor="#FFFFFF"
              ios_backgroundColor={iosBg}
            />
          </View>
        </View>

        {/* NOTIFICATIONS */}
        <Text style={[styles.sectionLabel, { color: colors.grey }]}>NOTIFICATIONS</Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.rowBetween}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="cube-outline" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowText, { color: colors.text }]}>Mises à jour commandes</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 1 }}>
                  Recevoir une notification à chaque commande passée
                </Text>
              </View>
            </View>
            <Switch
              value={orderUpdates}
              onValueChange={handleToggleOrderUpdates}
              trackColor={trackColor}
              thumbColor="#FFFFFF"
              ios_backgroundColor={iosBg}
              disabled={loading}
            />
          </View>
        </View>

        {/* COMPTE */}
        <Text style={[styles.sectionLabel, { color: colors.grey }]}>COMPTE</Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={[styles.rowBetween, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            onPress={() => router.push('/profile-contact')}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, { backgroundColor: '#007AFF20' }]}>
                <Ionicons name="headset-outline" size={18} color="#007AFF" />
              </View>
              <Text style={[styles.rowText, { color: colors.text }]}>Contacter le support</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.grey} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rowBetween}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, { backgroundColor: '#FF6B6B20' }]}>
                <MaterialCommunityIcons name="logout" size={18} color="#FF6B6B" />
              </View>
              <Text style={[styles.rowText, { color: '#FF6B6B' }]}>Se déconnecter</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.grey} />
          </TouchableOpacity>
        </View>

        {/* ZONE SENSIBLE */}
        <Text style={[styles.sectionLabel, { color: colors.grey }]}>ZONE SENSIBLE</Text>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={styles.rowBetween}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, { backgroundColor: (colors.danger ?? '#E53935') + '20' }]}>
                <Ionicons name="trash-outline" size={18} color={colors.danger ?? '#E53935'} />
              </View>
              <Text style={[styles.rowText, { color: colors.danger ?? '#E53935' }]}>Supprimer mon compte</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.grey} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  sectionLabel: {
    fontFamily: fonts.bold,
    fontSize: 12,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 16,
    letterSpacing: 0.6,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    flex: 1,
  },
});

export default ProfileSettings;
