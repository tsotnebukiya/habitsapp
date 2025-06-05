import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface ProgressBarProps {
  progress: number; // 0-100
  backgroundColor?: string;
  progressColor?: string;
  duration?: number;
}

export default function ProgressBar({
  progress,
  backgroundColor = '#E5E7EB',
  progressColor = '#3B82F6',
  duration = 300,
}: ProgressBarProps) {
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withTiming(progress, {
      duration,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [progress, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Animated.View
        style={[
          styles.progress,
          { backgroundColor: progressColor },
          animatedStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    borderRadius: 1.5,
  },
});
