import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import fonts from '../src/constants/fonts';
import { useTheme } from '../src/hooks/useTheme';

export default function WelcomeScreen() {
  const { isDark, colors: themeColors } = useTheme();

  const handleLogin = () => {
    router.push('/login');
  };

  const handleSignUp = () => {
    router.push('/register');
  };

  const handleSkip = () => {
    router.replace('/home');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={themeColors.background} />

      <View style={styles.logoContainer}>
        <Image
          source={isDark
            ? require('../assets/images/Nwanma-transparent-dark.png')
            : require('../assets/images/Nwanma-transparent.png')}
          style={styles.logoImage}
          contentFit="contain"
          transition={200}
        />
      </View>

      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: themeColors.text }]}>Bienvenue</Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
          Achetez et recevez les dernières nouveautés et promotions grâce à notre application mobile.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.loginButton, { backgroundColor: themeColors.primary }]}
          onPress={handleLogin}
        >
          <View style={styles.buttonContent}>
            <FontAwesome name="sign-in" size={18} color="white" style={styles.buttonIcon} />
            <Text style={styles.loginButtonText}>Log In</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.signupButton, { backgroundColor: themeColors.surface, borderColor: themeColors.border }]}
          onPress={handleSignUp}
        >
          <View style={styles.buttonContent}>
            <FontAwesome name="user-plus" size={18} color={themeColors.text} style={styles.buttonIcon} />
            <Text style={[styles.signupButtonText, { color: themeColors.text }]}>Sign Up</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
        >
          <Text style={[styles.skipButtonText, { color: themeColors.primary }]}>Continuer sans connexion</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoImage: {
    width: 300,
    height: 220,
    marginBottom: 10,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: fonts.bold,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    fontFamily: fonts.regular,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    marginBottom: 50,
  },
  loginButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: fonts.bold,
  },
  signupButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: fonts.bold,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  skipButton: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipButtonText: {
    fontFamily: fonts.medium,
    fontSize: 14,
  },
});