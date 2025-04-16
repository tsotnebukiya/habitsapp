import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { AchievementItem } from './AchievementItem';
import { ACHIEVEMENTS } from '@/lib/constants/achievements';
import useHabitsStore from '@/lib/stores/habits/store';
import { Achievement } from '@/lib/stores/habits/types';

export const AchievementsList = () => {
  const userAchievements = useHabitsStore((state) => state.streakAchievements);
  // Convert the ACHIEVEMENTS record into an array
  const allPossibleAchievements: Achievement[] = Object.values(ACHIEVEMENTS);

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
