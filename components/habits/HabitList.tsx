import React, { useRef, useState, memo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useHabitsForDate } from '@/lib/hooks/useHabits';
import HabitItem from './HabitItem';
import HabitDetailsSheet from './HabitDetailsSheet';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import useHabitsStore from '@/lib/stores/habits/store';
import Toast from 'react-native-toast-message';
import Colors from '@/lib/constants/Colors';
import dayjs from 'dayjs';
import { Habit } from '@/lib/stores/habits/types';
import { dateUtils } from '@/lib/utils/dayjs';
import { after } from 'node:test';

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

  const today = dateUtils.todayUTC();
  const selectedDay = dateUtils.fromUTC(selectedDate);
  const afterToday = selectedDay.startOf('day').isAfter(today.startOf('day'));
  const showIsAfterToast = () => {
    Toast.show({
      type: 'info',
      text1: 'Cannot complete future habits',
      text2: 'Please wait until the day arrives',
      position: 'bottom',
    });
    return;
  };

  const showIsCompletedToast = (id: string) => {
    Toast.show({
      type: 'info',
      text1: 'Habit already completed',
      text2: 'This habit has been completed for today',
      position: 'bottom',
    });
    return;
  };
  const handleHabitLongPress = (habit: Habit) => {
    if (afterToday) {
      showIsAfterToast();
      return;
    }

    setSelectedHabit(habit);
    bottomSheetModalRef.current?.present();
  };

  const handleHabitPress = (habit: Habit) => {
    if (afterToday) {
      showIsAfterToast();
      return;
    }
    const currentCompletion = getHabitStatus(habit.id, selectedDate);
    if (currentCompletion?.status === 'completed') {
      showIsCompletedToast(habit.id);
      return;
    }
    toggleHabitStatus(habit.id, selectedDate, 'toggle');
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
            status={
              getHabitStatus(habit.id, selectedDate)?.status || 'not_started'
            }
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
