import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Database } from '../../app/supabase_types';
import { useHabitsForDate } from '../../lib/hooks/useHabits'; // Import the new hook

type Habit = Database['public']['Tables']['habits']['Row'];

interface HabitListProps {
  selectedDate: Date;
}

export default function HabitList({ selectedDate }: HabitListProps) {
  // Use the custom hook to get memoized habits for the date
  const habitsForDate = useHabitsForDate(selectedDate);

  if (habitsForDate.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No habits for this day</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {habitsForDate.map((habit: Habit) => (
        <View
          key={habit.id}
          style={[
            styles.habitCard,
            { backgroundColor: habit.color || '#FFFFFF' },
          ]}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{habit.icon}</Text>
          </View>
          <View style={styles.habitInfo}>
            <Text style={styles.habitName}>{habit.name}</Text>
            {habit.description && (
              <Text style={styles.habitDescription}>{habit.description}</Text>
            )}
          </View>
        </View>
      ))}
    </ScrollView>
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
  habitCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  habitDescription: {
    fontSize: 14,
    color: '#666',
  },
});
