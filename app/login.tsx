import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../src/components/ui/Button';
import InputField from '../src/components/ui/InputField';
import fonts from '../src/constants/fonts';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/hooks/useTheme';

export default function LoginScreen() {
  const router = useRouter();
  const { isDark, colors } = useTheme();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      if (Platform.OS === 'web') {
        window.alert('Erreur\nVeuillez remplir tous les champs.');
      } else {
        alert('Veuillez remplir tous les champs.');
      }
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
          alert(title + ': ' + message);
        }
      } else {
        router.replace('/home');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log('Google login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* <View style={styles.topNav}>
        <BackButton onPress={() => router.back()} color={colors.text} />
      </View> */}

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
            <Text style={[styles.title, { color: colors.text }]}>Connexion</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Ravis de vous revoir ! Connectez-vous à votre compte.
            </Text>
          </View>

          {/* Form Card */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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

            <TouchableOpacity style={styles.forgotButton} onPress={() => router.push('/forgot-password')}>
              <Text style={[styles.forgotText, { color: colors.primary }]}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <Button
              title="Se connecter"
              onPress={handleLogin}
              backgroundColor={colors.primary}
              textColor="#fff"
              style={styles.loginButton}
              isLoading={loading}
              disabled={!email || !password}
            />
            {/* 
            <Divider text="OU CONTINUER AVEC" />

            <Button
              title="Connexion avec Google"
              onPress={handleGoogleLogin}
              backgroundColor={colors.surface}
              textColor={colors.text}
              leftIcon={<FontAwesome name="google" size={18} color="#EA4335" />}
              style={[styles.googleButton, { borderColor: colors.border }]}
            /> */}
          </View>

          {/* Register Link */}
          <View style={styles.registerRow}>
            <Text style={[styles.registerText, { color: colors.textSecondary }]}>Vous n'avez pas de compte ?</Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text style={[styles.registerLink, { color: colors.primary }]}>S'inscrire</Text>
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
    marginVertical: 16,
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
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 14,
    marginBottom: 6,
    marginTop: 10,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginVertical: 8,
  },
  forgotText: {
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  loginButton: {
    marginTop: 12,
  },
  googleButton: {
    borderWidth: 1,
    marginTop: 6,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
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