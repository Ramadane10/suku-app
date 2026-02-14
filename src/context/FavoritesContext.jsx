import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Charger les favoris depuis Supabase
  const loadFavorites = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          product_id,
          product:products(
            id,
            name,
            price_per_kg,
            image_url,
            category:categories(name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading favorites:', error);
        setLoading(false);
        return;
      }

      // Transformer les données pour correspondre au format attendu
      const formattedFavorites = (data || []).map(fav => {
        let imageSource;
        if (fav.product?.image_url) {
          imageSource = { uri: fav.product.image_url };
        } else {
          // Image par défaut
          try {
            imageSource = require('../../assets/images/onboarding1.png');
          } catch {
            imageSource = { uri: 'https://via.placeholder.com/150' };
          }
        }
        
        return {
          id: fav.id,
          productId: fav.product_id,
          name: fav.product?.name || 'Produit',
          price: `${fav.product?.price_per_kg || 0}€/kg`,
          image: imageSource,
          category: fav.product?.category?.name || 'FRUITS',
        };
      });

      setFavorites(formattedFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [user, loadFavorites]);

  // Ajouter un favori
  const addFavorite = useCallback(async (product) => {
    if (!user) {
      console.warn('User must be logged in to add favorites');
      return;
    }

    const productId = product.id || product.productId;
    if (!productId) {
      console.error('Product ID is required');
      return;
    }

    // Mettre à jour l'état local immédiatement
    setFavorites(prev => {
      if (prev.find(fav => fav.productId === productId)) return prev;
      return [...prev, {
        id: `temp-${Date.now()}`,
        productId,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
      }];
    });

    try {
      const { error } = await supabase
        .from('favorites')
        .insert([{
          user_id: user.id,
          product_id: productId,
        }]);

      if (error) {
        // Si l'erreur est due à une contrainte unique, le favori existe déjà
        if (error.code === '23505') {
          console.log('Product already in favorites');
          return;
        }
        console.error('Error adding favorite:', error);
        // En cas d'erreur, recharger pour avoir l'état correct
        loadFavorites();
        return;
      }

      // Recharger les favoris en arrière-plan pour synchroniser
      loadFavorites();
    } catch (error) {
      console.error('Error adding favorite:', error);
      loadFavorites();
    }
  }, [user, loadFavorites]);

  // Supprimer un favori
  const removeFavorite = useCallback(async (productId) => {
    if (!user || !productId) return;

    // Mettre à jour l'état local immédiatement
    setFavorites(prev => prev.filter(fav => fav.productId !== productId));

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) {
        console.error('Error removing favorite:', error);
        // En cas d'erreur, recharger pour avoir l'état correct
        loadFavorites();
        return;
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      loadFavorites();
    }
  }, [user, loadFavorites]);

  // Vérifier si un produit est en favori (mémorisé)
  const isFavorite = useCallback((productId) => {
    if (!productId) return false;
    return favorites.some((item) => item.productId === productId);
  }, [favorites]);

  const value = useMemo(() => ({
    favorites, 
    loading,
    addFavorite, 
    removeFavorite, 
    isFavorite,
    refreshFavorites: loadFavorites,
  }), [favorites, loading, addFavorite, removeFavorite, isFavorite]);

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}; 