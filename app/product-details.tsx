import { AntDesign, Feather, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
    Animated,
    Dimensions,
    Easing,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../src/constants/colors';
import fonts from '../src/constants/fonts';
import { useCart } from '../src/context/CartContext';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = width * 0.9;

const ProductDetails = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addToCart } = useCart();
  const insets = useSafeAreaInsets();

  // Récupérer les données du produit depuis les paramètres
  const productName = params.name as string || 'Produit';
  const productPrice = params.price as string || '0€/kg';
  const productCategory = params.category as string || 'FRUITS';

  // Extraire le prix par kilo du string (ex: "4.99€/kg" -> 4.99)
  const pricePerKilo = parseFloat(productPrice.replace('€/kg', '')) || 4.99;

  const [selectedWeight, setSelectedWeight] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(1))[0];

  const weightOptions = [0.5, 1, 1.5, 2, 2.5, 3];
  const totalPrice = (pricePerKilo * selectedWeight).toFixed(2);

  // Générer une image dynamique basée sur la catégorie
  const getProductImage = () => {
    switch (productCategory) {
      case 'FRUITS':
        return require('../assets/images/onboarding1.png');
      case 'LÉGUMES':
        return require('../assets/images/onboarding2.png');
      case 'BIO':
        return require('../assets/images/onboarding3.png');
      default:
        return require('../assets/images/onboarding1.png');
    }
  };

  // Générer une description dynamique basée sur la catégorie
  const getProductDescription = () => {
    switch (productCategory) {
      case 'FRUITS':
        return `${productName} frais et juteux, cultivé en agriculture biologique. Parfait pour la consommation directe ou la préparation de desserts. Récolté à maturité pour un goût sucré et une texture optimale.`;
      case 'LÉGUMES':
        return `${productName} frais et croquant, cultivé localement. Riche en vitamines et minéraux, parfait pour vos recettes culinaires. Récolté à maturité pour une saveur authentique.`;
      case 'BIO':
        return `${productName} certifié bio, cultivé sans pesticides ni engrais chimiques. Qualité premium garantie, parfait pour une alimentation saine et responsable.`;
      default:
        return `${productName} de qualité supérieure, sélectionné avec soin pour vous garantir le meilleur goût et la meilleure fraîcheur.`;
    }
  };

  // Générer des conseils de conservation basés sur la catégorie
  const getConservationTips = () => {
    switch (productCategory) {
      case 'FRUITS':
        return 'Conserver au réfrigérateur pour une fraîcheur optimale. Se conserve 5-7 jours selon la variété.';
      case 'LÉGUMES':
        return 'Conserver au réfrigérateur dans le bac à légumes. Se conserve 7-10 jours pour une fraîcheur optimale.';
      case 'BIO':
        return 'Conserver au réfrigérateur. Produit bio sans conservateurs, à consommer rapidement pour profiter de toute sa fraîcheur.';
      default:
        return 'Conserver au réfrigérateur pour une fraîcheur optimale. Se conserve 7-10 jours.';
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 150,
        easing: Easing.ease,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.ease,
        useNativeDriver: true
      })
    ]).start();
  };

  const animateWeightSelection = (weight: number) => {
    setSelectedWeight(weight);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start(() => fadeAnim.setValue(0));
  };

  const handleDecrease = () => {
    setSelectedWeight((prev) => Math.max(1, prev - 1));
  };
  const handleIncrease = () => {
    setSelectedWeight((prev) => prev + 1);
  };

  const handleAddToCart = () => {
    addToCart({
      name: productName,
      price: productPrice,
      image: getProductImage(),
      category: productCategory,
    }, selectedWeight);

    Alert.alert('Produit ajouté au panier');
    router.push('/home');
  };

  const handleBuyNow = () => {
    // addToCart({
    //   name: productName,
    //   price: productPrice,
    //   image: getProductImage(),
    //   category: productCategory,
    // }, selectedWeight);

    // Alert.alert('Achat effectué');
    router.push('/shipping');
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header avec bouton retour */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <AntDesign name="arrowleft" size={24} color={colors.dark} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Section Image */}
        <View style={styles.imageContainer}>
          <Image
            source={getProductImage()}
            style={styles.productImage}
            resizeMode="contain"
          />

          {/* Bouton favoris avec animation */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={toggleFavorite}
            activeOpacity={0.8}
          >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <MaterialCommunityIcons
                name={isFavorite ? "heart" : "heart-outline"}
                size={28}
                color={isFavorite ? colors.primary : colors.dark}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Section Info Produit */}
        <View style={styles.productInfoContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.productName}>{productName}</Text>
            <View style={styles.organicBadge}>
              <FontAwesome name="leaf" size={14} color="#fff" />
              <Text style={styles.organicText}>{productCategory}</Text>
            </View>
          </View>

          <Text style={styles.productOrigin}>Producteur local - France</Text>

          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <AntDesign
                key={star}
                name="star"
                size={16}
                color={star <= 4 ? colors.primary : colors.grey}
              />
            ))}
            <Text style={styles.ratingText}>(24 avis)</Text>
          </View>

          {/* Sélection du poids */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quantité (kg)</Text>
            <View style={styles.weightSelectorRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={handleDecrease}>
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.weightValue}>{selectedWeight} kg</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={handleIncrease}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Prix */}
          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Prix au kilo</Text>
            <Text style={styles.pricePerKilo}>{pricePerKilo}€/kg</Text>

            <View style={styles.totalPriceContainer}>
              <Text style={styles.totalPriceLabel}>Total</Text>
              <Text style={styles.totalPrice}>{totalPrice}€</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {getProductDescription()}
            </Text>
          </View>

          {/* Conseils de conservation */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conservation</Text>
            <View style={styles.tipContainer}>
              <Feather name="info" size={18} color={colors.primary} />
              <Text style={styles.tipText}>
                {getConservationTips()}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Boutons d'action fixés en bas */}
      <View style={[styles.actionContainer, { paddingBottom: 15 + insets.bottom }]}>
        <TouchableOpacity
          style={styles.cartButton}
          activeOpacity={0.8}
          onPress={handleAddToCart}
        >
          <MaterialCommunityIcons name="cart-outline" size={24} color="#fff" />
          <Text style={styles.cartButtonText}>Ajouter au panier</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyButton}
          activeOpacity={0.8}
          onPress={handleBuyNow}
        >

          <Text style={styles.buyButtonText}>Acheter maintenant</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    position: 'absolute',
    paddingTop:20,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    height: IMAGE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    marginBottom: 10,
  },
  productImage: {
    width: '80%',
    height: '80%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfoContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  productName: {
    fontFamily: fonts.bold,
    fontSize: 24,
    color: colors.dark,
    marginRight: 10,
  },
  organicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  organicText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: '#fff',
    marginLeft: 5,
  },
  productOrigin: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.grey,
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.grey,
    marginLeft: 8,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.dark,
    marginBottom: 15,
  },
  weightOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  weightOption: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: colors.light,
    borderWidth: 1,
    borderColor: colors.light,
  },
  weightOptionSelected: {
    backgroundColor: colors.secondary,
    borderColor: colors.primary,
  },
  weightText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.dark,
  },
  weightTextSelected: {
    color: colors.primary,
    fontFamily: fonts.bold,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.light,
  },
  priceLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.grey,
  },
  pricePerKilo: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.dark,
  },
  totalPriceContainer: {
    alignItems: 'flex-end',
  },
  totalPriceLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.grey,
  },
  totalPrice: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.primary,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.dark,
    lineHeight: 22,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.secondary + '40',
    borderRadius: 10,
    padding: 12,
    marginTop: 5,
  },
  tipText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.dark,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: colors.light,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  cartButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cartButtonText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#fff',
    marginLeft: 8,
  },
  buyButton: {
    flex: 1,
    backgroundColor: colors.dark,
    borderRadius: 10,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyButtonText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#fff',
  },
  weightSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  qtyBtnText: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.dark,
  },
  weightValue: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.primary,
    minWidth: 60,
    textAlign: 'center',
  },
});

export default ProductDetails;