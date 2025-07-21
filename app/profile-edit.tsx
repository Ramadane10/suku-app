import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../src/components/ui/BottomTabBar';
import colors from '../src/constants/colors';
import fonts from '../src/constants/fonts';

export const options = { headerShown: false };

const ProfileEdit = () => {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.dark} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Modifier le profil</Text>
            <View style={{ width: 24 }} />
          </View>

          <Text style={styles.sectionLabel}>PROFIL PUBLIC</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Prénom</Text>
            <TextInput
              style={styles.input}
              placeholder="Votre prénom"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Nom</Text>
            <TextInput
              style={styles.input}
              placeholder="Votre nom"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          <Text style={styles.sectionLabel}>INFOS PRIVÉES</Text>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Adresse e-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="Votre e-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Téléphone</Text>
            <TextInput
              style={styles.input}
              placeholder="Votre numéro"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        </ScrollView>
        <BottomTabBar />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
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
  inputRow: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
  },
  inputLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.grey,
    marginBottom: 4,
  },
  input: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.dark,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});

export default ProfileEdit; 