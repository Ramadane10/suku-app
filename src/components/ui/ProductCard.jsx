import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import fonts from '../../constants/fonts';

const ProductCard = ({ image, name, price, style = {}, priceFirst = false, centerPrice = false }) => (
  <View style={[styles.container, style]}>
    <View style={styles.imageContainer}>
      <Image source={image} style={styles.image} resizeMode="cover" />
    </View>
    {priceFirst ? (
      <>
        <Text style={[styles.boldText, ]}>{price}</Text>
        <Text style={styles.grayText} numberOfLines={1} ellipsizeMode="tail">{name}</Text>
      </>
    ) : (
      <>
        <Text style={[styles.boldText]} numberOfLines={1} ellipsizeMode="tail">{name}</Text>
        <Text style={[styles.grayText, styles.centeredText]}>{price}</Text>
      </>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: 140,
    marginRight: 16,
    alignItems: 'flex-start',
  },
  imageContainer: {
    width: 140,
    height: 180,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  boldText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: '#333333',
    marginBottom: 4,
    lineHeight: 18,
  },
  grayText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
    lineHeight: 18,
  },
  centeredText: {
    textAlign: 'center',
    width: '100%',
  },
});

export default ProductCard;