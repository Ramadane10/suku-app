import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import fonts from '../src/constants/fonts';
import { useTheme } from '../src/hooks/useTheme';
import { useProfile } from '../src/hooks/useProfile';
import { useAuth } from '../src/context/AuthContext';

export const options = { headerShown: false };

const ProfileEdit = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    } else if (user) {
      setFullName(user.user_metadata?.full_name || '');
      setPhone(user.user_metadata?.phone || '');
    }
  }, [profile, user]);

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté pour modifier votre profil.');
      return;
    }

    try {
      setSaving(true);
      await updateProfile({
        full_name: fullName,
        phone: phone,
      });
      Alert.alert('Succès', 'Votre profil a été mis à jour avec succès.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de mettre à jour le profil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.surface }]}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Modifier le profil</Text>
            <View style={{ width: 24 }} />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PROFIL PUBLIC</Text>
              <View style={[styles.inputRow, { backgroundColor: colors.surface }]}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Nom complet</Text>
                <View style={[styles.inputField, { backgroundColor: colors.background }]}>
                  <FontAwesome name="user" size={18} color={colors.grey} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Votre nom complet"
                    placeholderTextColor={colors.textSecondary}
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </View>

              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>INFOS PRIVÉES</Text>
              <View style={[styles.inputRow, { backgroundColor: colors.surface }]}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Adresse e-mail</Text>
                <View style={[styles.inputField, { backgroundColor: colors.background }]}>
                  <FontAwesome name="envelope" size={18} color={colors.grey} style={styles.inputIcon} />
                  <Text style={[styles.input, { color: colors.textSecondary }]}>
                    {profile?.email || user?.email || 'Non disponible'}
                  </Text>
                </View>
                <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                  L'email ne peut pas être modifié
                </Text>
              </View>
            </>
          )}
          <View style={[styles.inputRow, { backgroundColor: colors.surface }]}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Téléphone</Text>
            <View style={[styles.inputField, { backgroundColor: colors.background }]}>
              <FontAwesome name="phone" size={18} color={colors.grey} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Votre numéro"
                placeholderTextColor={colors.textSecondary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {!loading && (
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  inputRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  inputLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    marginBottom: 4,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    paddingVertical: 4,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  helpText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  saveButton: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 32,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#fff',
  },
});

export default ProfileEdit;