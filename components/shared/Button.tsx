import { colors, fontWeights } from '@/lib/constants/ui';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ACTIVE_OPACITY } from './config';

export default function Button({
  onPress,
  label,
  type = 'primary',
}: {
  onPress: () => void;
  label: string;
  type: 'primary' | 'secondary';
}) {
  return (
    <TouchableOpacity
      style={[styles.button, type === 'secondary' && styles.secondary]}
      activeOpacity={ACTIVE_OPACITY}
      onPress={onPress}
    >
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 16,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: 'white',
    fontSize: 16,
    fontFamily: fontWeights.bold,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
});
