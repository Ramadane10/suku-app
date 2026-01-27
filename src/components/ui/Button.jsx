import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import colors from '../../constants/colors';
import fonts from '../../constants/fonts';

const Button = ({
  title,
  onPress,
  backgroundColor = colors.dark,
  textColor = colors.light,
  leftIcon = null,
  style,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { backgroundColor },
        pressed && styles.pressed,
        style,
      ]}
      onPress={onPress}
      android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}
    >
      <View style={styles.content}>
        {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
        <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  pressed: {
    opacity: 0.7,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
});

export default Button;