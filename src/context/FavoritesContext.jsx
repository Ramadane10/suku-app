import React, { createContext, useContext, useState } from 'react';

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

  const addFavorite = (product) => {
    setFavorites((prev) => {
      if (prev.find((item) => item.name === product.name)) return prev;
      return [...prev, product];
    });
  };

  const removeFavorite = (productName) => {
    setFavorites((prev) => prev.filter((item) => item.name !== productName));
  };

  const isFavorite = (productName) => {
    return favorites.some((item) => item.name === productName);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}; 