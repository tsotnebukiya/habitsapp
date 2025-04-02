// components/onboarding/OnboardingProgressBar.tsx
import * as React from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';

interface ProgressBarProps {
  step: number;
  steps: number;
}

interface AnimatedProgressBarProps extends ProgressBarProps {
  h?: number;
}

export function OnboardingProgressBar({ step, steps }: ProgressBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${Math.abs((step/steps) * 100)}%` }
          ]}
        />
      </View>
    </View>
  );
}

export function AnimatedOnboardingProgressBar({ step, steps, h = 4 }: AnimatedProgressBarProps) {
  const [width, setWidth] = React.useState(0);
  const animatedStep = React.useRef(new Animated.Value(-1000)).current;
  const reactiveAnimated = React.useRef(new Animated.Value(-1000)).current;

  React.useEffect(() => {
    Animated.timing(animatedStep, {
      toValue: reactiveAnimated,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  React.useEffect(() => {
    reactiveAnimated.setValue(-width + (width * step) / steps);
  }, [width, step]);

  return (
    <View style={styles.container}>
      <View
        style={[styles.progressBarContainer, { height: h }]}
        onLayout={(e) => {
          if (width !== 0) return;
          setWidth(e.nativeEvent.layout.width);
        }}
      >
        <Animated.View
          style={[
            styles.progressBar,
            {
              height: h,
              transform: [{ translateX: animatedStep }],
            }
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text.primary,
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 6,
    width: '100%',
    backgroundColor: Colors.shared.primary[100],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.shared.primary[500],
    borderRadius: 3,
  },
});

export default OnboardingProgressBar;