import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useHabitsStore } from '../../lib/interfaces/habits_store';
import { Database } from '../../app/supabase_types';
import Colors from '../../lib/constants/Colors';
import { FontAwesome6 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

type Habit = Database['public']['Tables']['habits']['Row'];

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
  const { toggleHabitStatus, deleteHabit, getHabitStatus } = useHabitsStore();

  const snapPoints = useMemo(() => ['50%'], []);

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

  const handleDelete = async () => {
    if (!habit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await deleteHabit(habit.id);
    bottomSheetModalRef.current?.dismiss();
  };

  const handleSkipToggle = async () => {
    if (!habit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const currentStatus = getHabitStatus(habit.id, date);
    if (currentStatus === 'skipped') {
      await toggleHabitStatus(habit.id, date, 'not_started');
    } else {
      await toggleHabitStatus(habit.id, date, 'skipped');
    }
    bottomSheetModalRef.current?.dismiss();
  };

  const currentStatus = habit ? getHabitStatus(habit.id, date) : 'not_started';
  const isSkipped = currentStatus === 'skipped';

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
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

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  isSkipped && styles.activeActionButton,
                ]}
                onPress={handleSkipToggle}
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
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
              >
                <FontAwesome6 name="trash" size={20} color="#FFFFFF" />
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
    color: Colors.light.text.primary,
  },
  habitDescription: {
    fontSize: 16,
    color: Colors.light.text.secondary,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: Colors.light.background.paper,
    gap: 12,
  },
  activeActionButton: {
    backgroundColor: Colors.shared.primary[500],
  },
  deleteButton: {
    backgroundColor: Colors.shared.error.main,
  },
  actionText: {
    fontSize: 16,
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
