import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import BackButton from '../src/components/ui/BackButton';
import Button from '../src/components/ui/Button';
import InputField from '../src/components/ui/InputField';
import fonts from '../src/constants/fonts';
import { useTheme } from '../src/hooks/useTheme';

export default function RegisterScreen() {
  const { colors } = useTheme();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);

  const handleSignUp = () => {
    // Logique d'inscription à implémenter
    router.push('/home');
    console.log('Sign up with:', { fullName, phoneNumber, email, password });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.background === '#000000' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={[styles.title, { color: colors.text }]}>Create new account</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {step === 1 ? (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Infos personnelles</Text>
            <InputField
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              leftIcon={<FontAwesome name="user" size={18} color={colors.grey} />}
            />

            <InputField
              placeholder="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              leftIcon={<FontAwesome name="phone" size={18} color={colors.grey} />}
            />

            <Button
              title="Suivant"
              onPress={() => setStep(2)}
              backgroundColor={colors.primary}
              textColor="#fff"
              leftIcon={<FontAwesome name="arrow-right" size={18} color="#fff" />}
              style={styles.nextButton}
            />

            <View style={styles.loginRow}>
              <Text style={[styles.loginText, { color: colors.textSecondary }]}>Déjà un compte ?</Text>
              <Text
                style={[styles.loginLink, { color: colors.primary }]}
                onPress={() => router.push('/login')}
              >
                Se connecter
              </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Compte</Text>
            <InputField
              placeholder="E-mail Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              leftIcon={<FontAwesome name="envelope" size={18} color={colors.grey} />}
            />

            <InputField
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon={<FontAwesome name="lock" size={20} color={colors.grey} />}
            />

            <InputField
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              leftIcon={<FontAwesome name="lock" size={20} color={colors.grey} />}
            />

            <Button
              title="Créer le compte"
              onPress={handleSignUp}
              backgroundColor={colors.primary}
              textColor="#fff"
              leftIcon={<FontAwesome name="user-plus" size={18} color="#fff" />}
              style={styles.signUpButton}
            />
          </View>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.bold,
    marginTop: 16,
    fontWeight: 'bold',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 14,
    marginBottom: 12,
  },
  nextButton: {
    marginTop: 12,
    width: '100%',
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 6,
  },
  loginText: {
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  loginLink: {
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  signUpButton: {
    marginTop: 20,
    width: '100%',
  },
});