import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../src/constants/colors';
import fonts from '../src/constants/fonts';

export default function WelcomeScreen() {
  const handleLogin = () => {
    router.push('/login');
  };

  const handleSignUp = () => {
    router.push('/register'); // Vous devrez créer cette page plus tard
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>S</Text>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Bienvenue a Suku</Text>
        <Text style={styles.subtitle}>
          Achetez et recevez les dernières nouveautés et promotions grâce à notre application mobile. 
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
        >
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.signupButton} 
          onPress={handleSignUp}
        >
          <Text style={styles.signupButtonText}>Sign Up</Text>
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
    marginTop: 60,
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
    backgroundColor: colors.dark,
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
    borderColor: colors.dark,
  },
  signupButtonText: {
    color: colors.dark,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: fonts.bold,
  },
});