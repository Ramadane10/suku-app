import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import BackButton from '../src/components/ui/BackButton';
import Button from '../src/components/ui/Button';
import Divider from '../src/components/ui/Divider';
import InputField from '../src/components/ui/InputField';
import colors from '../src/constants/colors';
import fonts from '../src/constants/fonts';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Logique de connexion à implémenter
    console.log('Login with:', email, password);
  };

  const handleFacebookLogin = () => {
    // Logique de connexion Facebook à implémenter
    console.log('Facebook login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.light} />
      
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
        <Text style={styles.title}>Sign In</Text>
      </View>
      
      <View style={styles.content}>
        <InputField style={{}}
          placeholder="E-mail or phone number"
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
        
        <Button
          title="Log in"
          onPress={handleLogin}
          backgroundColor={colors.dark}
          textColor={colors.light}
          style={styles.loginButton}
        />
        
        <Divider text="OR" />
        
        <Button style={{}}
          title="Facebook Login"
          onPress={handleFacebookLogin}
          backgroundColor="#3b5998"
          textColor={colors.light}
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loginButton: {
    marginTop: 16,
  },
});