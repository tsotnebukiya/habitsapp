import HabitList from '@/components/habits/HabitList';
import WeekView from '@/components/habits/WeekView';
import { colors } from '@/lib/constants/ui';
import useHabitsStore from '@/lib/habit-store/store';
import useUserProfileStore from '@/lib/stores/user_profile';
import React, { useRef, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Home() {
  const { profile } = useUserProfileStore();
  const syncData = useHabitsStore((state) => state.syncWithServer);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const insets = useSafeAreaInsets();
  const appState = useRef(AppState.currentState);
  const hasInitialSynced = useRef(false);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 17 }]}>
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
