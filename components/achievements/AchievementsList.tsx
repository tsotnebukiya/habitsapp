import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useAllAchievements } from '@/lib/hooks/useAchievements';
import { AchievementItem } from './AchievementItem';
import { Achievement, ACHIEVEMENTS } from '@/lib/constants/achievements';
import { StreakAchievements } from '@/lib/utils/achievement_scoring'; // Import specific type

// Helper function to get achievement details from constants/definition file
// This assumes you have a way to get details based on the ID (StreakDays)
import { getAchievementDetails } from '@/lib/utils/achievement_scoring'; // Reuse if available

export const AchievementsList = () => {
  const userAchievements: StreakAchievements = useAllAchievements(); // Hook returns { [key in StreakDays]?: boolean }

  // Convert the ACHIEVEMENTS record into an array
  const allPossibleAchievements: Achievement[] = Object.values(ACHIEVEMENTS);

  // Check if data is still loading or empty
  // NOTE: useAllAchievements might need adjustment to provide a loading state
  // if (!userAchievements) {
  //   return <ActivityIndicator style={styles.loader} />;
  // }

  const renderItem = ({ item }: { item: Achievement }) => {
    const isUnlocked = userAchievements[item.id] === true;
    return <AchievementItem achievement={item} isUnlocked={isUnlocked} />;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Achievements</Text>
      <FlatList
        data={allPossibleAchievements}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()} // Use achievement ID as key
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No achievements defined yet.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 15,
    marginBottom: 10,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  loader: {
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 10,
    marginLeft: 15, // Match title margin
  },
});
