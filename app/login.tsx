import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BackButton from '../src/components/ui/BackButton';
import Button from '../src/components/ui/Button';
import Divider from '../src/components/ui/Divider';
import InputField from '../src/components/ui/InputField';
import fonts from '../src/constants/fonts';
import { useTheme } from '../src/hooks/useTheme';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Logique de connexion à implémenter
    router.push('/home');
    console.log('Login with:', email, password);
  };

  const handleFacebookLogin = () => {
    // Logique de connexion Google à implémenter
    console.log('Google login');
  };

  const handleForgotPassword = () => {
    // Logique mot de passe oublié à implémenter
    console.log('Forgot password for:', email);
  };

  const handleGoToRegister = () => {
    router.push('/register');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.background === '#000000' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={[styles.title, { color: colors.text }]}>Sign In</Text>
      </View>

      <View style={styles.content}>
        <InputField style={{}}
          placeholder="E-mail or phone number"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          leftIcon={<FontAwesome name="envelope" size={18} color={colors.grey} />}
        />

        <InputField style={{}}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          leftIcon={<FontAwesome name="lock" size={20} color={colors.grey} />}
        />

        <TouchableOpacity style={styles.forgotButton} onPress={handleForgotPassword}>
          <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot password?</Text>
        </TouchableOpacity>

        <Button
          title="Log in"
          onPress={handleLogin}
          backgroundColor={colors.primary}
          textColor="#fff"
          leftIcon={<FontAwesome name="sign-in" size={18} color="#fff" />}
          style={styles.loginButton}
        />

        <Divider text="OR" />

        <Button style={{}}
          title="Google Login"
          onPress={handleFacebookLogin}
          backgroundColor="#4285F4"
          textColor="#fff"
          leftIcon={<FontAwesome name="google" size={18} color="#fff" />}
        />

        <View style={styles.registerRow}>
          <Text style={[styles.registerText, { color: colors.textSecondary }]}>No account yet?</Text>
          <TouchableOpacity onPress={handleGoToRegister}>
            <Text style={[styles.registerLink, { color: colors.primary }]}>Create one</Text>
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