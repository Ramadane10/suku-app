import React from 'react';
import { StyleSheet, Text } from 'react-native';
import colors from '../../constants/colors';
import fonts from '../../constants/fonts';

const SectionTitle = ({ children, center = false }) => (
  <Text style={[styles.title, center && styles.centered]}>{children}</Text>
);

const styles = StyleSheet.create({
  title: {
    fontFamily: fonts.bold,
    fontSize: 22,
    color: colors.dark,
    marginVertical: 12,
    marginLeft: 16,
  },
  centered: {
    textAlign: 'center',
    marginLeft: 0,
  },
});

export default SectionTitle;