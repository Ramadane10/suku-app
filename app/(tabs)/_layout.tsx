import colors from '@/src/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import HomeScreen from './home';
const Drawer = createDrawerNavigator();

const DrawerLayout = () => {
  const navigation = useNavigation();

  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,   
        },
        headerTintColor: colors.dark,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} style={{ marginLeft: 15 }}>
            <Ionicons name="menu" size={24} color={colors.dark} />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity onPress={() => alert('Notifications!')} style={{ marginRight: 15 }}>
            <Ionicons name="bag-handle-outline" size={24} color={colors.dark} />
          </TouchableOpacity>
        ),
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} options={{ drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="Shop" component={HomeScreen} options={{ drawerIcon: ({ color, size }) => <Ionicons name="cart-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="Bag" component={HomeScreen} options={{ drawerIcon: ({ color, size }) => <Ionicons name="bag-handle-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="Search" component={HomeScreen} options={{ drawerIcon: ({ color, size }) => <Ionicons name="search-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="Orders" component={HomeScreen} options={{ drawerIcon: ({ color, size }) => <Ionicons name="bag-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="Wishlist" component={HomeScreen} options={{ drawerIcon: ({ color, size }) => <Ionicons name="heart-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="People" component={HomeScreen} options={{ drawerIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} /> }} />
      <Drawer.Screen name="Logout" component={HomeScreen} options={{ drawerIcon: ({ color, size }) => <Ionicons name="log-out-outline" size={size} color={color} /> }} />
    </Drawer.Navigator>
  );
};

export default DrawerLayout;