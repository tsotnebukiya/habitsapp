import React, { useRef, useState, memo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Database } from '@/lib/utils/supabase_types';
import { useHabitsForDate } from '@/lib/hooks/useHabits';
import HabitItem from './HabitItem';
import HabitDetailsSheet from './HabitDetailsSheet';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useHabitsStore } from '@/lib/stores/habits_store';
import Toast from 'react-native-toast-message';
import Colors from '@/lib/constants/Colors';
import dayjs from 'dayjs';

type Habit = Database['public']['Tables']['habits']['Row'];

interface HabitListProps {
  selectedDate: Date;
}

const HabitList = memo(function HabitList({ selectedDate }: HabitListProps) {
  const habitsForDate = useHabitsForDate(selectedDate);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const {
    getHabitStatus,
    getCurrentProgress,
    getProgressText,
    toggleHabitStatus,
  } = useHabitsStore();

  const handleHabitLongPress = (habit: Habit) => {
    const today = dayjs().startOf('day');
    const selectedDay = dayjs(selectedDate).startOf('day');

    if (selectedDay.isAfter(today)) {
      Toast.show({
        type: 'info',
        text1: 'Cannot complete future habits',
        text2: 'Please wait until the day arrives',
        position: 'bottom',
      });
      return;
    }
    setSelectedHabit(habit);
    bottomSheetModalRef.current?.present();
  };

  const handleHabitPress = (habit: Habit) => {
    const currentStatus = getHabitStatus(habit.id, selectedDate);
    const today = dayjs().startOf('day');
    const selectedDay = dayjs(selectedDate).startOf('day');

    if (selectedDay.isAfter(today)) {
      Toast.show({
        type: 'info',
        text1: 'Cannot complete future habits',
        text2: 'Please wait until the day arrives',
        position: 'bottom',
      });
      return;
    }

    if (currentStatus === 'completed') {
      Toast.show({
        type: 'info',
        text1: 'Habit already completed',
        text2: 'This habit has been completed for today',
        position: 'bottom',
      });
      return;
    }

    // Update habit status
    const newStatus =
      currentStatus === 'not_started' ? 'in_progress' : 'completed';
    toggleHabitStatus(habit.id, selectedDate, newStatus);
  };

  const handleDismiss = () => {
    setSelectedHabit(null);
  };

  if (habitsForDate.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No habits for this day</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        {habitsForDate.map((habit: Habit) => (
          <HabitItem
            key={habit.id}
            habit={habit}
            status={getHabitStatus(habit.id, selectedDate)}
            progress={getCurrentProgress(habit.id, selectedDate)}
            progressText={getProgressText(habit.id, selectedDate)}
            selectedDate={selectedDate}
            onLongPress={handleHabitLongPress}
            onPress={handleHabitPress}
          />
        ))}
      </ScrollView>
      <HabitDetailsSheet
        habit={selectedHabit}
        date={selectedDate}
        bottomSheetModalRef={bottomSheetModalRef}
        onDismiss={handleDismiss}
      />
    </>
  );
});

export default HabitList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.text.secondary,
    textAlign: 'center',
  },
});
