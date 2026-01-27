import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';

const BackButton = ({ onPress, color }) => {
  const router = useRouter();
  const { colors } = useTheme();
  const iconColor = color || colors.text;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.back();
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Ionicons name="arrow-back" size={24} color={iconColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
});

export default BackButton;