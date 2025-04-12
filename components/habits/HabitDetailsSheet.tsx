import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useHabitsStore } from '@/lib/stores/habits_store';
import { Database } from '@/lib/utils/supabase_types';
import Colors from '@/lib/constants/Colors';
import { FontAwesome6 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import CircularCounter from '../shared/CircularCounter';
import Toast from 'react-native-toast-message';
import { StreakDays } from '@/lib/constants/achievements';

type Habit = Database['public']['Tables']['habits']['Row'];
type HabitCompletionStatus =
  Database['public']['Enums']['habit_completion_status'];

interface HabitDetailsSheetProps {
  habit: Habit | null;
  date: Date;
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
  onDismiss: () => void;
}

export default function HabitDetailsSheet({
  habit,
  date,
  bottomSheetModalRef,
  onDismiss,
}: HabitDetailsSheetProps) {
  const {
    toggleHabitStatus,
    deleteHabit,
    getHabitStatus,
    getCurrentValue,
    getCompletions,
  } = useHabitsStore();
  const snapPoints = useMemo(() => ['1%', '60%'], []);
  const { width } = Dimensions.get('window');
  const circularCounterSize = Math.min(width * 0.45, 160);
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    []
  );
  const handleDelete = () => {
    if (!habit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    deleteHabit(habit.id);
    bottomSheetModalRef.current?.dismiss();
  };

  const handleEdit = () => {
    if (!habit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Will be expanded with edit functionality later
  };

  const handleSkip = () => {
    if (!habit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleHabitStatus(habit.id, date, isSkipped ? 'not_started' : 'skipped', 0);
  };

  const handleCompletion = () => {
    if (!habit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const currentStatus = getHabitStatus(habit.id, date);
    if (currentStatus === 'completed') {
      // Uncomplete - reset to 0
      toggleHabitStatus(habit.id, date, 'not_started', 0);
    } else {
      // Complete
      const maxValue = habit.goal_value || habit.completions_per_day || 1;
      toggleHabitStatus(habit.id, date, 'completed', maxValue);
    }
  };

  const handleProgressChange = (newValue: number) => {
    if (!habit) return;

    const newStatus = newValue >= maxValue ? 'completed' : 'in_progress';
    toggleHabitStatus(habit.id, date, newStatus, newValue);
  };

  // Fresh reads of the current status on each render
  const currentStatus = habit ? getHabitStatus(habit.id, date) : 'not_started';
  const isSkipped = currentStatus === 'skipped';
  const isCompleted = currentStatus === 'completed';
  const currentValue = habit ? getCurrentValue(habit.id, date) : 0;

  // Always use CircularCounter regardless of habit type
  const maxValue = habit?.goal_value || habit?.completions_per_day || 1;

  // Step size - 10% of goal for measured habits, 1 for others
  const stepSize = habit?.goal_value ? Math.max(habit.goal_value * 0.1, 1) : 1;

  // Get appropriate label for circular counter
  const progressLabel = habit?.goal_unit || 'Completions';

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={1}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      onDismiss={onDismiss}
      enablePanDownToClose
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.indicator}
    >
      <View style={styles.container}>
        {habit && (
          <>
            <View style={styles.header}>
              <View
                style={[styles.iconContainer, { backgroundColor: habit.color }]}
              >
                <Text style={styles.icon}>{habit.icon}</Text>
              </View>
              <View style={styles.habitInfo}>
                <Text style={styles.habitName}>{habit.name}</Text>
                {habit.description && (
                  <Text style={styles.habitDescription}>
                    {habit.description}
                  </Text>
                )}
              </View>
            </View>

            {/* Progress Section */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.sectionTitle}>Today's Progress</Text>

                {isSkipped ? (
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Skipped</Text>
                  </View>
                ) : isCompleted ? (
                  <View style={[styles.statusBadge, styles.completedBadge]}>
                    <Text style={styles.completedStatusText}>Completed</Text>
                  </View>
                ) : currentValue > 0 ? (
                  <View style={[styles.statusBadge, styles.progressBadge]}>
                    <Text style={styles.progressStatusText}>In Progress</Text>
                  </View>
                ) : null}
              </View>

              <CircularCounter
                value={currentValue}
                onChange={handleProgressChange}
                maxValue={maxValue}
                step={stepSize}
                size={circularCounterSize}
                progressColor={habit.color}
                buttonColor={habit.color}
                label={progressLabel}
                disabled={isSkipped}
              />

              <View style={styles.completionButtonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.completionButton,
                    isCompleted
                      ? styles.uncompleteButton
                      : styles.completeButton,
                    { borderColor: habit.color },
                  ]}
                  onPress={handleCompletion}
                >
                  <FontAwesome6
                    name={isCompleted ? 'rotate-left' : 'check'}
                    size={16}
                    color={
                      isCompleted ? Colors.light.text.primary : habit.color
                    }
                    style={styles.buttonIcon}
                  />
                  <Text
                    style={[
                      styles.completionButtonText,
                      isCompleted
                        ? styles.uncompleteButtonText
                        : { color: habit.color },
                    ]}
                  >
                    {isCompleted ? 'Uncomplete' : 'Complete'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  isSkipped && styles.activeActionButton,
                ]}
                onPress={handleSkip}
              >
                <FontAwesome6
                  name="forward-step"
                  size={20}
                  color={isSkipped ? '#FFFFFF' : Colors.light.text.primary}
                />
                <Text
                  style={[
                    styles.actionText,
                    isSkipped && styles.activeActionText,
                  ]}
                >
                  {isSkipped ? 'Unskip' : 'Skip'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleEdit}
              >
                <FontAwesome6
                  name="pen"
                  size={18}
                  color={Colors.light.text.primary}
                />
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
              >
                <FontAwesome6 name="trash" size={18} color="#FFFFFF" />
                <Text style={[styles.actionText, styles.deleteText]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: Colors.light.background.default,
  },
  indicator: {
    backgroundColor: Colors.light.text.secondary,
    width: 40,
  },
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 24, // Reduced bottom padding
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16, // Reduced margin
  },
  iconContainer: {
    width: 45, // Slightly smaller
    height: 45, // Slightly smaller
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 22, // Slightly smaller
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 18, // Smaller font
    fontWeight: '600',
    marginBottom: 4,
    color: Colors.light.text.primary,
  },
  habitDescription: {
    fontSize: 14, // Smaller font
    color: Colors.light.text.secondary,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: 20, // Reduced margin
    padding: 14, // Reduced padding
    backgroundColor: Colors.light.background.paper,
    borderRadius: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12, // Reduced margin
  },
  sectionTitle: {
    fontSize: 16, // Smaller font
    fontWeight: '600',
    color: Colors.light.text.primary,
  },
  statusBadge: {
    paddingHorizontal: 8, // Reduced padding
    paddingVertical: 2, // Reduced padding
    borderRadius: 12,
    backgroundColor: Colors.light.background.default,
  },
  completedBadge: {
    backgroundColor: Colors.shared.success.light,
  },
  progressBadge: {
    backgroundColor: Colors.shared.primary[100],
  },
  statusText: {
    fontSize: 13, // Smaller font
    fontWeight: '500',
    color: Colors.light.text.secondary,
  },
  completedStatusText: {
    fontSize: 13, // Smaller font
    fontWeight: '500',
    color: Colors.shared.success.main,
  },
  progressStatusText: {
    fontSize: 13, // Smaller font
    fontWeight: '500',
    color: Colors.shared.primary[500],
  },
  completionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12, // Reduced margin
    width: '100%',
  },
  completionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7, // Reduced padding
    paddingHorizontal: 14, // Reduced padding
    borderRadius: 18,
    borderWidth: 1,
    minWidth: 110, // Reduced width
  },
  completeButton: {
    backgroundColor: 'transparent',
  },
  uncompleteButton: {
    backgroundColor: 'transparent',
    borderColor: Colors.light.text.disabled,
  },
  buttonIcon: {
    marginRight: 6,
  },
  completionButtonText: {
    fontSize: 13, // Smaller font
    fontWeight: '600',
  },
  uncompleteButtonText: {
    color: Colors.light.text.primary,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.light.text.disabled,
    opacity: 0.2,
    marginBottom: 16, // Reduced margin
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10, // Reduced padding
    borderRadius: 12,
    backgroundColor: Colors.light.background.paper,
    gap: 6, // Reduced gap
  },
  activeActionButton: {
    backgroundColor: Colors.shared.primary[500],
  },
  deleteButton: {
    backgroundColor: Colors.shared.error.main,
  },
  actionText: {
    fontSize: 13, // Smaller font
    fontWeight: '500',
    color: Colors.light.text.primary,
  },
  activeActionText: {
    color: '#FFFFFF',
  },
  deleteText: {
    color: '#FFFFFF',
  },
});
