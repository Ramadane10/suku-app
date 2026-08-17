import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import fonts from '../../constants/fonts';
import { useTheme } from '../../hooks/useTheme';

/**
 * @param {object} props
 * @param {string} [props.placeholder]
 * @param {string} [props.value]
 * @param {function} [props.onChangeText]
 * @param {boolean} [props.secureTextEntry]
 * @param {import('react-native').KeyboardTypeOptions} [props.keyboardType]
 * @param {'none' | 'sentences' | 'words' | 'characters'} [props.autoCapitalize]
 * @param {React.ReactNode} [props.leftIcon]
 * @param {React.ReactNode} [props.rightIcon]  — custom right icon (overrides built-in eye toggle)
 * @param {import('react-native').ViewStyle} [props.style]
 */
const InputField = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  leftIcon = null,
  rightIcon = null,
  style,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {leftIcon ? <View style={styles.iconContainer}>{leftIcon}</View> : null}
      <TextInput
        style={[
          styles.input,
          {
            borderColor: colors.border,
            color: colors.text,
            backgroundColor: colors.surface,
          },
          leftIcon ? styles.inputWithIcon : null,
          (rightIcon || secureTextEntry) ? styles.inputWithRightIcon : null,
          style,
        ]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        placeholderTextColor={colors.textSecondary}
      />
      {rightIcon ? (
        <View style={styles.rightIconContainer}>{rightIcon}</View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  iconContainer: {
    position: 'absolute',
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  rightIconContainer: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontFamily: fonts.regular,
    fontSize: 16,
  },
  inputWithIcon: {
    paddingLeft: 48,
  },
  inputWithRightIcon: {
    paddingRight: 48,
  },
});

export default InputField;