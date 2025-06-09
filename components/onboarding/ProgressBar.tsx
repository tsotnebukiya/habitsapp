import { colors } from '@/lib/constants/ui';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface ProgressBarProps {
  progress: number;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  const animatedWidth = useSharedValue(0);
  const duration = 300;
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
    <View style={[styles.container]}>
      <Animated.View style={[styles.progress, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 8,
    borderRadius: 8,
    overflow: 'hidden',
    flex: 1,
    maxWidth: 185,
    backgroundColor: '#D9D9D9',
  },
  progress: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: colors.secondary,
  },
});
