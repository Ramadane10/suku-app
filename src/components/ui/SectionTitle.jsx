import React from 'react';
import { StyleSheet, Text } from 'react-native';
import fonts from '../../constants/fonts';
import { useTheme } from '../../hooks/useTheme';

const SectionTitle = ({ children, center = false }) => {
  const { colors } = useTheme();
  return (
    <Text style={[styles.title, { color: colors.text }, center && styles.centered]}>{children}</Text>
  );
};

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.bold,
    fontSize: 22,
    marginVertical: 12,
    marginLeft: 16,
  },
  centered: {
    textAlign: 'center',
    marginLeft: 0,
  },
});

export default SectionTitle;