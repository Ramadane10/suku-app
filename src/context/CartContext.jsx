import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartId, setCartId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Charger le panier depuis Supabase
  const loadCart = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Récupérer ou créer le panier actif
      let { data: cart, error: cartError } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (cartError && cartError.code !== 'PGRST116') {
        // PGRST116 = no rows returned, on crée un nouveau panier
        const { data: newCart, error: newCartError } = await supabase
          .from('carts')
          .insert([{ user_id: user.id, status: 'active' }])
          .select('id')
          .single();

        if (newCartError) {
          console.error('Error creating cart:', newCartError);
          setLoading(false);
          return;
        }
        cart = newCart;
      }

      if (!cart) {
        // Créer un nouveau panier si aucun n'existe
        const { data: newCart, error: newCartError } = await supabase
          .from('carts')
          .insert([{ user_id: user.id, status: 'active' }])
          .select('id')
          .single();

        if (newCartError) {
          console.error('Error creating cart:', newCartError);
          setLoading(false);
          return;
        }
        cart = newCart;
      }

      setCartId(cart.id);

      // Charger les items du panier avec les infos produits
      const { data: items, error: itemsError } = await supabase
        .from('cart_items')
        .select(`
          id,
          quantity_kg,
          unit_price,
          total_price,
          product:products(id, name, image_url, price_per_kg, category:categories(name))
        `)
        .eq('cart_id', cart.id);

      if (itemsError) {
        console.error('Error loading cart items:', itemsError);
        setLoading(false);
        return;
      }

      // Transformer les données pour correspondre au format attendu
      const formattedItems = (items || []).map(item => {
        const pricePerKilo = parseFloat(item.unit_price);
        let imageSource;
        if (item.product?.image_url) {
          imageSource = { uri: item.product.image_url };
        } else {
          // Image par défaut
          try {
            imageSource = require('../../assets/images/onboarding1.png');
          } catch {
            imageSource = { uri: 'https://via.placeholder.com/150' };
          }
        }
        
        return {
          id: item.id,
          productId: item.product?.id,
          name: item.product?.name || 'Produit',
          price: `${pricePerKilo}€/kg`,
          pricePerKilo: pricePerKilo,
          image: imageSource,
          category: item.product?.category?.name || 'FRUITS',
          quantity: parseFloat(item.quantity_kg),
          totalPrice: parseFloat(item.total_price).toFixed(2),
        };
      });

      setCartItems(formattedItems);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setCartItems([]);
      setCartId(null);
      setLoading(false);
    }
  }, [user, loadCart]);

  // Obtenir ou créer le panier
  const getOrCreateCart = async () => {
    if (!user) return null;

    if (cartId) return cartId;

    const { data: cart, error } = await supabase
      .from('carts')
      .insert([{ user_id: user.id, status: 'active' }])
      .select('id')
      .single();

    if (error) {
      console.error('Error creating cart:', error);
      return null;
    }

    setCartId(cart.id);
    return cart.id;
  };

  // Ajouter un produit au panier
  const addToCart = useCallback(async (product, weight = 1) => {
    if (!user) {
      console.warn('User must be logged in to add to cart');
      return;
    }

    try {
      const currentCartId = await getOrCreateCart();
      if (!currentCartId) return;

      // Extraire le productId depuis le produit
      const productId = product.id || product.productId;
      if (!productId) {
        console.error('Product ID is required');
        return;
      }

      const pricePerKilo = product.pricePerKilo || parseFloat(product.price?.replace('€/kg', '') || '0');
      const quantityKg = parseFloat(weight);
      const totalPrice = pricePerKilo * quantityKg;

      // Vérifier si le produit existe déjà dans le panier
      const { data: existingItem, error: checkError } = await supabase
        .from('cart_items')
        .select('id, quantity_kg, total_price')
        .eq('cart_id', currentCartId)
        .eq('product_id', productId)
        .single();

      if (existingItem && !checkError) {
        // Mettre à jour la quantité
        const newQuantity = parseFloat(existingItem.quantity_kg) + quantityKg;
        const newTotalPrice = pricePerKilo * newQuantity;

        const { error: updateError } = await supabase
          .from('cart_items')
          .update({
            quantity_kg: newQuantity,
            total_price: newTotalPrice,
          })
          .eq('id', existingItem.id);

        if (updateError) {
          console.error('Error updating cart item:', updateError);
          return;
        }
      } else {
        // Créer un nouvel item
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert([{
            cart_id: currentCartId,
            product_id: productId,
            quantity_kg: quantityKg,
            unit_price: pricePerKilo,
            total_price: totalPrice,
          }]);

        if (insertError) {
          console.error('Error adding to cart:', insertError);
          return;
        }
      }

      // Mettre à jour l'état local immédiatement pour une meilleure UX
      setCartItems(prevItems => {
        const existingIndex = prevItems.findIndex(item => item.productId === productId);
        if (existingIndex >= 0) {
          const updated = [...prevItems];
          const existing = updated[existingIndex];
          updated[existingIndex] = {
            ...existing,
            quantity: parseFloat(existing.quantity) + quantityKg,
            totalPrice: (parseFloat(existing.pricePerKilo) * (parseFloat(existing.quantity) + quantityKg)).toFixed(2),
          };
          return updated;
        } else {
          return [...prevItems, {
            id: `temp-${Date.now()}`,
            productId,
            name: product.name,
            price: `${pricePerKilo}€/kg`,
            pricePerKilo,
            image: product.image,
            category: product.category,
            quantity: quantityKg,
            totalPrice: totalPrice.toFixed(2),
          }];
        }
      });

      // Recharger le panier en arrière-plan pour synchroniser
      loadCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      // En cas d'erreur, recharger pour avoir l'état correct
      loadCart();
    }
  }, [user, loadCart]);

  // Supprimer un produit du panier
  const removeFromCart = useCallback(async (cartItemId) => {
    if (!user || !cartItemId) return;

    // Mettre à jour l'état local immédiatement
    setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) {
        console.error('Error removing from cart:', error);
        // En cas d'erreur, recharger pour avoir l'état correct
        loadCart();
        return;
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      loadCart();
    }
  }, [user, loadCart]);

  // Modifier la quantité d'un produit
  const updateQuantity = useCallback(async (cartItemId, newQuantity) => {
    if (!user || !cartItemId) return;

    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    // Mettre à jour l'état local immédiatement
    setCartItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === cartItemId) {
          const newTotalPrice = item.pricePerKilo * parseFloat(newQuantity);
          return {
            ...item,
            quantity: parseFloat(newQuantity),
            totalPrice: newTotalPrice.toFixed(2),
          };
        }
        return item;
      });
    });

    try {
      // Récupérer l'item pour obtenir le prix unitaire
      const { data: item, error: fetchError } = await supabase
        .from('cart_items')
        .select('unit_price')
        .eq('id', cartItemId)
        .single();

      if (fetchError || !item) {
        console.error('Error fetching cart item:', fetchError);
        loadCart();
        return;
      }

      const newTotalPrice = parseFloat(item.unit_price) * parseFloat(newQuantity);

      const { error } = await supabase
        .from('cart_items')
        .update({
          quantity_kg: parseFloat(newQuantity),
          total_price: newTotalPrice,
        })
        .eq('id', cartItemId);

      if (error) {
        console.error('Error updating quantity:', error);
        loadCart();
        return;
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      loadCart();
    }
  }, [user, removeFromCart, loadCart]);

  // Calculer le total du panier (mémorisé)
  const getCartTotal = useCallback(() => {
    return cartItems
      .reduce((total, item) => total + parseFloat(item.totalPrice || 0), 0)
      .toFixed(2);
  }, [cartItems]);

  // Obtenir le nombre total d'articles (mémorisé)
  const getCartCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + (item.quantity || 0), 0);
  }, [cartItems]);

  // Vider le panier
  const clearCart = useCallback(async () => {
    if (!user || !cartId) {
      setCartItems([]);
      return;
    }

    // Mettre à jour l'état local immédiatement
    setCartItems([]);

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId);

      if (error) {
        console.error('Error clearing cart:', error);
        // En cas d'erreur, recharger pour avoir l'état correct
        loadCart();
        return;
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      loadCart();
    }
  }, [user, cartId, loadCart]);

  const value = useMemo(() => ({
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartCount,
    clearCart,
    refreshCart: loadCart,
  }), [cartItems, loading, getCartTotal, getCartCount]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 