import { ACTIVE_OPACITY } from '@/components/shared/config';
import { colors, fontWeights } from '@/lib/constants/ui';
import useHabitsStore from '@/lib/habit-store/store';
import { useTranslatedHabitStatusInfo } from '@/lib/hooks/useHabits';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { Database } from '@/supabase/types';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React from 'react';
import {
  Dimensions,
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
import * as ContextMenu from 'zeego/context-menu';
import ItemIcon, { getIconTint } from '../shared/Icon';

type Habit = Database['public']['Tables']['habits']['Row'];

const SCREEN_WIDTH = Dimensions.get('window').width;

interface HabitItemProps {
  habit: Habit;
  selectedDate: Date;
  onPress: (habit: Habit) => void;
  afterToday: boolean;
}

function HabitItem({
  habit,
  selectedDate,
  afterToday,
  onPress,
}: HabitItemProps) {
  const { t } = useTranslation();
  const { completion, progress, progressText } = useTranslatedHabitStatusInfo(
    habit.id,
    selectedDate
  );

  const toggleHabitStatus = useHabitsStore((state) => state.toggleHabitStatus);
  const deleteHabit = useHabitsStore((state) => state.deleteHabit);
  const resetHabitHistory = useHabitsStore((state) => state.resetHabitHistory);

  const isSkipped = completion?.status === 'skipped';
  const status = completion?.status || 'not_started';
  const showIsAfterToast = () => {
    Toast.show({
      type: 'error',
      text1: t('habits.cannotCompleteFuture'),
      text2: t('habits.waitUntilDay'),
      position: 'bottom',
    });
  };

  const showIsCompletedToast = () => {
    Toast.show({
      type: 'info',
      text1: t('habits.habitAlreadyCompleted'),
      text2: t('habits.habitCompletedToday'),
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
  };

  const handleDelete = () => {
    deleteHabit(habit.id);
  };

  const handleSkip = () => {
    toggleHabitStatus(habit.id, selectedDate, 'toggle_skip');
  };

  const handleResetHistory = () => {
    resetHabitHistory(habit.id);
  };

  const handleEdit = () => {
    router.push({
      pathname: '/(app)/update-habit',
      params: { habitId: habit.id },
    });
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

  const renderHabitContent = () => (
    <View
      style={[
        styles.habitCard,
        isSkipped && styles.skippedCard,
        { width: SCREEN_WIDTH - 32 },
      ]}
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
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.habitName, isSkipped && styles.skippedText]}
            >
              {habit.name}
            </Text>
          </View>

          <Text
            style={[
              styles.habitDescription,
              isSkipped && styles.skippedDescription,
            ]}
          >
            {progressText}
          </Text>
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
    </View>
  );

  return (
    <ContextMenu.Root
      {...({
        modal: false,
        _unsafeIosProps: {
          shouldWaitForMenuToHideBeforeFiringOnPressMenuItem: false,
        },
      } as any)}
    >
      <ContextMenu.Trigger style={{ borderRadius: 16, overflow: 'hidden' }}>
        <TouchableOpacity
          activeOpacity={ACTIVE_OPACITY}
          onPress={handlePress}
          onLongPress={handleLongPress}
          delayLongPress={200}
        >
          {renderHabitContent()}
        </TouchableOpacity>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Preview borderRadius={16}>
          {renderHabitContent()}
        </ContextMenu.Preview>
        <ContextMenu.Item key="edit" onSelect={handleEdit}>
          <ContextMenu.ItemTitle>{t('habits.edit')}</ContextMenu.ItemTitle>
          <ContextMenu.ItemIcon ios={{ name: 'pencil.line' }} />
        </ContextMenu.Item>
        {!isSkipped && (
          <ContextMenu.Item key="skip" onSelect={handleSkip}>
            <ContextMenu.ItemTitle>{t('habits.skip')}</ContextMenu.ItemTitle>
            <ContextMenu.ItemIcon ios={{ name: 'arrow.forward.to.line' }} />
          </ContextMenu.Item>
        )}
        {isSkipped && (
          <ContextMenu.Item key="unskip" onSelect={handleSkip}>
            <ContextMenu.ItemTitle>{t('habits.unskip')}</ContextMenu.ItemTitle>
            <ContextMenu.ItemIcon ios={{ name: 'arrow.backward.to.line' }} />
          </ContextMenu.Item>
        )}

        <ContextMenu.Item key="reset" onSelect={handleResetHistory}>
          <ContextMenu.ItemTitle>
            {t('habits.resetHistory')}
          </ContextMenu.ItemTitle>
          <ContextMenu.ItemIcon ios={{ name: 'repeat' }} />
        </ContextMenu.Item>

        <ContextMenu.Item key="delete" destructive onSelect={handleDelete}>
          <ContextMenu.ItemTitle>
            {t('habits.deleteHabit')}
          </ContextMenu.ItemTitle>
          <ContextMenu.ItemIcon ios={{ name: 'trash' }} />
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
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
    flex: 1,
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
