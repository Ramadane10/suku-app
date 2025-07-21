import { AntDesign, Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#FF6B00',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarLabelStyle: { fontSize: 12 },
        tabBarLabelPosition: 'below-icon',
        tabBarStyle: { height: 60, paddingBottom: 6 },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'home') {
            return <AntDesign name="home" size={size} color={color} />;
          }
          if (route.name === 'cart') {
            return <Feather name="shopping-bag" size={size} color={color} />;
          }
          if (route.name === 'profile') {
            return <Feather name="user" size={size} color={color} />;
          }
          return null;
        },
      })}
    >
      <Tabs.Screen name="home" options={{ tabBarLabel: 'Accueil' }} />
      <Tabs.Screen name="cart" options={{ tabBarLabel: 'Panier' }} />
      <Tabs.Screen name="profile" options={{ tabBarLabel: 'Profil' }} />
    </Tabs>
  );
}