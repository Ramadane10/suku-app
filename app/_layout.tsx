import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import React from 'react';
import { TouchableOpacity } from 'react-native';

const Drawer = createDrawerNavigator();

// Vous pouvez créer un composant simple pour l'écran d'accueil pour l'instant
const HomeScreen = () => null; 

export default function RootLayout() {
  const navigation = useNavigation();

  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f8f8f8',
        },
        headerTintColor: '#333',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} style={{ marginLeft: 15 }}>
            <Ionicons name="menu" size={24} color="#333" />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity onPress={() => alert('Notifications!')} style={{ marginRight: 15 }}>
            <Ionicons name="bag-handle-outline" size={24} color="#333" />
          </TouchableOpacity>
        ),
      }}
    >
      <Drawer.Screen 
        name="(tabs)" 
        component={HomeScreen} // Ce composant est un placeholder
        options={{
          title: 'Home',
          drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> 
        }}
      />
      {/* Ajoutez les autres écrans ici */}
    </Drawer.Navigator>
  );
}
