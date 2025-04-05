import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Database } from '../../app/supabase_types';
import Colors from '../../lib/constants/Colors';
import * as Haptics from 'expo-haptics';
import { FontAwesome6 } from '@expo/vector-icons';

type Habit = Database['public']['Tables']['habits']['Row'];
type HabitCompletionStatus =
  Database['public']['Enums']['habit_completion_status'];

interface HabitItemProps {
  habit: Habit;
  status: HabitCompletionStatus;
  onLongPress: (habit: Habit) => void;
}

export default function HabitItem({
  habit,
  status,
  onLongPress,
}: HabitItemProps) {
  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress(habit);
  };

  const isSkipped = status === 'skipped';

  return (
    <TouchableOpacity
      onLongPress={handleLongPress}
      delayLongPress={200}
      style={[
        styles.habitCard,
        { backgroundColor: habit.color || '#FFFFFF' },
        isSkipped && styles.skippedCard,
      ]}
    >
      <View style={[styles.iconContainer, isSkipped && styles.skippedIcon]}>
        <Text style={[styles.icon, isSkipped && styles.skippedText]}>
          {habit.icon}
        </Text>
      </View>
      <View style={styles.habitInfo}>
        <View style={styles.nameContainer}>
          <Text style={[styles.habitName, isSkipped && styles.skippedText]}>
            {habit.name}
          </Text>
          {isSkipped && (
            <FontAwesome6
              name="forward-step"
              size={12}
              color={Colors.light.text.secondary}
              style={styles.skipIcon}
            />
          )}
        </View>
        {habit.description && (
          <Text
            style={[
              styles.habitDescription,
              isSkipped && styles.skippedDescription,
            ]}
          >
            {habit.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  habitCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    alignItems: 'center',
  },
  skippedCard: {
    opacity: 0.7,
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
  skippedIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  icon: {
    fontSize: 20,
  },
  habitInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  habitName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
    color: Colors.light.text.primary,
  },
  habitDescription: {
    fontSize: 14,
    color: Colors.light.text.secondary,
  },
  skippedText: {
    color: Colors.light.text.secondary,
  },
  skippedDescription: {
    opacity: 0.7,
  },
  skipIcon: {
    marginBottom: 4,
  },
});
