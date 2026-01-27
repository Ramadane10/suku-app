import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import fonts from '../../constants/fonts';
import { useTheme } from '../../hooks/useTheme';

const InputField = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  leftIcon = null,
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
});

export default InputField;