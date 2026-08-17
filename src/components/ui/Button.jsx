import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import colors from '../../constants/colors';
import fonts from '../../constants/fonts';

/**
 * @param {Object} props
 * @param {string} props.title
 * @param {function} [props.onPress]
 * @param {string} [props.backgroundColor]
 * @param {string} [props.textColor]
 * @param {React.ReactNode} [props.leftIcon]
 * @param {any} [props.style]
 * @param {boolean} [props.isLoading]
 * @param {boolean} [props.disabled]
 */
const Button = ({
  title,
  onPress,
  backgroundColor = colors.primary,
  textColor = colors.light,
  leftIcon = null,
  style,
  isLoading = false,
  disabled = false,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { backgroundColor },
        pressed && styles.pressed,
        style,
        (isLoading || disabled) && styles.disabled,
      ]}
      onPress={(isLoading || disabled) ? null : onPress}
      android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.content}>
          {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
          <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
        </View>
      )}
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
  disabled: {
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