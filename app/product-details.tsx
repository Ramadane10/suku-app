import { AntDesign, Feather, FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import fonts from '../src/constants/fonts';
import { useCustomAlert } from '../src/context/AlertContext';
import { useAuth } from '../src/context/AuthContext';
import { useCart } from '../src/context/CartContext';
import { useFavorites } from '../src/context/FavoritesContext';
import { useOrder } from '../src/context/OrderContext';
import { useProductImages } from '../src/hooks/useProductImages';
import { useReviews } from '../src/hooks/useReviews';
import { useTheme } from '../src/hooks/useTheme';
import { supabase } from '../src/lib/supabase';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = width * 0.9;

const ProductDetails = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addToCart } = useCart();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { user } = useAuth();
  const { setDirectPurchaseProduct } = useOrder();
  const { showSuccess, showError, showInfo } = useCustomAlert();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  // Récupérer les données du produit depuis les paramètres
  const productId = params.productId as string;
  const { reviews, stats, loading: reviewsLoading, createOrUpdateReview, getUserReview } = useReviews(productId);
  const { images: productImages, getPrimaryImage, getAllImages } = useProductImages(productId);
  const userReview = getUserReview();
  const productName = params.name as string || 'Produit';
  const productPrice = params.price as string || '0€/kg';
  const productCategory = params.category as string || 'FRUITS';
  const productImage = params.image as string;

  // Extraire le prix par kilo du string (ex: "4.99€/kg" -> 4.99)
  const pricePerKilo = parseFloat(productPrice.replace('€/kg', '')) || 4.99;

  const [selectedWeight, setSelectedWeight] = useState(1);
  const [productStock, setProductStock] = useState<number | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(userReview?.rating || 0);
  const [reviewComment, setReviewComment] = useState(userReview?.comment || '');
  const [submittingReview, setSubmittingReview] = useState(false);
  const favoriteStatus = productId ? isFavorite(productId) : false;
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(1))[0];

  // Charger les informations complètes du produit depuis Supabase (pour le stock)
  React.useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setLoadingProduct(false);
        return;
      }

      try {
        setLoadingProduct(true);
        const { data: products, error } = await supabase
          .from('products')
          .select('stock_quantity, price_per_kg, name, image_url')
          .eq('id', productId)
          .limit(1);

        const data = (products && products.length > 0) ? products[0] : null;

        if (error) {
          console.error('Error fetching product:', error);
        } else if (data) {
          setProductStock(parseFloat(data.stock_quantity || 0));
          // Mettre à jour le prix si disponible depuis Supabase
          if (data.price_per_kg) {
            // Le prix est déjà dans les params, on garde celui-ci
          }
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const isOutOfStock = productStock !== null && productStock <= 0;
  const availableStock = productStock !== null ? productStock : 999;

  const weightOptions = [0.5, 1, 1.5, 2, 2.5, 3];
  const totalPrice = (pricePerKilo * selectedWeight).toFixed(2);

  // Générer une image dynamique basée sur la catégorie ou utiliser les images multiples
  const getProductImage = () => {
    // Priorité 1: Images depuis Supabase (product_images)
    const primaryImage = getPrimaryImage();
    if (primaryImage) {
      const imageUrl = primaryImage.image_url || primaryImage.url;
      if (imageUrl) {
        return { uri: imageUrl };
      }
    }

    // Priorité 2: Image depuis les paramètres
    if (productImage) {
      return { uri: productImage };
    }

    // Priorité 3: Image par défaut selon la catégorie
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

  // Obtenir toutes les images pour la galerie
  const allImages = getAllImages() || [];
  const hasMultipleImages = allImages.length > 1;

  // Si pas d'images depuis Supabase mais qu'on a une image depuis params, l'ajouter
  const displayImages = allImages.length > 0
    ? allImages.map(img => ({ uri: img.image_url || img.url || '' }))
    : productImage
      ? [{ uri: productImage }]
      : [getProductImage()];

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

  const toggleFavorite = async () => {
    if (!user) {
      showError('Connexion requise', 'Veuillez vous connecter pour ajouter des favoris.');
      router.push('/login');
      return;
    }

    if (!productId) {
      console.warn('Product ID is required to toggle favorite');
      return;
    }

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

    if (favoriteStatus) {
      await removeFavorite(productId);
    } else {
      await addFavorite({
        id: productId,
        name: productName,
        price: productPrice,
        image: getProductImage(),
        category: productCategory,
      });
    }
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
    setSelectedWeight((prev) => Math.max(0.5, prev - 0.5));
  };
  const handleIncrease = () => {
    if (productStock !== null) {
      setSelectedWeight((prev) => {
        if (prev < availableStock) {
          return Math.min(prev + 0.5, availableStock);
        }
        return prev;
      });
    } else {
      setSelectedWeight((prev) => prev + 0.5);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      showError('Connexion requise', 'Veuillez vous connecter pour ajouter des produits au panier.');
      router.push('/login');
      return;
    }

    if (!productId) {
      console.error('Product ID is missing:', { productId, productName, productPrice });
      showError(
        'Erreur',
        'Impossible d\'ajouter ce produit au panier. Le produit n\'a pas d\'identifiant valide.'
      );
      return;
    }

    try {
      await addToCart({
        id: productId,
        productId: productId,
        name: productName,
        price: productPrice,
        pricePerKilo: pricePerKilo,
        image: getProductImage(),
        category: productCategory,
      }, selectedWeight);

      showSuccess('Succès', 'Produit ajouté au panier');
      router.push('/home');
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      showError(
        'Erreur',
        error?.message || 'Impossible d\'ajouter le produit au panier. Veuillez réessayer.'
      );
    }
  };

  const handleReviewSubmit = async (rating?: number, comment?: string) => {
    if (!user) {
      showError('Connexion requise', 'Veuillez vous connecter pour laisser un avis.');
      router.push('/login');
      return;
    }

    if (!productId) {
      showError('Erreur', 'Impossible de laisser un avis. Le produit n\'a pas d\'identifiant valide.');
      return;
    }

    const finalRating = rating || reviewRating;
    const finalComment = comment || reviewComment;

    if (finalRating < 1 || finalRating > 5) {
      showError('Erreur', 'Veuillez sélectionner une note entre 1 et 5 étoiles.');
      return;
    }

    setSubmittingReview(true);
    try {
      await createOrUpdateReview(productId, finalRating, finalComment);
      showSuccess('Succès', 'Votre avis a été enregistré avec succès.');
      setShowReviewForm(false);
      setReviewRating(0);
      setReviewComment('');
    } catch (error: any) {
      showError('Erreur', error.message || 'Impossible d\'enregistrer votre avis.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      showError('Connexion requise', 'Veuillez vous connecter pour effectuer un achat.');
      router.push('/login');
      return;
    }

    if (!productId) {
      showError('Erreur', 'Impossible d\'acheter ce produit. Le produit n\'a pas d\'identifiant valide.');
      return;
    }

    if (isOutOfStock) {
      showError('Rupture de stock', 'Ce produit est actuellement en rupture de stock.');
      return;
    }

    if (selectedWeight > availableStock) {
      showError('Stock insuffisant', `Il ne reste que ${availableStock.toFixed(2)} kg disponible pour ce produit.`);
      return;
    }

    try {
      // Stocker le produit pour l'achat direct
      setDirectPurchaseProduct({
        id: productId,
        productId: productId,
        name: productName,
        price: productPrice,
        pricePerKilo: pricePerKilo,
        image: getProductImage(),
        category: productCategory,
        quantity: selectedWeight,
        totalPrice: (pricePerKilo * selectedWeight).toFixed(2),
      });

      // Naviguer vers la page de livraison
      router.push('/shipping');
    } catch (error: any) {
      console.error('Error setting up direct purchase:', error);
      showError('Erreur', 'Impossible de procéder à l\'achat. Veuillez réessayer.');
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header avec boutons retour et favoris */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.iconButton, { backgroundColor: colors.surface }]}
          activeOpacity={0.3}
          delayPressIn={0}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.favoriteButtonHeader, { backgroundColor: colors.surface }]}
          onPress={toggleFavorite}
          activeOpacity={0.3}
          delayPressIn={0}
        >
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <MaterialCommunityIcons
              name={favoriteStatus ? "heart" : "heart-outline"}
              size={28}
              color={favoriteStatus ? colors.primary : colors.text}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}
      >
        {/* Section Image avec galerie */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const offsetX = event.nativeEvent.contentOffset.x;
              const index = Math.round(offsetX / width);
              setSelectedImageIndex(index);
            }}
            scrollEventThrottle={16}
            style={styles.imageGallery}
          >
            {displayImages.map((img, index) => (
              <Image
                key={index}
                source={img}
                style={styles.productImage}
                contentFit="contain"
                transition={200}
              />
            ))}
          </ScrollView>

          {/* Indicateurs de pagination si plusieurs images */}
          {hasMultipleImages && displayImages.length > 1 && (
            <View style={styles.imageIndicators}>
              {displayImages.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    {
                      backgroundColor: selectedImageIndex === index ? colors.primary : colors.grey,
                    },
                  ]}
                />
              ))}
            </View>
          )}

          {/* Badge stock lowered to avoid header overlap */}
          {isOutOfStock && (
            <View style={[styles.stockBadge, { backgroundColor: colors.danger, top: 100 }]}>
              <Text style={styles.stockBadgeText}>Rupture de stock</Text>
            </View>
          )}
          {!isOutOfStock && productStock !== null && productStock > 0 && (
            <View style={[styles.stockBadge, { backgroundColor: colors.success || colors.primary, top: 100 }]}>
              <Text style={styles.stockBadgeText}>
                {availableStock.toFixed(2)} kg disponible
              </Text>
            </View>
          )}

        </View>

        {/* Section Info Produit */}
        <View style={styles.productInfoContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.productName, { color: colors.text }]}>{productName}</Text>
            <View style={[styles.organicBadge, { backgroundColor: colors.primary }]}>
              <FontAwesome name="leaf" size={14} color="#fff" />
              <Text style={styles.organicText}>{productCategory}</Text>
            </View>
          </View>

          <Text style={[styles.productOrigin, { color: colors.textSecondary }]}>Producteur local - France</Text>

          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <AntDesign
                key={star}
                name="star"
                size={16}
                color={star <= (stats?.averageRating || 0) ? colors.primary : colors.grey}
              />
            ))}
            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
              {stats ? `(${stats.totalReviews} avis)` : '(Aucun avis)'}
            </Text>
            {stats && stats.averageRating > 0 && (
              <Text style={[styles.ratingValue, { color: colors.primary }]}>
                {stats.averageRating.toFixed(1)}
              </Text>
            )}
          </View>

          {/* Sélection du poids */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quantité (kg)</Text>
            <View style={styles.weightSelectorRow}>
              <TouchableOpacity style={[styles.qtyBtn, { backgroundColor: colors.secondary }]} onPress={handleDecrease}>
                <Text style={[styles.qtyBtnText, { color: colors.text }]}>-</Text>
              </TouchableOpacity>
              <Text style={[styles.weightValue, { color: colors.primary }]}>{selectedWeight} kg</Text>
              <TouchableOpacity style={[styles.qtyBtn, { backgroundColor: colors.secondary }]} onPress={handleIncrease}>
                <Text style={[styles.qtyBtnText, { color: colors.text }]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Prix */}
          <View style={[styles.priceSection, { borderColor: colors.border }]}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Prix au kilo</Text>
            <Text style={[styles.pricePerKilo, { color: colors.text }]}>{pricePerKilo}€/kg</Text>

            <View style={styles.totalPriceContainer}>
              <Text style={[styles.totalPriceLabel, { color: colors.textSecondary }]}>Total</Text>
              <Text style={[styles.totalPrice, { color: colors.primary }]}>{totalPrice}€</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
            <Text style={[styles.description, { color: colors.text }]}>
              {getProductDescription()}
            </Text>
          </View>

          {/* Conseils de conservation */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Conservation</Text>
            <View style={[styles.tipContainer, { backgroundColor: colors.secondary + '40' }]}>
              <Feather name="info" size={18} color={colors.primary} />
              <Text style={[styles.tipText, { color: colors.text }]}>
                {getConservationTips()}
              </Text>
            </View>
          </View>

          {/* Section Avis */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Avis clients</Text>

            {userReview ? (
              <View style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.reviewTitle, { color: colors.text }]}>Votre avis</Text>
                <View style={styles.starRating}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => handleReviewSubmit(star, userReview.comment || '')}
                    >
                      <AntDesign
                        name="star"
                        size={24}
                        color={star <= userReview.rating ? colors.primary : colors.grey}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                {userReview.comment && (
                  <Text style={[styles.reviewComment, { color: colors.text }]}>{userReview.comment}</Text>
                )}
                <TouchableOpacity
                  style={[styles.editReviewBtn, { borderColor: colors.primary }]}
                  onPress={() => setShowReviewForm(true)}
                >
                  <Text style={[styles.editReviewText, { color: colors.primary }]}>Modifier mon avis</Text>
                </TouchableOpacity>
              </View>
            ) : user ? (
              <TouchableOpacity
                style={[styles.addReviewBtn, { backgroundColor: colors.primary }]}
                onPress={() => setShowReviewForm(true)}
              >
                <Ionicons name="star-outline" size={20} color="#fff" />
                <Text style={styles.addReviewText}>Laisser un avis</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.addReviewBtn, { backgroundColor: colors.primary }]}
                onPress={() => {
                  showError('Connexion requise', 'Veuillez vous connecter pour laisser un avis.');
                  router.push('/login');
                }}
              >
                <Ionicons name="star-outline" size={20} color="#fff" />
                <Text style={styles.addReviewText}>Connectez-vous pour laisser un avis</Text>
              </TouchableOpacity>
            )}

            {/* Liste des avis */}
            {reviews.length > 0 && (
              <View style={styles.reviewsList}>
                {reviews.slice(0, 5).map((review) => (
                  <View key={review.id} style={[styles.reviewItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.reviewHeader}>
                      <Text style={[styles.reviewAuthor, { color: colors.text }]}>
                        {review.profiles?.full_name || review.profiles?.email || 'Utilisateur anonyme'}
                      </Text>
                      <View style={styles.reviewStars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <AntDesign
                            key={star}
                            name="star"
                            size={12}
                            color={star <= review.rating ? colors.primary : colors.grey}
                          />
                        ))}
                      </View>
                    </View>
                    {review.comment && (
                      <Text style={[styles.reviewComment, { color: colors.textSecondary }]}>{review.comment}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Modal pour créer/modifier un avis */}
      <Modal
        visible={showReviewForm}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowReviewForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {userReview ? 'Modifier mon avis' : 'Laisser un avis'}
              </Text>
              <TouchableOpacity onPress={() => setShowReviewForm(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalLabel, { color: colors.text }]}>Note</Text>
            <View style={styles.starRating}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setReviewRating(star)}
                >
                  <AntDesign
                    name="star"
                    size={32}
                    color={star <= reviewRating ? colors.primary : colors.grey}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.modalLabel, { color: colors.text, marginTop: 16 }]}>Commentaire (optionnel)</Text>
            <TextInput
              style={[styles.reviewInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Partagez votre expérience..."
              placeholderTextColor={colors.textSecondary}
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => {
                  setShowReviewForm(false);
                  setReviewRating(userReview?.rating || 0);
                  setReviewComment(userReview?.comment || '');
                }}
              >
                <Text style={[styles.cancelBtnText, { color: colors.text }]}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.primary }, submittingReview && styles.submitBtnDisabled]}
                onPress={() => handleReviewSubmit()}
                disabled={submittingReview || reviewRating === 0}
              >
                {submittingReview ? (
                  <Text style={styles.submitBtnText}>Enregistrement...</Text>
                ) : (
                  <Text style={styles.submitBtnText}>Enregistrer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Boutons d'action fixés en bas */}
      <View style={[styles.actionContainer, { paddingBottom: 15 + insets.bottom, backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.cartButton, { backgroundColor: isOutOfStock ? colors.grey : colors.primary }, isOutOfStock && styles.buttonDisabled]}
          activeOpacity={0.5}
          delayPressIn={0}
          onPress={handleAddToCart}
          disabled={isOutOfStock}
        >
          <MaterialCommunityIcons name="cart-outline" size={24} color="#fff" />
          <Text style={styles.cartButtonText}>
            {isOutOfStock ? 'Rupture de stock' : 'Ajouter au panier'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buyButton, { backgroundColor: isOutOfStock ? colors.grey : colors.primary }, isOutOfStock && styles.buttonDisabled]}
          activeOpacity={0.5}
          delayPressIn={0}
          onPress={handleBuyNow}
          disabled={isOutOfStock}
        >
          <Text style={styles.buyButtonText}>
            {isOutOfStock ? 'Indisponible' : 'Acheter maintenant'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    paddingTop: 20,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    position: 'relative',
  },
  imageGallery: {
    width: width,
    height: IMAGE_HEIGHT,
  },
  productImage: {
    width: width,
    height: IMAGE_HEIGHT,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stockBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  stockBadgeText: {
    color: '#fff',
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  favoriteButtonHeader: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    marginRight: 10,
  },
  organicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginLeft: 8,
  },
  ratingValue: {
    fontFamily: fonts.bold,
    fontSize: 14,
    marginLeft: 8,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontFamily: fonts.bold,
    fontSize: 18,
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
    borderWidth: 1,
  },
  weightOptionSelected: {
    // Styles gérés dynamiquement
  },
  weightText: {
    fontFamily: fonts.medium,
    fontSize: 15,
  },
  weightTextSelected: {
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
  },
  priceLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  pricePerKilo: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  totalPriceContainer: {
    alignItems: 'flex-end',
  },
  totalPriceLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  totalPrice: {
    fontFamily: fonts.bold,
    fontSize: 22,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 10,
    padding: 12,
    marginTop: 5,
  },
  tipText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  cartButton: {
    flex: 1,
    flexDirection: 'row',
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
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  qtyBtnText: {
    fontFamily: fonts.bold,
    fontSize: 22,
  },
  weightValue: {
    fontFamily: fonts.bold,
    fontSize: 20,
    minWidth: 60,
    textAlign: 'center',
  },
  reviewCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  reviewTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    marginBottom: 8,
  },
  starRating: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  reviewComment: {
    fontFamily: fonts.regular,
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  editReviewBtn: {
    marginTop: 12,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  editReviewText: {
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  addReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  addReviewText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#fff',
    marginLeft: 8,
  },
  reviewsList: {
    marginTop: 16,
  },
  reviewItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAuthor: {
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
  },
  modalLabel: {
    fontFamily: fonts.medium,
    fontSize: 16,
    marginBottom: 8,
  },
  reviewInput: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    minHeight: 100,
    textAlignVertical: 'top',
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  submitBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#fff',
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  stockBadgeSimple: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  stockText: {
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  stockWarning: {
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  qtyBtnDisabled: {
    opacity: 0.5,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default ProductDetails;