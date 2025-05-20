import { colors, fontWeights } from '@/lib/constants/ui';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ACTIVE_OPACITY } from './config';

export default function Button({
  onPress,
  label,
  icon,
  type = 'primary',
  disabled = false,
  fullWidth = true,
}: {
  onPress: () => void;
  label?: string;
  icon?: React.ReactNode;
  type: 'primary' | 'secondary';
  disabled?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        type === 'secondary' && styles.secondary,
        disabled && styles.disabled,
        fullWidth && styles.fullWidth,
      ]}
      activeOpacity={ACTIVE_OPACITY}
      onPress={onPress}
      disabled={disabled}
    >
      {label && <Text style={styles.label}>{label}</Text>}
      {icon}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    flex: 1,
  },
  label: {
    color: 'white',
    fontSize: 16,
    fontFamily: fontWeights.bold,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  disabled: {
    opacity: 0.5,
  },
});
