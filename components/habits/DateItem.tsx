import Colors from '@/lib/constants/Colors';
import { DATE_ITEM_WIDTH, WEEK_VIEW_ITEM_GAP } from '@/lib/constants/layouts';
import { fontWeights } from '@/lib/constants/Typography';
import React, { memo, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface DateItemProps {
  onPress: () => void;
  isSelected: boolean;
  dateWeek: string;
  dateNumber: string;
  completionStatus: number;
}

const CIRCLE_SIZE = 36;
const STROKE_WIDTH = 4;
const ANIMATION_DURATION = 300;

// Create AnimatedCircle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const DateItem = memo(function DateItem({
  onPress,
  isSelected,
  dateWeek,
  dateNumber,
  completionStatus,
}: DateItemProps) {
  const radius = useMemo(() => (CIRCLE_SIZE - STROKE_WIDTH) / 2, []);
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);

  const animatedProgress = useRef(new Animated.Value(completionStatus)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: completionStatus,
      duration: ANIMATION_DURATION,
      useNativeDriver: true,
    }).start();
  }, [completionStatus]);

  const strokeDashoffset = useMemo(
    () =>
      Animated.multiply(Animated.subtract(1, animatedProgress), circumference),
    [animatedProgress, circumference]
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.dayContainer,
        isSelected && styles.selectedDay,
        { marginHorizontal: WEEK_VIEW_ITEM_GAP / 2 },
      ]}
      activeOpacity={1}
    >
      <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>
        {dateWeek}
      </Text>

      <View style={[styles.outerBox, isSelected && styles.outerBoxSelected]}>
        <View style={styles.innerBox}>
          <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} style={styles.svg}>
            <AnimatedCircle
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={radius}
              strokeWidth={STROKE_WIDTH}
              stroke={Colors.accent}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(0, ${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2})`}
            />
          </Svg>
          <Text
            style={[styles.dayNumber, isSelected && styles.dayNumberSelected]}
          >
            {dateNumber}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default DateItem;

const styles = StyleSheet.create({
  dayContainer: {
    width: DATE_ITEM_WIDTH,
    height: 77,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    borderRadius: 13,
  },
  selectedDay: {
    backgroundColor: Colors.primary,
  },
  dayName: {
    fontSize: 14,
    color: '#808191',
    fontFamily: fontWeights.semibold,
  },
  dayNameSelected: {
    color: 'white',
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
  dayNumber: {
    color: Colors.secondary,
    opacity: 0.5,
    fontSize: 14,
    fontFamily: fontWeights.medium,
  },
  dayNumberSelected: {
    color: 'black',
    opacity: 0.5,
    fontFamily: fontWeights.semibold,
  },
});
