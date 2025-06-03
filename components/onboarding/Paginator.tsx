import { colors } from '@/lib/constants/ui';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const { width: screenWidth } = Dimensions.get('window');

interface PaginatorProps {
  data: any[];
  scrollX: Animated.SharedValue<number>;
}

const Paginator: React.FC<PaginatorProps> = ({ data, scrollX }) => {
  const PaginationDot = ({ index }: { index: number }) => {
    const animatedDotStyle = useAnimatedStyle(() => {
      const inputRange = [
        (index - 1) * screenWidth,
        index * screenWidth,
        (index + 1) * screenWidth,
      ];

      const width = interpolate(
        scrollX.value,
        inputRange,
        [10, 20, 10],
        'clamp'
      );

      return {
        width: withSpring(width),
      };
    });

    const animatedColorStyle = useAnimatedStyle(() => {
      const inputRange = [
        (index - 1) * screenWidth,
        index * screenWidth,
        (index + 1) * screenWidth,
      ];

      const backgroundColor = interpolate(
        scrollX.value,
        inputRange,
        [0, 1, 0],
        'clamp'
      );

      return {
        backgroundColor: backgroundColor > 0.5 ? colors.secondary : '#D9D9D9',
      };
    });

    return (
      <Animated.View
        style={[styles.dot, animatedDotStyle, animatedColorStyle]}
      />
    );
  };

  return (
    <View style={styles.pagination}>
      {data.map((_, index) => (
        <PaginationDot key={index} index={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 50,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 8,
  },
});

export default Paginator;
