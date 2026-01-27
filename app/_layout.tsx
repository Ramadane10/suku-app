import { Stack } from 'expo-router';
import React from 'react';
import { CartProvider } from '../src/context/CartContext';
import { FavoritesProvider } from '../src/context/FavoritesContext';
import { OrderProvider } from '../src/context/OrderContext';
import ThemeProvider from '../src/components/ThemeProvider';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <CartProvider>
        <FavoritesProvider>
          <OrderProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'fade',
                animationDuration: 150,
              }}
            />
          </OrderProvider>
        </FavoritesProvider>
      </CartProvider>
    </ThemeProvider>
  );
}
