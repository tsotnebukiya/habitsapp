import React, { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Database } from '@/lib/utils/supabase_types';
import Colors from '@/lib/constants/Colors';
import * as Haptics from 'expo-haptics';
import { FontAwesome6 } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

type Habit = Database['public']['Tables']['habits']['Row'];
type HabitCompletionStatus =
  Database['public']['Enums']['habit_completion_status'];

interface HabitItemProps {
  habit: Habit;
  status: HabitCompletionStatus;
  progress: number;
  progressText: string;
  selectedDate: Date;
  onLongPress: (habit: Habit) => void;
  onPress: (habit: Habit) => void;
}

const HabitItem = memo(function HabitItem({
  habit,
  status,
  progress,
  progressText,
  selectedDate,
  onLongPress,
  onPress,
}: HabitItemProps) {
  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress(habit);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(habit);
  };

  const isSkipped = status === 'skipped';

  const progressStyle = useAnimatedStyle(() => ({
    width: withSpring(`${progress * 100.5}%`, {
      damping: 15,
      stiffness: 90,
    }),
  }));

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={200}
      style={[styles.habitCard, isSkipped && styles.skippedCard]}
    >
      {/* Base layer - dimmed habit color */}
      <View
        style={[
          styles.baseProgress,
          { backgroundColor: habit.color || '#FFFFFF', opacity: 0.3 },
        ]}
      />

      {/* Animated layer - full habit color */}
      <Animated.View
        style={[
          styles.completedProgress,
          { backgroundColor: habit.color || '#FFFFFF' },
          progressStyle,
        ]}
      />

      {/* Content */}
      <View style={styles.content}>
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

        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, isSkipped && styles.skippedText]}>
            {progressText}
          </Text>
        </View>
      </View>
    </Pressable>
  );
});

export default HabitItem;

const styles = StyleSheet.create({
  habitCard: {
    position: 'relative',
    borderRadius: 12,
    marginVertical: 8,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  content: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    zIndex: 2,
  },
  baseProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  completedProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 1,
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
  progressContainer: {
    marginLeft: 12,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text.primary,
  },
});
