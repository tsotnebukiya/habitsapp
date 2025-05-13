import React, { useEffect, useRef, useMemo, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { FontAwesome6 } from '@expo/vector-icons';
import Colors from '@/lib/constants/Colors';
import * as Haptics from 'expo-haptics';

interface CircularCounterProps {
  value: number;
  maxValue: number;
  onChange: (value: number) => void;
  size?: number;
  step?: number;
  progressColor?: string;
  buttonColor?: string;
  label?: string;
  disabled?: boolean;
  animationDuration?: number;
}

// Create AnimatedCircle component outside of the render function
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Memoize buttons to prevent unnecessary re-renders
const CounterButtons = memo(
  ({
    value,
    maxValue,
    step,
    buttonColor,
    handleIncrement,
    handleDecrement,
    disabled,
  }: {
    value: number;
    maxValue: number;
    step: number;
    buttonColor: string;
    handleIncrement: () => void;
    handleDecrement: () => void;
    disabled: boolean;
  }) => (
    <View style={styles.buttonsContainer}>
      <TouchableOpacity
        onPress={handleDecrement}
        style={[
          styles.button,
          { backgroundColor: buttonColor },
          value <= 0 && styles.buttonDisabled,
        ]}
        disabled={value <= 0 || disabled}
      >
        <FontAwesome6 name="minus" size={16} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleIncrement}
        style={[
          styles.button,
          { backgroundColor: buttonColor },
          value >= maxValue && styles.buttonDisabled,
        ]}
        disabled={value >= maxValue || disabled}
      >
        <FontAwesome6 name="plus" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  )
);

const CircularCounter = memo(function CircularCounter({
  value,
  maxValue,
  onChange,
  size = 200,
  step = 1,
  progressColor = Colors.bgDark,
  buttonColor = Colors.bgDark,
  label = 'Completions',
  disabled = false,
  animationDuration = 300,
}: CircularCounterProps) {
  const strokeWidth = useMemo(() => size * 0.05, [size]);
  const radius = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth]);
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);

  // Create animated value for progress
  const animatedProgress = useRef(new Animated.Value(value / maxValue)).current;

  // Animation effect when value changes
  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: value / maxValue,
      duration: animationDuration,
      useNativeDriver: false,
    }).start();
  }, [value, maxValue, animationDuration, animatedProgress]);

  // Calculate strokeDashoffset from animated value - matching original formula: circumference * (1 - progress)
  const strokeDashoffset = useMemo(
    () =>
      Animated.multiply(Animated.subtract(1, animatedProgress), circumference),
    [animatedProgress, circumference]
  );

  const handleIncrement = () => {
    if (disabled) return;
    if (value < maxValue) {
      const newValue = Math.min(value + step, maxValue);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(newValue);
    }
  };

  const handleDecrement = () => {
    if (disabled) return;
    if (value > 0) {
      const newValue = Math.max(value - step, 0);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(newValue);
    }
  };

  // Precompute transform for SVG and Circle
  const circleTransform = useMemo(
    () => `rotate(-90, ${size / 2}, ${size / 2})`,
    [size]
  );

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={Colors.bgDark}
          fill="transparent"
        />

        {/* Progress circle - using AnimatedCircle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={progressColor}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={circleTransform}
        />
      </Svg>

      <View style={styles.content}>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.maxValue}>/{maxValue}</Text>
        </View>

        <Text style={styles.label}>{label}</Text>

        <CounterButtons
          value={value}
          maxValue={maxValue}
          step={step}
          buttonColor={buttonColor}
          handleIncrement={handleIncrement}
          handleDecrement={handleDecrement}
          disabled={disabled}
        />
      </View>
    </View>
  );
});

export default CircularCounter;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  svg: {
    transform: [{ rotate: '-90deg' }],
  },
  content: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 40,
    fontWeight: '600',
    color: Colors.bgDark,
  },
  maxValue: {
    fontSize: 20,
    color: Colors.bgDark,
  },
  label: {
    fontSize: 14,
    color: Colors.bgDark,
    marginTop: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 16,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
