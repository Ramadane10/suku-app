import { router } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import BackButton from '../src/components/ui/BackButton';
import Button from '../src/components/ui/Button';
import InputField from '../src/components/ui/InputField';
import colors from '../src/constants/colors';
import fonts from '../src/constants/fonts';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    // Logique d'inscription à implémenter
    router.push('/home');
    console.log('Sign up with:', { fullName, phoneNumber, email, password });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.light} />
      
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.title}>Create new account</Text>
      </View>
      
      <View style={styles.content}>
        <InputField style={{}}
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />
        
        <InputField style={{}}
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
        
        <InputField style={{}}
          placeholder="E-mail Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        
        <InputField style={{}}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <InputField style={{}}
          placeholder="Confirm Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <Button
          title="Sign Up"
          onPress={handleSignUp}
          backgroundColor={colors.dark}
          textColor={colors.light}
          style={styles.signUpButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.bold,
    color: colors.dark,
    marginTop: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  signUpButton: {
    marginTop: 20,
    width: '100%',
  },
});