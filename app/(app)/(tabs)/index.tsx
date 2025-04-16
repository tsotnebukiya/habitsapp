import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ErrorBoundary } from '@sentry/react-native';
import { useHabitsStore } from '@/lib/stores/habits_store';
import useUserProfileStore from '@/lib/stores/user_profile';
import WeekView from '@/components/habits/WeekView';
import HabitList from '@/components/habits/HabitList';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAchievementsStore } from '@/lib/stores/achievements_store';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Home() {
  const { profile } = useUserProfileStore();
  const syncHabits = useHabitsStore((state) => state.syncWithServer);
  const syncAchievements = useAchievementsStore(
    (state) => state.syncWithServer
  );
  const [selectedDate, setSelectedDate] = useState(new Date());
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (profile?.id) {
      // Initial sync
      syncHabits();
      syncAchievements();

      // Setup periodic sync every hour
      const syncInterval = setInterval(() => {
        syncHabits();
        syncAchievements();
      }, 1000 * 60 * 60); // 1 hour

      return () => {
        clearInterval(syncInterval);
      };
    }
  }, [profile?.id]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <WeekView selectedDate={selectedDate} onDateSelect={setSelectedDate} />
        <HabitList selectedDate={selectedDate} />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-habit')}
        >
          <Ionicons name="add" size={30} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
