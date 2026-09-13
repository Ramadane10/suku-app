import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../src/components/ui/Header';
import InputField from '../src/components/ui/InputField';
import fonts from '../src/constants/fonts';
import { useCustomAlert } from '../src/context/AlertContext';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/hooks/useTheme';
import { useUserSettings } from '../src/hooks/useUserSettings';
import { supabase } from '../src/lib/supabase';

export const options = { headerShown: false };

const ProfileSettings = () => {
  const router = useRouter();
  const { colors, theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { settings, loading, updateSetting } = useUserSettings();
  const { showConfirm, showError, showSuccess } = useCustomAlert();

  const [orderUpdates, setOrderUpdates] = useState(true);

  // États pour la modification du mot de passe
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (settings) {
      setOrderUpdates(settings.order_updates ?? true);
    }
  }, [settings]);

  const handleToggleOrderUpdates = async (value: boolean) => {
    setOrderUpdates(value);
    try {
      await updateSetting('order_updates', value);
    } catch {
      showError('Erreur', 'Impossible de mettre à jour ce paramètre.');
      setOrderUpdates(!value);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      showError('Champs incomplets', 'Veuillez renseigner votre mot de passe actuel et le nouveau.');
      return;
    }

    if (newPassword.length < 6) {
      showError('Mot de passe trop court', 'Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('Mots de passe non identiques', 'Le nouveau mot de passe et sa confirmation ne correspondent pas.');
      return;
    }

    if (currentPassword === newPassword) {
      showError('Mot de passe identique', 'Le nouveau mot de passe doit être différent de l\'ancien.');
      return;
    }

    if (!user?.email) {
      showError('Erreur', 'Session invalide. Veuillez vous reconnecter.');
      return;
    }

    setPasswordLoading(true);
    try {
      // 1. Vérifier que le mot de passe actuel est exact
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (verifyError) {
        showError('Mot de passe incorrect', 'Le mot de passe actuel que vous avez saisi est incorrect.');
        setPasswordLoading(false);
        return;
      }

      // 2. Mettre à jour avec le nouveau mot de passe
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        showError('Erreur', updateError.message || 'Impossible de modifier le mot de passe.');
      } else {
        setIsPasswordModalVisible(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showSuccess('Succès', 'Votre mot de passe a été modifié avec succès !');
      }
    } catch (err: any) {
      showError('Erreur', err.message || 'Une erreur inattendue est survenue.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    showConfirm(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      async () => {
        try {
          await signOut();
          router.replace('/login');
        } catch {
          showError('Erreur', 'Impossible de se déconnecter.');
        }
      },
      'Déconnexion',
      'Annuler'
    );
  };

  const handleDeleteAccount = () => {
    showConfirm(
      'Supprimer définitivement le compte',
      'Cette action est irréversible. Toutes vos données personnelles (commandes, adresses, favoris, panier, notifications, profil) seront définitivement supprimées.\n\nÊtes-vous absolument sûr ?',
      async () => {
        try {
          if (!user) return;
          // 1. Tenter d'exécuter la fonction RPC Supabase (cascade automatique)
          const { error: rpcErr } = await supabase.rpc('delete_user_account');

          // 2. Si la fonction RPC n'est pas installée, supprimer directement les données
          if (rpcErr) {
            await Promise.allSettled([
              supabase.from('addresses').delete().eq('user_id', user.id),
              supabase.from('favorites').delete().eq('user_id', user.id),
              supabase.from('notifications').delete().eq('user_id', user.id),
              supabase.from('user_settings').delete().eq('user_id', user.id),
              supabase.from('reviews').delete().eq('user_id', user.id),
              supabase.from('orders').delete().eq('user_id', user.id),
              supabase.from('carts').delete().eq('user_id', user.id),
              supabase.from('profiles').delete().eq('id', user.id),
            ]);
          }

          await signOut();
          showSuccess('Compte supprimé', 'Votre compte et vos données ont été supprimés avec succès.');
          router.replace('/login');
        } catch (err: any) {
          showError('Erreur', 'Impossible de supprimer le compte: ' + (err.message || ''));
        }
      },
      'Supprimer définitivement',
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
          {/* Modifier le mot de passe */}
          <TouchableOpacity
            style={[styles.rowBetween, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            onPress={() => {
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setShowCurrentPassword(false);
              setShowNewPassword(false);
              setShowConfirmPassword(false);
              setIsPasswordModalVisible(true);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, { backgroundColor: '#FF950020' }]}>
                <Ionicons name="key-outline" size={18} color="#FF9500" />
              </View>
              <Text style={[styles.rowText, { color: colors.text }]}>Modifier mon mot de passe</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.grey} />
          </TouchableOpacity>

          {/* Contacter le support */}
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

          {/* Se déconnecter */}
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

      {/* Modal Modification Mot de passe */}
      <Modal
        visible={isPasswordModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => !passwordLoading && setIsPasswordModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            {/* Header du modal */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleWrap}>
                <View style={[styles.iconWrap, { backgroundColor: '#FF950020', marginRight: 10 }]}>
                  <Ionicons name="key-outline" size={20} color="#FF9500" />
                </View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Modifier le mot de passe
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => !passwordLoading && setIsPasswordModalVisible(false)}
                disabled={passwordLoading}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={22} color={colors.grey} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              Saisissez votre mot de passe actuel puis définissez votre nouveau mot de passe (au moins 6 caractères).
            </Text>

            {/* Mot de passe actuel */}
            <Text style={[styles.inputLabel, { color: colors.text }]}>Mot de passe actuel</Text>
            <InputField
              placeholder="••••••••"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrentPassword}
              rightIcon={
                <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                  <Ionicons
                    name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.grey}
                  />
                </TouchableOpacity>
              }
            />

            {/* Nouveau mot de passe */}
            <Text style={[styles.inputLabel, { color: colors.text, marginTop: 12 }]}>Nouveau mot de passe</Text>
            <InputField
              placeholder="••••••••"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              rightIcon={
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  <Ionicons
                    name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.grey}
                  />
                </TouchableOpacity>
              }
            />

            {/* Confirmer mot de passe */}
            <Text style={[styles.inputLabel, { color: colors.text, marginTop: 12 }]}>
              Confirmer le nouveau mot de passe
            </Text>
            <InputField
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              rightIcon={
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.grey}
                  />
                </TouchableOpacity>
              }
            />

            {/* Boutons d'action */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => setIsPasswordModalVisible(false)}
                disabled={passwordLoading}
              >
                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: passwordLoading ? 0.7 : 1 }]}
                onPress={handleUpdatePassword}
                disabled={passwordLoading}
              >
                {passwordLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Enregistrer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalHeaderTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  modalSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  inputLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    marginBottom: 6,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  submitBtn: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 110,
  },
  submitBtnText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});

export default ProfileSettings;
