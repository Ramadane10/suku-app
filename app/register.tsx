import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../src/components/ui/BackButton';
import Button from '../src/components/ui/Button';
import InputField from '../src/components/ui/InputField';
import fonts from '../src/constants/fonts';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/hooks/useTheme';

export default function RegisterScreen() {
  const { isDark, colors } = useTheme();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !fullName) {
      if (Platform.OS === 'web') {
        window.alert('Erreur\nVeuillez remplir tous les champs obligatoires.');
      } else {
        alert('Veuillez remplir tous les champs obligatoires.');
      }
      return;
    }

    if (password !== confirmPassword) {
      if (Platform.OS === 'web') {
        window.alert('Erreur\nLes mots de passe ne correspondent pas.');
      } else {
        alert('Les mots de passe ne correspondent pas.');
      }
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email, password, {
        full_name: fullName,
        phone: phoneNumber,
      });

      if (error) {
        let title = 'Inscription échouée';
        let message = error.message;

        if (message.includes('User already registered') || message.includes('unique constraint')) {
          title = 'Compte existant';
          message = 'Cette adresse email est déjà associée à un compte.';
        } else if (message.includes('Password should be at least')) {
          message = 'Le mot de passe doit contenir au moins 6 caractères.';
        }

        if (Platform.OS === 'web') {
          window.alert(title + '\n' + message);
        } else {
          alert(title + ': ' + message);
        }
      } else {
        router.replace('/signup-success');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <View style={styles.topNav}>
        <BackButton onPress={() => (step === 2 ? setStep(1) : router.back())} color={colors.text} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Logo Brand Header */}
          <View style={styles.logoHeader}>
            <Image
              source={isDark
                ? require('../assets/images/Nwanma-transparent-dark.png')
                : require('../assets/images/Nwanma-transparent.png')}
              style={styles.logoImage}
              contentFit="contain"
              transition={200}
            />
            <Text style={[styles.title, { color: colors.text }]}>Créer un compte</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Rejoignez Nwanma et profitez de la meilleure expérience.
            </Text>

            {/* Step Indicators */}
            <View style={styles.stepIndicatorContainer}>
              <View style={[styles.stepDot, { backgroundColor: colors.primary }]} />
              <View style={[styles.stepLine, { backgroundColor: step === 2 ? colors.primary : colors.border }]} />
              <View style={[styles.stepDot, { backgroundColor: step === 2 ? colors.primary : colors.border }]} />
            </View>
          </View>

          {/* Step 1: Personal Infos */}
          {step === 1 ? (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.stepTitle, { color: colors.primary }]}>Étape 1 : Informations personnelles</Text>

              <Text style={[styles.label, { color: colors.text }]}>Nom complet</Text>
              <InputField
                placeholder="Ex: Ramadane Barry"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                leftIcon={<Ionicons name="person-outline" size={20} color={colors.primary} />}
              />

              <Text style={[styles.label, { color: colors.text }]}>Numéro de téléphone</Text>
              <InputField
                placeholder="Ex: +224 626 92 79 51"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                leftIcon={<Ionicons name="call-outline" size={20} color={colors.primary} />}
              />

              <Button
                title="Continuer"
                onPress={() => setStep(2)}
                backgroundColor={colors.primary}
                textColor="#fff"
                style={styles.actionBtn}
                disabled={!fullName || !phoneNumber}
              />
            </View>
          ) : (
            /* Step 2: Account Infos */
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.stepTitle, { color: colors.primary }]}>Étape 2 : Identifiants de connexion</Text>

              <Text style={[styles.label, { color: colors.text }]}>Adresse email</Text>
              <InputField
                placeholder="votre@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Ionicons name="mail-outline" size={20} color={colors.primary} />}
              />

              <Text style={[styles.label, { color: colors.text }]}>Mot de passe</Text>
              <InputField
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.primary} />}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.grey} />
                  </TouchableOpacity>
                }
              />

              <Text style={[styles.label, { color: colors.text }]}>Confirmer mot de passe</Text>
              <InputField
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.primary} />}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.grey} />
                  </TouchableOpacity>
                }
              />

              <Button
                title="Créer mon compte"
                onPress={handleSignUp}
                backgroundColor={colors.primary}
                textColor="#fff"
                style={styles.actionBtn}
                isLoading={loading}
                disabled={!email || !password || !confirmPassword}
              />
            </View>
          )}

          {/* Login Link */}
          <View style={styles.loginRow}>
            <Text style={[styles.loginText, { color: colors.textSecondary }]}>Déjà un compte ?</Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={[styles.loginLink, { color: colors.primary }]}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topNav: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  logoHeader: {
    alignItems: 'center',
    marginVertical: 12,
  },
  logoImage: {
    width: 200,
    height: 100,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontFamily: fonts.bold,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    textAlign: 'center',
    marginBottom: 12,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 6,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  stepTitle: {
    fontFamily: fonts.bold,
    fontSize: 15,
    marginBottom: 10,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 14,
    marginBottom: 6,
    marginTop: 8,
  },
  actionBtn: {
    marginTop: 20,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
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
});