import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';

interface Props {
  count: number;
  activeIndex: number;
  onPress: (index: number) => void;
}

const AchievementIndicators = ({ count, activeIndex, onPress }: Props) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <Pressable
          key={index}
          style={[
            styles.indicator,
            activeIndex === index && styles.activeIndicator,
          ]}
          onPress={() => onPress(index)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#333',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default AchievementIndicators;
