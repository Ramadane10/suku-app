import { Platform } from 'react-native';

export default {
  regular: Platform.OS === 'ios' ? 'Roboto' : 'sans-serif',
  medium: Platform.OS === 'ios' ? 'Roboto-Medium' : 'sans-serif-medium',
  bold: Platform.OS === 'ios' ? 'Roboto-Bold' : 'sans-serif-condensed',
  blackItalic: Platform.OS === 'ios' ? 'Roboto-BlackItalic' : 'sans-serif',
  light: Platform.OS === 'ios' ? 'Roboto-Light' : 'sans-serif-light',
};
