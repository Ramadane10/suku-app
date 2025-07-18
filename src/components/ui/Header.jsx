import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import colors from '../../constants/colors';
import fonts from '../../constants/fonts';

const Header = ({ title, onMenuPress, cartCount = 0 }) => (
  <View style={styles.container}>
    <TouchableOpacity onPress={onMenuPress}>
      <Ionicons name="menu" size={28} color={colors.dark} />
    </TouchableOpacity>
    <Text style={styles.title}>{title}</Text>
    <View style={styles.cartContainer}>
      <TouchableOpacity>
        <Ionicons name="bag-handle-outline" size={24} color={colors.dark} />
        {cartCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cartCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.dark,
  },
  cartContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontFamily: fonts.bold,
  },
});

export default Header;