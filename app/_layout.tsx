import { Stack } from 'expo-router';
import React from 'react';
import { CartProvider } from '../src/context/CartContext';
import { FavoritesProvider } from '../src/context/FavoritesContext';
import { OrderProvider } from '../src/context/OrderContext';

export default function RootLayout() {
  return (
    <CartProvider>
      <FavoritesProvider>
        <OrderProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </OrderProvider>
      </FavoritesProvider>
    </CartProvider>
  );
}
