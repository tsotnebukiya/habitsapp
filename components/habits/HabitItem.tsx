import { ACTIVE_OPACITY } from '@/components/shared/config';
import { colors, fontWeights } from '@/lib/constants/ui';
import useHabitsStore from '@/lib/habit-store/store';
import { Database } from '@/supabase/types';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
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
import Toast from 'react-native-toast-message';
import ItemIcon, { getIconTint } from '../shared/Icon';

type Habit = Database['public']['Tables']['habits']['Row'];

interface HabitItemProps {
  habit: Habit;
  selectedDate: Date;
  onLongPress: (habit: Habit) => void;
  onPress: (habit: Habit) => void;
  afterToday: boolean;
}

function HabitItem({
  habit,
  selectedDate,
  afterToday,
  onLongPress,
  onPress,
}: HabitItemProps) {
  const status = useHabitsStore(
    (state) =>
      state.getHabitStatus(habit.id, selectedDate)?.status || 'not_started'
  );

  const progress = useHabitsStore((state) =>
    state.getCurrentProgress(habit.id, selectedDate)
  );

  const progressText = useHabitsStore((state) =>
    state.getProgressText(habit.id, selectedDate)
  );

  const toggleHabitStatus = useHabitsStore((state) => state.toggleHabitStatus);

  const isSkipped = status === 'skipped';

  const showIsAfterToast = () => {
    Toast.show({
      type: 'error',
      text1: 'Cannot complete future habits',
      text2: 'Please wait until the day arrives',
      position: 'bottom',
    });
  };

  const showIsCompletedToast = () => {
    Toast.show({
      type: 'info',
      text1: 'Habit already completed',
      text2: 'This habit has been completed for today',
      position: 'bottom',
    });
  };

  const handlePlusPress = () => {
    if (afterToday) {
      showIsAfterToast();
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isSkipped) {
      onPress(habit);
      return;
    }
    if (status === 'completed') {
      showIsCompletedToast();
      return;
    }
    toggleHabitStatus(habit.id, selectedDate, 'toggle');
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(habit);
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress(habit);
  };

  const progressStyle = useAnimatedStyle(() => ({
    width: withSpring(`${progress * 100}%`, {
      damping: 15,
      stiffness: 90,
    }),
  }));

  const iconRender = () => {
    if (isSkipped) {
      return <MaterialIcons name="skip-next" size={24} color="white" />;
    } else {
      if (progress === 1) {
        return (
          <Icon
            source={require('@/assets/icons/checklight.png')}
            size={24}
            color="white"
          />
        );
      } else {
        return (
          <Icon
            source={require('@/assets/icons/plus.png')}
            size={24}
            color="white"
          />
        );
      }
    }
  };
  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={200}
      style={[styles.habitCard, isSkipped && styles.skippedCard]}
    >
      <View
        style={[
          styles.baseProgress,
          { backgroundColor: habit.color || '#FFFFFF', opacity: 0.38 },
        ]}
      />
      <Animated.View
        style={[
          styles.completedProgress,
          { backgroundColor: habit.color || '#FFFFFF' },
          progressStyle,
        ]}
      />

      <View style={styles.content}>
        {habit.type === 'BAD' && (
          <View style={styles.badHabbit}>
            <Icon source={require('@/assets/icons/badhabbit.png')} size={20} />
          </View>
        )}
        <ItemIcon icon={habit.icon} color={getIconTint(habit.color)} />
        <View style={styles.habitInfo}>
          <View style={styles.nameContainer}>
            <Text style={[styles.habitName, isSkipped && styles.skippedText]}>
              {habit.name}
            </Text>
            {isSkipped && (
              <MaterialIcons
                name="skip-next"
                size={18}
                color={colors.bgDark}
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
          {iconRender()}
        </TouchableOpacity>
      </View>
    </Pressable>
  );
}

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
    gap: 15,
    height: '100%',
    zIndex: 2,
    paddingLeft: 20,
    paddingRight: 14,
  },
  badHabbit: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 1,
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
    gap: 4,
  },
  habitName: {
    fontSize: 14,
    fontFamily: fontWeights.bold,
    marginBottom: 4,
    color: colors.text,
  },
  habitDescription: {
    fontSize: 11,
    fontFamily: fontWeights.regular,
    color: colors.text,
  },
  skippedText: {
    color: colors.bgDark,
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
    color: colors.bgDark,
  },
});
