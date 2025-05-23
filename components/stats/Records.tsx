import { colors, fontWeights } from '@/lib/constants/ui';
import useHabitsStore from '@/lib/habit-store/store';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Records() {
  const maxStreak = useHabitsStore((state) => state.maxStreak);
  const currentStreak = useHabitsStore((state) => state.getCurrentStreak());
  const totalCompletions = useHabitsStore((state) =>
    state.getTotalCompletions()
  );
  const successRate = useHabitsStore((state) => state.getSuccessRate());
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Records</Text>
      <View style={styles.box}>
        <View style={[styles.row, styles.topRow]}>
          <View style={styles.item}>
            <Text style={styles.value}>{currentStreak}</Text>
            <Text style={styles.description}>Current streak</Text>
          </View>
          <View style={[styles.item, styles.leftItem]}>
            <Text style={styles.value}>{maxStreak}</Text>
            <Text style={styles.description}>Longest streak</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.item}>
            <Text style={styles.value}>{totalCompletions}</Text>
            <Text style={styles.description}>Completed</Text>
          </View>
          <View style={[styles.item, styles.leftItem]}>
            <Text style={styles.value}>{successRate}%</Text>
            <Text style={styles.description}>Success rate</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  title: {
    fontSize: 13,
    fontFamily: fontWeights.medium,
    color: colors.text,
    marginBottom: 14,
    opacity: 0.5,
  },
  box: {
    backgroundColor: 'white',
    ...colors.dropShadow,
    borderRadius: 16,
  },
  row: {
    flexDirection: 'row',
  },
  topRow: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  item: {
    flex: 1,
    paddingVertical: 16,
    gap: 5,
    alignItems: 'center',
  },
  leftItem: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.05)',
  },
  description: {
    fontSize: 12,
    fontFamily: fontWeights.medium,
    color: colors.text,
    opacity: 0.6,
  },
  value: {
    fontSize: 16,
    fontFamily: fontWeights.bold,
    color: colors.text,
  },
});
