import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../src/components/ui/BackButton';
import Button from '../src/components/ui/Button';
import InputField from '../src/components/ui/InputField';
import fonts from '../src/constants/fonts';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/hooks/useTheme';

export default function RegisterScreen() {
  const { colors } = useTheme();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !fullName) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
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

        // Traduction et gestion des erreurs courantes
        if (message.includes('User already registered') || message.includes('unique constraint')) {
          title = 'Compte existant';
          message = 'Cette adresse email est déjà associée à un compte.';

          if (Platform.OS === 'web') {
            if (window.confirm(title + '\n' + message + '\n\nVoulez-vous vous connecter ?')) {
              router.push('/login');
            }
            return;
          } else {
            Alert.alert(title, message, [
              { text: 'Annuler', style: 'cancel' },
              { text: 'Se connecter', onPress: () => router.push('/login') }
            ]);
            return;
          }
        } else if (message.includes('Password should be at least')) {
          message = 'Le mot de passe doit contenir au moins 6 caractères.';
        }

        if (Platform.OS === 'web') {
          window.alert(title + '\n' + message);
        } else {
          Alert.alert(title, message);
        }
      } else {
        router.replace('/signup-success');
      }
    } catch (err) {
      if (Platform.OS === 'web') {
        window.alert('Erreur\nUne erreur inattendue est survenue.');
      } else {
        Alert.alert('Erreur', 'Une erreur inattendue est survenue.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.background === '#000000' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <View style={styles.header}>
        <BackButton onPress={() => router.back()} color={colors.text} />
        <Text style={[styles.title, { color: colors.text }]}>Créer un compte</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {step === 1 ? (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Infos personnelles</Text>
            <InputField
              placeholder="Nom complet"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              leftIcon={<FontAwesome name="user" size={18} color={colors.grey} />}
            />

            <InputField
              placeholder="Numéro de téléphone"
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
              disabled={!fullName || !phoneNumber}
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
              placeholder="Adresse email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              leftIcon={<FontAwesome name="envelope" size={18} color={colors.grey} />}
            />

            <InputField
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon={<FontAwesome name="lock" size={20} color={colors.grey} />}
            />

            <InputField
              placeholder="Confirmer mot de passe"
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
              isLoading={loading}
              disabled={!email || !password || !confirmPassword}
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