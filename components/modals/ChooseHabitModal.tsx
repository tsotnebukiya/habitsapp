import { BlurView } from 'expo-blur';
import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors, fontWeights } from '@/lib/constants/ui';
import { useAllHabits } from '@/lib/hooks/useHabits';
import { sortHabits } from '@/lib/utils/habits';

import { MaterialIcons } from '@expo/vector-icons';
import { ACTIVE_OPACITY } from '../shared/config';
import ItemIcon, { getIconTint } from '../shared/Icon';

interface Props {
  visible: boolean;
  onDismiss: () => void;
  selectedHabit: string | null;
  onSelectHabit: (habitId: string | null) => void;
}

const ChooseHabitModal = ({
  visible,
  onDismiss,
  selectedHabit,
  onSelectHabit,
}: Props) => {
  const habits = useAllHabits();
  const orderedHabits = sortHabits(habits);

  const handleSelectHabit = (habitId: string | null) => {
    onSelectHabit(habitId);
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <BlurView
        intensity={5}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <View style={styles.overlay}>
        <Pressable
          style={[StyleSheet.absoluteFill, styles.backdrop]}
          onPress={onDismiss}
          android_disableSound
        />

        <View style={styles.card}>
          <Text style={styles.header}>Choose Habit</Text>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          >
            {/* All Habits Option */}
            <TouchableOpacity
              style={styles.row}
              activeOpacity={ACTIVE_OPACITY}
              onPress={() => handleSelectHabit(null)}
            >
              <View style={[styles.habit, styles.allHabitsRow]}>
                <MaterialIcons name="grid-view" size={20} color={colors.text} />
                <Text style={styles.habitName}>All habits</Text>
                {selectedHabit === null && (
                  <MaterialIcons
                    name="check-circle"
                    size={24}
                    color={colors.text}
                  />
                )}
              </View>
            </TouchableOpacity>

            {/* Individual Habits */}
            {orderedHabits.map((habit) => (
              <TouchableOpacity
                style={styles.row}
                key={habit.id}
                activeOpacity={ACTIVE_OPACITY}
                onPress={() => handleSelectHabit(habit.id)}
              >
                <View style={[styles.habit, { backgroundColor: habit.color }]}>
                  <ItemIcon
                    icon={habit.icon}
                    color={getIconTint(habit.color)}
                  />
                  <Text
                    ellipsizeMode="tail"
                    numberOfLines={1}
                    style={styles.habitName}
                  >
                    {habit.name}
                  </Text>

                  {selectedHabit === habit.id && (
                    <MaterialIcons
                      name="check-circle"
                      size={24}
                      color={colors.text}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ChooseHabitModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  backdrop: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  card: {
    width: '90%',
    maxHeight: '60%',
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.bgLight,
    gap: 8,
  },

  header: {
    fontFamily: fontWeights.interBold,
    fontSize: 20,
    color: colors.text,
    textAlign: 'center',
  },

  scroll: { flexGrow: 0 },
  list: { gap: 9, paddingVertical: 12 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  habit: {
    flex: 1,
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  allHabitsRow: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.border,
  },

  habitName: {
    flex: 1,
    color: colors.text,
    fontFamily: fontWeights.semibold,
    fontSize: 14,
  },
});
