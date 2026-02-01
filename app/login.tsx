import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../src/components/ui/BackButton';
import Button from '../src/components/ui/Button';
import Divider from '../src/components/ui/Divider';
import InputField from '../src/components/ui/InputField';
import fonts from '../src/constants/fonts';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/hooks/useTheme';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email, password);

      if (error) {
        let title = 'Échec de la connexion';
        let message = error.message;

        if (message.includes('Invalid login credentials')) {
          message = 'Email ou mot de passe incorrect.\nSi vous n\'avez pas de compte, veuillez vous inscrire.';
        }

        if (Platform.OS === 'web') {
          window.alert(title + '\n' + message);
        } else {
          Alert.alert(title, message);
        }
      } else {
        router.replace('/home');
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

  const handleFacebookLogin = () => {
    // Logique de connexion Google à implémenter
    console.log('Google login');
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  const handleGoToRegister = () => {
    router.push('/register');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.background === '#000000' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <View style={styles.header}>
        <BackButton onPress={() => router.back()} color={colors.text} />
        <Text style={[styles.title, { color: colors.text }]}>Connexion</Text>
      </View>

      <View style={styles.content}>
        <InputField style={{}}
          placeholder="Email ou téléphone"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          leftIcon={<FontAwesome name="envelope" size={18} color={colors.grey} />}
        />

        <InputField style={{}}
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          leftIcon={<FontAwesome name="lock" size={20} color={colors.grey} />}
        />

        <TouchableOpacity style={styles.forgotButton} onPress={handleForgotPassword}>
          <Text style={[styles.forgotText, { color: colors.primary }]}>Mot de passe oublié ?</Text>
        </TouchableOpacity>

        <Button
          title="Se connecter"
          onPress={handleLogin}
          backgroundColor={colors.primary}
          textColor="#fff"
          leftIcon={<FontAwesome name="sign-in" size={18} color="#fff" />}
          style={styles.loginButton}
          isLoading={loading}
          disabled={!email || !password}
        />

        <Divider text="OU" />

        <Button style={{}}
          title="Connexion Google"
          onPress={handleFacebookLogin}
          backgroundColor="#4285F4"
          textColor="#fff"
          leftIcon={<FontAwesome name="google" size={18} color="#fff" />}
        />

        <View style={styles.registerRow}>
          <Text style={[styles.registerText, { color: colors.textSecondary }]}>Pas encore de compte ?</Text>
          <TouchableOpacity onPress={handleGoToRegister}>
            <Text style={[styles.registerLink, { color: colors.primary }]}>Créer un compte</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loginButton: {
    marginTop: 16,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: 4,
    marginBottom: 8,
  },
  forgotText: {
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 6,
  },
  registerText: {
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  registerLink: {
    fontFamily: fonts.bold,
    fontSize: 14,
  },
});