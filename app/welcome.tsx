import { FontAwesome } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../src/constants/colors';
import fonts from '../src/constants/fonts';

export default function WelcomeScreen() {
  const handleLogin = () => {
    router.push('/login');
  };

  const handleSignUp = () => {
    router.push('/register'); // Vous devrez créer cette page plus tard
  };

  const handleSkip = () => {
    router.replace('/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/Nwanma-transparent.png')}
          style={styles.logoImage}
          contentFit="contain"
          transition={200}
        />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>Bienvenue</Text>
        <Text style={styles.subtitle}>
          Achetez et recevez les dernières nouveautés et promotions grâce à notre application mobile.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
        >
          <View style={styles.buttonContent}>
            <FontAwesome name="sign-in" size={18} color="white" style={styles.buttonIcon} />
            <Text style={styles.loginButtonText}>Log In</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupButton}
          onPress={handleSignUp}
        >
          <View style={styles.buttonContent}>
            <FontAwesome name="user-plus" size={18} color={colors.dark} style={styles.buttonIcon} />
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
        >
          <Text style={styles.skipButtonText}>Continuer sans connexion</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  logo: {
    fontSize: 80,
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: fonts.bold,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.dark,
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: fonts.bold,
  },
  subtitle: {
    fontSize: 16,
    color: colors.grey,
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
    backgroundColor: colors.primary,
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
    backgroundColor: 'white',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  signupButtonText: {
    color: colors.dark,
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
    color: colors.primary,
  },
});