import { router } from 'expo-router';
import React from 'react';
import { Dimensions, Image, SafeAreaView, StyleSheet, Text } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';

const { width } = Dimensions.get('window');

const slides = [
  {
    key: 'one',
    title: 'Bienvenue sur Suku',
    text: 'Achetez facilement vos produits préférés.',
    image: require('../assets/images/onboarding1.png'),
  },
  {
    key: 'two',
    title: 'Livraison rapide',
    text: 'Recevez vos commandes en un temps record.',
    image: require('../assets/images/onboarding2.png'),
  },
  {
    key: 'three',
    title: 'Paiement sécurisé',
    text: 'Vos paiements sont traités en toute sécurité.',
    image: require('../assets/images/onboarding3.png'),
  },
];

export default function OnboardingScreen() {
  const renderItem = ({ item }) => (
    <SafeAreaView style={styles.slide}>
      <Image source={item.image} style={styles.image} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.text}>{item.text}</Text>
    </SafeAreaView>
  );

  const handleDone = () => {
    router.replace('/welcome');
  };

  return (
    <AppIntroSlider
      data={slides}
      renderItem={renderItem}
      onDone={handleDone}
      showSkipButton
      onSkip={handleDone}
    />
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: width * 0.8,
    height: 300,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});