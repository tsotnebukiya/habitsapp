import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ACHIEVEMENTS } from '@/lib/constants/achievements'; // Import achievements
import useHabitsStore from '@/lib/habit-store/store';

// Helper to get the first achievement's icon (emoji) or a default
const getStreakIcon = (): string => {
  const firstAchievement = Object.values(ACHIEVEMENTS)[0];
  if (firstAchievement && firstAchievement.icon) {
    return firstAchievement.icon; // Return emoji string
  }
  return '🔥'; // Default emoji icon
};

export const StreakDisplay = () => {
  const currentStreak = useHabitsStore((state) => state.currentStreak);
  const streakIcon = getStreakIcon();

  // Handle null or undefined streak value
  const streakText =
    currentStreak !== null && currentStreak !== undefined
      ? `${currentStreak} Days`
      : '0 Days'; // Or use a loading indicator

  return (
    <View style={styles.container}>
      <Text style={styles.iconText}>{streakIcon}</Text>
      <Text style={styles.streakText}>{streakText}</Text>
      <Text style={styles.subText}>Current Streak</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 15,
    marginBottom: 10,
  },
  iconText: {
    fontSize: 28, // Adjust size for emoji
    marginBottom: 5,
  },
  streakText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  subText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});
