// constants/Colors.ts

// Base color palette
const palette = {
  // Primary colors
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // Primary color
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },

  // Secondary colors
  secondary: {
    50: '#E8EAF6',
    100: '#C5CAE9',
    200: '#9FA8DA',
    300: '#7986CB',
    400: '#5C6BC0',
    500: '#3F51B5', // Secondary color
    600: '#3949AB',
    700: '#303F9F',
    800: '#283593',
    900: '#1A237E',
  },

  // Neutral colors (grays)
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Semantic colors
  success: {
    light: '#4CAF50',
    main: '#2E7D32',
    dark: '#1B5E20',
  },

  error: {
    light: '#EF5350',
    main: '#D32F2F',
    dark: '#C62828',
  },

  warning: {
    light: '#FFB74D',
    main: '#F57C00',
    dark: '#E65100',
  },

  info: {
    light: '#4FC3F7',
    main: '#0288D1',
    dark: '#01579B',
  },
};

// Theme configuration
export const light = {
  // Background colors
  background: {
    default: '#FFFFFF',
    paper: '#F5F5F5',
    elevated: '#FFFFFF',
  },

  // Text colors
  text: {
    primary: palette.neutral[900],
    secondary: palette.neutral[600],
    disabled: palette.neutral[400],
    hint: palette.neutral[500],
  },

  // Border colors
  border: {
    default: palette.neutral[200],
    light: palette.neutral[100],
    dark: palette.neutral[300],
  },

  // Action colors
  action: {
    active: palette.neutral[600],
    hover: palette.neutral[100],
    selected: palette.neutral[200],
    disabled: palette.neutral[300],
    focus: palette.neutral[200],
  },

  // Status colors
  status: {
    success: palette.success.main,
    error: palette.error.main,
    warning: palette.warning.main,
    info: palette.info.main,
  },

  // Brand colors
  brand: {
    primary: palette.primary[500],
    secondary: palette.secondary[500],
  },
};

export const dark = {
  // Background colors
  background: {
    default: '#121212',
    paper: '#1E1E1E',
    elevated: '#242424',
  },

  // Text colors
  text: {
    primary: '#FFFFFF',
    secondary: palette.neutral[400],
    disabled: palette.neutral[600],
    hint: palette.neutral[500],
  },

  // Border colors
  border: {
    default: palette.neutral[700],
    light: palette.neutral[800],
    dark: palette.neutral[600],
  },

  // Action colors
  action: {
    active: palette.neutral[400],
    hover: palette.neutral[800],
    selected: palette.neutral[700],
    disabled: palette.neutral[600],
    focus: palette.neutral[700],
  },

  // Status colors
  status: {
    success: palette.success.light,
    error: palette.error.light,
    warning: palette.warning.light,
    info: palette.info.light,
  },

  // Brand colors
  brand: {
    primary: palette.primary[300],
    secondary: palette.secondary[300],
  },
};

// Shared colors (same in light and dark modes)
export const shared = {
  transparent: 'transparent',

  // Common status colors
  success: palette.success,
  error: palette.error,
  warning: palette.warning,
  info: palette.info,

  // Primary palette
  primary: palette.primary,

  // Secondary palette
  secondary: palette.secondary,

  // Neutral palette
  neutral: palette.neutral,
};

// Export the complete color system
const Colors = {
  light,
  dark,
  shared,
  palette,
};

export default Colors;

// Usage examples:
/*
import Colors from './constants/Colors';
 
// In a component:
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background.default,
  },
  text: {
    color: Colors.light.text.primary,
  },
  button: {
    backgroundColor: Colors.shared.primary[500],
  },
  errorMessage: {
    color: Colors.shared.error.main,
  },
});
 
// With dark mode:
const isDarkMode = useColorScheme() === 'dark';
const theme = isDarkMode ? Colors.dark : Colors.light;
 
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.background.default,
  },
});
*/