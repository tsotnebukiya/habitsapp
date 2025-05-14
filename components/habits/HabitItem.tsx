import Colors from '@/lib/constants/Colors';
import { ACTIVE_OPACITY } from '@/lib/constants/layouts';
import { Database } from '@/supabase/types';
import { FontAwesome6 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { memo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';
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
  onPlusPress: (habit: Habit) => void;
}

const HabitItem = memo(function HabitItem({
  habit,
  status,
  progress,
  progressText,
  selectedDate,
  onPlusPress,
  onLongPress,
  onPress,
}: HabitItemProps) {
  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress(habit);
  };

  const handlePlusPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPlusPress(habit);
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
                color={Colors.bgDark}
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
              {progressText}
            </Text>
          )}
        </View>
        <TouchableOpacity
          activeOpacity={ACTIVE_OPACITY}
          onPress={handlePlusPress}
          style={{
            position: 'relative',
            width: 46,
            height: 46,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundColor: 'black',
              opacity: 0.4,
              borderRadius: 12,
            }}
          />
          <Icon
            source={require('@/assets/icons/plus.png')}
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </Pressable>
  );
});

export default HabitItem;

const styles = StyleSheet.create({
  habitCard: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    height: 74,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    zIndex: 2,
    paddingLeft: 20,
    paddingRight: 14,
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
    color: Colors.bgDark,
  },
  habitDescription: {
    fontSize: 14,
    color: Colors.bgDark,
  },
  skippedText: {
    color: Colors.bgDark,
  },
  skippedDescription: {
    opacity: 0.7,
  },
  skipIcon: {
    marginBottom: 4,
  },
  progressContainer: {},
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.bgDark,
  },
});
