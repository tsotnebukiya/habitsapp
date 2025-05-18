import HabitList from '@/components/habits/HabitList';
import WeekView from '@/components/habits/WeekView';
import { colors } from '@/lib/constants/ui';
import useHabitsStore from '@/lib/habit-store/store';
import useUserProfileStore from '@/lib/stores/user_profile';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Home() {
  const { profile } = useUserProfileStore();
  const syncData = useHabitsStore((state) => state.syncWithServer);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (profile?.id) {
      syncData();
      const syncInterval = setInterval(
        () => {
          syncData();
        },
        1000 * 60 * 60
      );
      return () => clearInterval(syncInterval);
    }
  }, [profile?.id, syncData]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 11 }]}>
      <WeekView selectedDate={selectedDate} onDateSelect={setSelectedDate} />
      <HabitList selectedDate={selectedDate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight,
  },
});
