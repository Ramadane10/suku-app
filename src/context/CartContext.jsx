import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
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
  const loadCart = useCallback(async (showLoader = true) => {
    if (!user) return;

    try {
      if (showLoader) setLoading(true);

      // Récupérer ou créer le panier actif
      let { data: carts, error: cartError } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1);

      let cart = (carts && carts.length > 0) ? carts[0] : null;

      if (!cart && !cartError) {
        // Aucun panier actif trouvé, on en crée un
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
      } else if (cartError) {
        console.error('Error fetching cart:', cartError);
        setLoading(false);
        return;
      }

      if (cart) {
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
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      if (showLoader) setLoading(false);
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

    // Vérifier d'abord s'il existe déjà un panier actif
    const { data: existingCarts, error: fetchError } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1);

    if (existingCarts && existingCarts.length > 0) {
      setCartId(existingCarts[0].id);
      return existingCarts[0].id;
    }

    // Sinon en créer un nouveau
    const { data: cart, error } = await supabase
      .from('carts')
      .insert([{ user_id: user.id, status: 'active' }])
      .select('id')
      .single();

    if (error) {
      console.error('Error creating cart:', error);
      throw new Error("Impossible de créer le panier. Veuillez vérifier votre connexion.");
    }

    setCartId(cart.id);
    return cart.id;
  };

  // Ajouter un produit au panier
  const addToCart = useCallback(async (product, weight = 1) => {
    if (!user) {
      throw new Error("Vous devez être connecté pour ajouter des produits au panier");
    }

    const previousItems = [...cartItems];
    try {
      const currentCartId = await getOrCreateCart();
      if (!currentCartId) {
        throw new Error("Impossible d'accéder à votre panier");
      }

      // Extraire le productId depuis le produit
      const productId = product.id || product.productId;
      if (!productId) {
        throw new Error("Identifiant produit manquant");
      }

      // Vérifier le stock disponible
      const { data: productsData, error: productError } = await supabase
        .from('products')
        .select('stock_quantity, price_per_kg')
        .eq('id', productId)
        .single();

      if (productError || !productsData) {
        console.error('Error fetching product:', productError);
        throw new Error("Produit introuvable en magasin");
      }

      const stockQuantity = parseFloat(productsData.stock_quantity || 0);
      const quantityKg = parseFloat(weight);

      // Vérifier si le produit est en stock
      if (stockQuantity <= 0) {
        throw new Error("Ce produit est actuellement en rupture de stock");
      }

      // Vérifier si la quantité demandée est disponible
      const { data: existingCartItems } = await supabase
        .from('cart_items')
        .select('id, quantity_kg')
        .eq('cart_id', currentCartId)
        .eq('product_id', productId)
        .limit(1);

      const existingCartItem = (existingCartItems && existingCartItems.length > 0) ? existingCartItems[0] : null;
      const currentCartQuantity = existingCartItem ? parseFloat(existingCartItem.quantity_kg || 0) : 0;
      const totalRequested = currentCartQuantity + quantityKg;

      if (totalRequested > stockQuantity) {
        const available = stockQuantity - currentCartQuantity;
        if (available <= 0) {
          throw new Error("Stock insuffisant. Ce produit est déjà dans votre panier en quantité maximale.");
        }
        throw new Error(`Stock insuffisant. Il ne reste que ${available.toFixed(2)} kg disponible.`);
      }

      const pricePerKilo = product.pricePerKilo || parseFloat(product.price?.replace('€/kg', '') || '0') || productsData.price_per_kg;
      const totalPrice = pricePerKilo * quantityKg;

      // MISE À JOUR OPTIMISTE
      if (existingCartItem) {
        setCartItems(prev => prev.map(item =>
          item.id === existingCartItem.id
            ? { ...item, quantity: item.quantity + quantityKg, totalPrice: (parseFloat(item.totalPrice) + totalPrice).toFixed(2) }
            : item
        ));

        const { error: updateError } = await supabase
          .from('cart_items')
          .update({
            quantity_kg: currentCartQuantity + quantityKg,
            total_price: (currentCartQuantity + quantityKg) * pricePerKilo,
          })
          .eq('id', existingCartItem.id);

        if (updateError) throw updateError;
      } else {
        // Pour un nouvel item, on attend SQL pour avoir l'ID, mais on peut rafraîchir en fond
        const { error: insertError } = await supabase
          .from('cart_items')
          .insert([{
            cart_id: currentCartId,
            product_id: productId,
            quantity_kg: quantityKg,
            unit_price: pricePerKilo,
            total_price: totalPrice,
          }]);

        if (insertError) throw insertError;
      }

      // Recharger le panier pour synchroniser proprement (en arrière-plan)
      await loadCart(false);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setCartItems(previousItems); // Rollback
      throw error;
    }
  }, [user, cartItems, loadCart, getOrCreateCart]);

  // Supprimer un produit du panier
  const removeFromCart = useCallback(async (cartItemId) => {
    if (!user || !cartItemId) return;

    const previousItems = [...cartItems];
    try {
      // MISE À JOUR OPTIMISTE
      setCartItems(prev => prev.filter(item => item.id !== cartItemId));

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;

      // Sync en arrière-plan
      await loadCart(false);
    } catch (error) {
      console.error('Error removing from cart:', error);
      setCartItems(previousItems); // Rollback
      throw new Error("Échec de la suppression de l'article");
    }
  }, [user, cartItems, loadCart]);

  // Modifier la quantité d'un produit
  const updateQuantity = useCallback(async (cartItemId, newQuantity) => {
    if (!user || !cartItemId) return;

    if (newQuantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }

    const previousItems = [...cartItems];
    const itemToUpdate = cartItems.find(item => item.id === cartItemId);
    const pricePerKilo = itemToUpdate?.pricePerKilo || 0;
    const newTotalPrice = (pricePerKilo * newQuantity).toFixed(2);

    try {
      // MISE À JOUR OPTIMISTE
      setCartItems(prev => prev.map(item =>
        item.id === cartItemId ? { ...item, quantity: newQuantity, totalPrice: newTotalPrice } : item
      ));

      const { error } = await supabase
        .from('cart_items')
        .update({
          quantity_kg: parseFloat(newQuantity),
          total_price: parseFloat(newTotalPrice),
        })
        .eq('id', cartItemId);

      if (error) throw error;

      // Sync en arrière-plan
      await loadCart(false);
    } catch (error) {
      console.error('Error updating quantity:', error);
      setCartItems(previousItems); // Rollback
      throw new Error("Échec de la mise à jour de la quantité");
    }
  }, [user, cartItems, removeFromCart, loadCart]);

  // Vider le panier
  const clearCart = useCallback(async () => {
    if (!user || !cartId) {
      setCartItems([]);
      return;
    }

    const previousItems = [...cartItems];
    try {
      // MISE À JOUR OPTIMISTE
      setCartItems([]);

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId);

      if (error) throw error;

      // Sync en arrière-plan
      await loadCart(false);
    } catch (error) {
      console.error('Error clearing cart:', error);
      setCartItems(previousItems); // Rollback
      throw new Error("Échec du vidage du panier");
    }
  }, [user, cartId, cartItems, loadCart]);

  // Calculer le total du panier (mémorisé)
  const getCartTotal = useCallback(() => {
    return cartItems
      .reduce((total, item) => total + parseFloat(item.totalPrice || 0), 0)
      .toFixed(2);
  }, [cartItems]);

  // Obtenir le nombre total d'articles (mémorisé)
  const getCartCount = useCallback(() => {
    return cartItems.length;
  }, [cartItems]);

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
  }), [cartItems, loading, getCartTotal, getCartCount, loadCart, addToCart, removeFromCart, updateQuantity, clearCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 