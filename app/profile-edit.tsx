import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import fonts from '../src/constants/fonts';
import { useTheme } from '../src/hooks/useTheme';

export const options = { headerShown: false };

const ProfileEdit = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

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

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PROFIL PUBLIC</Text>
          <View style={[styles.inputRow, { backgroundColor: colors.surface }]}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Prénom</Text>
            <View style={[styles.inputField, { backgroundColor: colors.background }]}>
              <FontAwesome name="user" size={18} color={colors.grey} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Votre prénom"
                placeholderTextColor={colors.textSecondary}
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
          </View>
          <View style={[styles.inputRow, { backgroundColor: colors.surface }]}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Nom</Text>
            <View style={[styles.inputField, { backgroundColor: colors.background }]}>
              <FontAwesome name="user-o" size={18} color={colors.grey} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Votre nom"
                placeholderTextColor={colors.textSecondary}
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>INFOS PRIVÉES</Text>
          <View style={[styles.inputRow, { backgroundColor: colors.surface }]}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Adresse e-mail</Text>
            <View style={[styles.inputField, { backgroundColor: colors.background }]}>
              <FontAwesome name="envelope" size={18} color={colors.grey} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Votre e-mail"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
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
});

export default ProfileEdit;