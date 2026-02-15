import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import fonts from '../../constants/fonts';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useTheme } from '../../hooks/useTheme';

const ProductCard = ({
  id,
  productId,
  name,
  price,
  image,
  priceFirst = false,
  centerPrice = false,
  tallImage = false,
  stockQuantity,
  onPress,
  ...props
}) => {
  const router = useRouter();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { addToCart } = useCart();
  const { colors } = useTheme();

  // Utiliser productId ou id
  const actualProductId = productId || id;
  const isOutOfStock = stockQuantity !== undefined && stockQuantity !== null && stockQuantity <= 0;
  const hasLowStock = stockQuantity !== undefined && stockQuantity !== null && stockQuantity > 0 && stockQuantity < 5;

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
      return;
    }
    
    router.push({
      pathname: '/product-details',
      params: {
        productId: actualProductId,
        name: name,
        price: price,
        image: typeof image === 'object' && image?.uri ? image.uri : undefined,
        category: props.category || 'FRUITS',
      }
    });
  }, [actualProductId, name, price, image, props.category, router, onPress]);

  const handleToggleFavorite = useCallback((e) => {
    e.stopPropagation();
    
    if (!actualProductId) {
      console.warn('Product ID is required to toggle favorite');
      return;
    }

    if (isFavorite(actualProductId)) {
      removeFavorite(actualProductId);
    } else {
      addFavorite({ 
        id: actualProductId,
        productId: actualProductId,
        name, 
        price, 
        image, 
        category: props.category || 'FRUITS' 
      });
    }
  }, [actualProductId, name, price, image, props.category, isFavorite, addFavorite, removeFavorite]);

  const handleAddToCart = useCallback(async (e) => {
    e.stopPropagation();
    
    if (!actualProductId) {
      console.warn('Product ID is required to add to cart');
      return;
    }

    try {
      await addToCart(
        {
          id: actualProductId,
          productId: actualProductId,
          name,
          price,
          pricePerKilo: parseFloat(price?.replace('€/kg', '') || '0'),
          image,
          category: props.category || 'FRUITS',
        },
        1
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }, [actualProductId, name, price, image, props.category, addToCart]);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        tallImage && styles.tallCard,
        props.style
      ]}
      onPress={handlePress}
      activeOpacity={0.5}
      delayPressIn={0}
    >
      <View style={[styles.imageContainer, { backgroundColor: colors.light }]}>
        <Image
          source={image}
          style={[
            styles.image,
            tallImage && styles.tallImage
          ]}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={[styles.favBtn, { backgroundColor: colors.surface }]}
          onPress={handleToggleFavorite}
          activeOpacity={0.3}
          delayPressIn={0}
        >
          <Ionicons
            name={actualProductId && isFavorite(actualProductId) ? 'heart' : 'heart-outline'}
            size={20}
            color={actualProductId && isFavorite(actualProductId) ? colors.danger : colors.grey}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.cartBtn, { backgroundColor: colors.surface }]}
          onPress={handleAddToCart}
          activeOpacity={0.3}
          delayPressIn={0}
          disabled={isOutOfStock}
        >
          <Ionicons 
            name="cart-outline" 
            size={18} 
            color={isOutOfStock ? colors.grey : colors.primary} 
          />
        </TouchableOpacity>
        
        {/* Badge stock */}
        {isOutOfStock && (
          <View style={[styles.stockBadge, { backgroundColor: colors.danger }]}>
            <Text style={styles.stockBadgeText}>Rupture</Text>
          </View>
        )}
        {hasLowStock && !isOutOfStock && (
          <View style={[styles.stockBadge, { backgroundColor: '#FFA500' }]}>
            <Text style={styles.stockBadgeText}>Stock faible</Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        {priceFirst ? (
          <>
            <Text
              style={[styles.price, { color: colors.textSecondary }, centerPrice && styles.centeredText]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {price}
            </Text>
            <Text
              style={[styles.name, { color: colors.text }, centerPrice && styles.centeredText]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {name}
            </Text>
          </>
        ) : (
          <>
            <Text
              style={[styles.name, { color: colors.text }, centerPrice && styles.centeredText]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {name}
            </Text>
            <Text
              style={[styles.price, { color: colors.textSecondary }, centerPrice && styles.centeredText]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {price}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 140,
    marginRight: 16,
    alignItems: 'flex-start',
  },
  tallCard: {
    width: 140,
  },
  imageContainer: {
    width: 140,
    height: 180,
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
  tallImage: {
    height: 220,
  },
  content: {
    width: '100%',
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 18,
  },
  price: {
    fontFamily: fonts.medium,
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 18,
  },
  centeredText: {
    textAlign: 'center',
    width: '100%',
  },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 16,
    padding: 4,
    zIndex: 2,
    elevation: 2,
  },
  cartBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    borderRadius: 16,
    padding: 6,
    zIndex: 2,
    elevation: 2,
  },
  stockBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 2,
    elevation: 2,
  },
  stockBadgeText: {
    color: '#fff',
    fontFamily: fonts.bold,
    fontSize: 10,
  },
});

export default ProductCard;