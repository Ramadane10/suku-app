import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../src/components/ui/Header';
import fonts from '../src/constants/fonts';
import { useCustomAlert } from '../src/context/AlertContext';
import { useAuth } from '../src/context/AuthContext';
import { useProfile } from '../src/hooks/useProfile';
import { useTheme } from '../src/hooks/useTheme';

export const options = { headerShown: false };

const ProfileEdit = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const { showError, showSuccess } = useCustomAlert();

  // Mode d'édition (par défaut verrouillé en consultation seule)
  const [isEditing, setIsEditing] = useState(false);
  const [focusedField, setFocusedField] = useState<'fullName' | 'phone' | null>(null);

  // Valeurs initiales pour détecter les modifications
  const [initialFullName, setInitialFullName] = useState('');
  const [initialPhone, setInitialPhone] = useState('');

  // États des formulaires
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const resolvePhone = () => {
      if (profile?.phone && profile.phone.trim() !== '') return profile.phone;
      if (user?.phone && user.phone.trim() !== '') return user.phone;
      if (user?.user_metadata?.phone && user.user_metadata.phone.trim() !== '') return user.user_metadata.phone;
      if (user?.user_metadata?.phone_number && user.user_metadata.phone_number.trim() !== '') return user.user_metadata.phone_number;
      return '';
    };

    const resolveName = () => {
      if (profile?.full_name && profile.full_name.trim() !== '') return profile.full_name;
      if (user?.user_metadata?.full_name && user.user_metadata.full_name.trim() !== '') return user.user_metadata.full_name;
      return '';
    };

    const nameVal = resolveName();
    const phoneVal = resolvePhone();

    setFullName(nameVal);
    setPhone(phoneVal);
    setInitialFullName(nameVal);
    setInitialPhone(phoneVal);
  }, [profile, user]);

  // Vérifier si des modifications ont réellement été effectuées
  const hasChanges = fullName.trim() !== initialFullName.trim() || phone.trim() !== initialPhone.trim();

  const handleCancel = () => {
    setFullName(initialFullName);
    setPhone(initialPhone);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!user) {
      showError('Erreur', 'Vous devez être connecté pour modifier votre profil.');
      return;
    }

    if (!hasChanges) return;

    try {
      setSaving(true);
      await updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim(),
      });

      setInitialFullName(fullName.trim());
      setInitialPhone(phone.trim());
      setIsEditing(false);
      showSuccess('Profil mis à jour', 'Vos informations ont été enregistrées avec succès.');
    } catch (error: any) {
      showError('Erreur', error.message || 'Impossible de mettre à jour le profil.');
    } finally {
      setSaving(false);
    }
  };

  const displayName = fullName || user?.email || 'Utilisateur';
  const avatarUrl = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Header
          title={isEditing ? "Éditer le profil" : "Détails du compte"}
          showBack={true}
          showMenu={false}
          showCart={false}
          showNotifications={false}
          onBackPress={() => {
            if (isEditing) {
              handleCancel();
            } else {
              router.back();
            }
          }}
        />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <>
              {/* Carte Entête Profil */}
              <View style={[styles.headerCard, { backgroundColor: colors.surface }]}>
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                <View style={styles.headerInfo}>
                  <Text style={[styles.headerName, { color: colors.text }]}>
                    {displayName}
                  </Text>
                  <Text style={[styles.headerEmail, { color: colors.textSecondary }]}>
                    {profile?.email || user?.email || 'Non disponible'}
                  </Text>
                </View>
                {!isEditing && (
                  <TouchableOpacity
                    style={[styles.editBadgeButton, { backgroundColor: colors.primary + '15' }]}
                    onPress={() => setIsEditing(true)}
                  >
                    <Feather name="edit-2" size={16} color={colors.primary} />
                    <Text style={[styles.editBadgeText, { color: colors.primary }]}>Modifier</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Information Form / Display */}
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                {isEditing ? "MODIFIER VOS INFORMATIONS" : "INFORMATIONS PERSONNELLES"}
              </Text>

              {/* Champ Nom Complet */}
              <View style={styles.fieldGroup}>
                <Text style={[
                  styles.fieldLabel,
                  { color: isEditing && focusedField === 'fullName' ? colors.primary : colors.text }
                ]}>
                  Nom complet
                </Text>

                {isEditing ? (
                  <View style={[
                    styles.inputBox,
                    {
                      backgroundColor: colors.surface,
                      borderColor: focusedField === 'fullName' ? colors.primary : colors.border,
                      borderWidth: focusedField === 'fullName' ? 2 : 1,
                    }
                  ]}>
                    <FontAwesome
                      name="user"
                      size={18}
                      color={focusedField === 'fullName' ? colors.primary : colors.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Mamadou Ramadane Barry"
                      placeholderTextColor={colors.textSecondary + '80'}
                      value={fullName}
                      onChangeText={setFullName}
                      onFocus={() => setFocusedField('fullName')}
                      onBlur={() => setFocusedField(null)}
                      autoFocus={true}
                      underlineColorAndroid="transparent"
                    />
                  </View>
                ) : (
                  <View style={[styles.readOnlyCard, { backgroundColor: colors.surface }]}>
                    <Ionicons name="person-outline" size={20} color={colors.primary} style={styles.inputIcon} />
                    <Text style={[styles.readOnlyValue, { color: colors.text }]}>
                      {fullName || 'Non renseigné'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Champ Email (Read only toujours) */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>Adresse e-mail</Text>
                <View style={[styles.readOnlyCard, { backgroundColor: colors.surface }]}>
                  <Ionicons name="mail-outline" size={20} color={colors.primary} style={styles.inputIcon} />
                  <Text style={[styles.readOnlyValue, { color: colors.textSecondary, flex: 1 }]}>
                    {profile?.email || user?.email || 'Non disponible'}
                  </Text>
                  <Ionicons name="lock-closed-outline" size={18} color={colors.grey} />
                </View>
                <Text style={[styles.lockHint, { color: colors.textSecondary }]}>
                  L'adresse email ne peut pas être modifiée ici.
                </Text>
              </View>

              {/* Champ Téléphone */}
              <View style={styles.fieldGroup}>
                <Text style={[
                  styles.fieldLabel,
                  { color: isEditing && focusedField === 'phone' ? colors.primary : colors.text }
                ]}>
                  Numéro de téléphone
                </Text>

                {isEditing ? (
                  <View style={[
                    styles.inputBox,
                    {
                      backgroundColor: colors.surface,
                      borderColor: focusedField === 'phone' ? colors.primary : colors.border + '30',
                      borderWidth: 1.5,
                    }
                  ]}>
                    <FontAwesome
                      name="phone"
                      size={18}
                      color={focusedField === 'phone' ? colors.primary : colors.textSecondary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="626 92 79 51"
                      placeholderTextColor={colors.textSecondary + '80'}
                      value={phone}
                      onChangeText={setPhone}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      keyboardType="phone-pad"
                      underlineColorAndroid="transparent"
                    />
                  </View>
                ) : (
                  <View style={[styles.readOnlyCard, { backgroundColor: colors.surface }]}>
                    <Ionicons name="call-outline" size={20} color={colors.primary} style={styles.inputIcon} />
                    <Text style={[styles.readOnlyValue, { color: colors.text }]}>
                      {phone || 'Non renseigné'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Actions lors de l'édition */}
              {isEditing && (
                <View style={styles.actionContainer}>
                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      { backgroundColor: hasChanges ? colors.primary : colors.grey + '60' }
                    ]}
                    onPress={handleSave}
                    disabled={!hasChanges || saving}
                  >
                    {saving ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.saveButtonText}>
                        {hasChanges ? "Enregistrer les modifications" : "Aucune modification"}
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.cancelButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
                    onPress={handleCancel}
                    disabled={saving}
                  >
                    <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Annuler</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 60, paddingTop: 12 },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontFamily: fonts.bold,
    fontSize: 18,
    marginBottom: 4,
  },
  headerEmail: {
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  editBadgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 24,
  },
  editBadgeText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    marginLeft: 6,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 16,
    marginLeft: 2,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 2,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 14,
  },
  input: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 16,
    height: '100%',
    padding: 0,
    // @ts-ignore - RN Web outline suppression
    outlineStyle: 'none',
    outlineWidth: 0,
  },
  readOnlyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  readOnlyValue: {
    fontFamily: fonts.medium,
    fontSize: 16,
  },
  lockHint: {
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  actionContainer: {
    marginTop: 16,
    marginBottom: 30,
  },
  saveButton: {
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  cancelButton: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontFamily: fonts.bold,
    fontSize: 15,
  },
});

export default ProfileEdit;