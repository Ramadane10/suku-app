import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import colors from '../src/constants/colors';

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
  const renderItem = ({ item }: { item: { key: string; title: string; text: string; image: any } }) => (
    <SafeAreaView style={styles.slide}>
      <Image source={item.image} style={styles.image} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.text}>{item.text}</Text>
    </SafeAreaView>
  );

  const handleDone = () => {
    router.replace('/welcome');
  };

  // Personnalisation du bouton Next
  const renderNextButton = () => {
    return (
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Suivant</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.primary} style={styles.buttonIcon} />
        </TouchableOpacity>
      </View>
    );
  };

  // Personnalisation du bouton Done
  const renderDoneButton = () => {
    return (
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Done</Text>
          <Ionicons name="checkmark" size={20} color={colors.primary} style={styles.buttonIcon} />
        </TouchableOpacity>
      </View>
    );
  };

  // Personnalisation du bouton Skip
  const renderSkipButton = () => {
    return (
      <View style={styles.skipButtonContainer}>
        <TouchableOpacity style={styles.skipButton}>
          <Text style={styles.skipButtonText}>Passer</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <AppIntroSlider
      data={slides}
      renderItem={renderItem}
      onDone={handleDone}
      showSkipButton
      onSkip={handleDone}
      renderNextButton={renderNextButton}
      renderDoneButton={renderDoneButton}
      renderSkipButton={renderSkipButton}
      dotStyle={styles.dot}
      activeDotStyle={styles.activeDot}
    />
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: colors.background,
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
    color: colors.dark,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    color: colors.grey,
    marginBottom: 20,
  },
  buttonContainer: {
    width: 120,
    height: 44,
    // backgroundColor: colors.primary,
    // borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.2,
    // shadowRadius: 3,
    // elevation: 3,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 5,
  },
  skipButtonContainer: {
    width: 80,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButton: {
    padding: 10,
  },
  skipButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  dot: {
    backgroundColor: 'rgba(255, 107, 0, 0.3)',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: colors.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});