import { Stack } from 'expo-router';
import React from 'react';
import { StatusBar } from 'react-native';
import { CartProvider } from '../src/context/CartContext';
import { FavoritesProvider } from '../src/context/FavoritesContext';
import { OrderProvider } from '../src/context/OrderContext';

export default function RootLayout() {
  return (
    <CartProvider>
      <FavoritesProvider>
        <OrderProvider>
          <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />
          <Stack screenOptions={{ headerShown: false }} />
        </OrderProvider>
      </FavoritesProvider>
    </CartProvider>
  );
}
