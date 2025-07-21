import React, { createContext, useContext, useState } from 'react';

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

  // Ajouter un produit au panier
  const addToCart = (product, weight = 1) => {
    setCartItems(prevItems => {
      // Vérifier si le produit existe déjà dans le panier
      const existingItemIndex = prevItems.findIndex(
        item => item.name === product.name
      );

      if (existingItemIndex > -1) {
        // Si le produit existe, augmenter la quantité
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += weight;
        updatedItems[existingItemIndex].totalPrice = (
          updatedItems[existingItemIndex].quantity * 
          updatedItems[existingItemIndex].pricePerKilo
        ).toFixed(2);
        return updatedItems;
      } else {
        // Si le produit n'existe pas, l'ajouter
        const pricePerKilo = parseFloat(product.price.replace('€/kg', ''));
        const newItem = {
          id: Date.now(),
          name: product.name,
          price: product.price,
          pricePerKilo: pricePerKilo,
          image: product.image,
          category: product.category,
          quantity: weight,
          totalPrice: (pricePerKilo * weight).toFixed(2),
        };
        return [...prevItems, newItem];
      }
    });
  };

  // Supprimer un produit du panier
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // Modifier la quantité d'un produit
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? {
              ...item,
              quantity: newQuantity,
              totalPrice: (item.pricePerKilo * newQuantity).toFixed(2),
            }
          : item
      )
    );
  };

  // Calculer le total du panier
  const getCartTotal = () => {
    return cartItems
      .reduce((total, item) => total + parseFloat(item.totalPrice), 0)
      .toFixed(2);
  };

  // Obtenir le nombre total d'articles
  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Vider le panier
  const clearCart = () => {
    setCartItems([]);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartCount,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 