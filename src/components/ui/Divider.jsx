import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import fonts from '../../constants/fonts';
import { useTheme } from '../../hooks/useTheme';

const Divider = ({ text }) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.line, { backgroundColor: colors.border }]} />
      <Text style={[styles.text, { color: colors.textSecondary }]}>{text}</Text>
      <View style={[styles.line, { backgroundColor: colors.border }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
  },
  text: {
    marginHorizontal: 10,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
});

export default Divider;