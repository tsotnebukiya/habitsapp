import { colors, fontWeights } from '@/lib/constants/ui';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Circle, Svg } from 'react-native-svg';

const CIRCLE_SIZE = 36;
const STROKE_WIDTH = 4;
const ANIMATION_DURATION = 300;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const AnimatedDayComponent = React.memo(
  ({
    marking,
    state,
    date,
  }: {
    date: { day: number };
    marking?: { progress: number; selected: boolean };
    state?: 'disabled';
  }) => {
    const animatedProgress = useRef(
      new Animated.Value(marking?.progress || 0)
    ).current;
    const prevProgress = useRef(marking?.progress || 0);

    useEffect(() => {
      const currentProgress = marking?.progress || 0;
      if (prevProgress.current !== currentProgress) {
        Animated.timing(animatedProgress, {
          toValue: currentProgress,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }).start();
        prevProgress.current = currentProgress;
      }
    }, [marking?.progress, animatedProgress]);

    const radius = useMemo(() => (CIRCLE_SIZE - STROKE_WIDTH) / 2, []);
    const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);

    const strokeDashoffset = useMemo(
      () =>
        Animated.multiply(
          Animated.subtract(1, animatedProgress),
          circumference
        ),
      [animatedProgress, circumference]
    );

    const isDisabled = state === 'disabled';
    const isSelected = marking?.selected;
    return (
      <View
        style={[styles.dayComponent, marking?.selected && styles.selectedDay]}
      >
        <View style={[styles.outerBox]}>
          <View style={styles.innerBox}>
            <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} style={styles.svg}>
              {/* Background circle at 20% opacity */}
              {marking?.progress && marking?.progress > 0 ? (
                <Circle
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={radius}
                  strokeWidth={STROKE_WIDTH}
                  stroke={colors.accent}
                  strokeOpacity={0.2}
                  fill="transparent"
                />
              ) : null}
              {/* Progress circle at 100% opacity */}
              <AnimatedCircle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={radius}
                strokeWidth={STROKE_WIDTH}
                stroke={colors.accent}
                fill={isSelected ? colors.primary : 'transparent'}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(0, ${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2})`}
              />
            </Svg>
            <Text
              style={[
                styles.dayText,
                marking?.selected && styles.selectedDayText,
                isDisabled && styles.disabledDayText,
              ]}
            >
              {date.day}
            </Text>
          </View>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  selectedDay: {
    backgroundColor: colors.primary,
  },
  dayText: {
    color: '#282B35',
    fontSize: 12,
    fontFamily: fontWeights.semibold,
  },
  selectedDayText: {
    color: 'white',
    opacity: 1,
    fontFamily: fontWeights.semibold,
  },
  dayComponent: {
    height: 36,
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 100,
  },
  outerBox: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: CIRCLE_SIZE / 2,
  },
  outerBoxSelected: {
    backgroundColor: 'white',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4.24,
    },
    shadowRadius: 12.71,
    shadowOpacity: 0.12,
    elevation: 8,
  },
  innerBox: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
    transform: [{ rotate: '-90deg' }],
  },
  disabledDayText: {
    color: '#B6B9C8',
  },
});

export default AnimatedDayComponent;
