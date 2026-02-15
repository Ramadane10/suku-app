import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import fonts from '../../constants/fonts';

// Images pour chaque catégorie
const categoryImages = {
  'TOUS': require('../../../assets/images/onboarding1.png'),
  'CLOTHING': require('../../../assets/images/onboarding1.png'),
  'ACCESSORIES': require('../../../assets/images/onboarding2.png'),
  'SHOES': require('../../../assets/images/onboarding3.png'),
  // Catégories réelles de l'app
  'FRUITS': require('../../../assets/images/onboarding1.png'),
  'LEGUMES': require('../../../assets/images/onboarding2.png'),
  'BIO': require('../../../assets/images/onboarding3.png'),
  'EPICES': require('../../../assets/images/onboarding2.png'),
};

// Normaliser les libellés pour faire correspondre les clés des images
const normalizeCat = (s) =>
  (s || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();

const CategoryTabs = ({ categories, selected, onSelect }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
    {categories.map((cat) => (
      <TouchableOpacity
        key={cat}
        style={[
          styles.tab, 
          selected === cat && styles.selectedTab
        ]}
        onPress={() => onSelect(cat)}
      >
        <Image
          source={categoryImages[normalizeCat(cat)] || require('../../../assets/images/onboarding1.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
        <View style={[
          styles.overlay,
          selected === cat && styles.selectedOverlay
        ]}>
          <Text style={[styles.tabText, styles.boldText, selected === cat && styles.selectedTabText]}>
            {cat}
          </Text>
        </View>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 8,
    marginLeft: 16,
  },
  tab: {
    width: 120,
    height: 60,
    marginRight: 10,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedTab: {
    borderWidth: 2,
    borderColor: '#FF6B00',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  selectedOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  tabText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
  },
  selectedTabText: {
    color: '#ffffff',
    fontFamily: fonts.bold,
  },
  boldText: {
    fontFamily: fonts.bold,
  },
});

export default CategoryTabs;