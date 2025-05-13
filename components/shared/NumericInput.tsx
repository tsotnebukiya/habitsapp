import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import Colors from '@/lib/constants/Colors';
import * as Haptics from 'expo-haptics';

interface NumericInputProps {
  value: number;
  onChange: (value: number) => void;
  increment: number;
  unit: string;
  min?: number;
  max?: number;
}

export function NumericInput({
  value,
  onChange,
  increment,
  unit,
  min = 0,
  max = 999,
}: NumericInputProps) {
  const handleIncrement = () => {
    const newValue = Math.min(value + increment, max);
    if (newValue !== value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(newValue);
    }
  };

  const handleDecrement = () => {
    const newValue = Math.max(value - increment, min);
    if (newValue !== value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(newValue);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleDecrement}
        style={[styles.button, value <= min && styles.buttonDisabled]}
        disabled={value <= min}
      >
        <FontAwesome6
          name="minus"
          size={16}
          color={value <= min ? Colors.bgDark : Colors.bgDark}
        />
      </TouchableOpacity>

      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>

      <TouchableOpacity
        onPress={handleIncrement}
        style={[styles.button, value >= max && styles.buttonDisabled]}
        disabled={value >= max}
      >
        <FontAwesome6
          name="plus"
          size={16}
          color={value >= max ? Colors.bgDark : Colors.bgDark}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgDark,
    borderRadius: 12,
    padding: 16,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginHorizontal: 24,
  },
  value: {
    fontSize: 32,
    fontWeight: '600',
    color: Colors.bgDark,
  },
  unit: {
    fontSize: 16,
    color: Colors.bgDark,
    marginLeft: 4,
  },
});
