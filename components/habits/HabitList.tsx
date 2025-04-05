import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Database } from '../../app/supabase_types';
import { useHabitsForDate } from '../../lib/hooks/useHabits';
import HabitItem from './HabitItem';
import HabitDetailsSheet from './HabitDetailsSheet';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useHabitsStore } from '../../lib/interfaces/habits_store';

type Habit = Database['public']['Tables']['habits']['Row'];

interface HabitListProps {
  selectedDate: Date;
}

export default function HabitList({ selectedDate }: HabitListProps) {
  const habitsForDate = useHabitsForDate(selectedDate);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const getHabitStatus = useHabitsStore((state) => state.getHabitStatus);

  const handleHabitLongPress = (habit: Habit) => {
    setSelectedHabit(habit);
    bottomSheetModalRef.current?.present();
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
            onLongPress={handleHabitLongPress}
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
  },
});
