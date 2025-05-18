import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, fontWeights } from '@/lib/constants/ui';
import useHabitsStore from '@/lib/habit-store/store';
import { SharedSlice } from '@/lib/habit-store/types';
import { useAllHabits } from '@/lib/hooks/useHabits';
import { sortHabits } from '@/lib/utils/habits';

import Button from '../shared/Button';
import ItemIcon, { getIconTint } from '../shared/Icon';

interface Props {
  onDismiss: () => void;
}

const SortModal = ({ onDismiss }: Props) => {
  const habits = useAllHabits();
  const updateHabitOrder = useHabitsStore(
    (s: SharedSlice) => s.updateHabitOrder
  );
  const [orderedHabits, setOrderedHabits] = useState(() => sortHabits(habits));

  const moveHabit = (index: number, dir: 'up' | 'down') => {
    if (
      (dir === 'up' && index === 0) ||
      (dir === 'down' && index === orderedHabits.length - 1)
    )
      return;

    const swap = dir === 'up' ? index - 1 : index + 1;
    const next = [...orderedHabits];
    [next[index], next[swap]] = [next[swap], next[index]];
    setOrderedHabits(next);
  };

  const handleConfirm = () => {
    updateHabitOrder(orderedHabits.map((h) => h.id));
    onDismiss();
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onDismiss}>
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
          <Text style={styles.header}>Sort Habits</Text>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          >
            {orderedHabits.map((habit, i) => (
              <View style={styles.row} key={`${habit.id}-${i}`}>
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
                </View>

                <View style={styles.buttonsCol}>
                  <Pressable
                    style={styles.sortBtn}
                    disabled={i === 0}
                    android_ripple={{ borderless: true }}
                    onPress={() => moveHabit(i, 'up')}
                  >
                    <MaterialIcons
                      name="arrow-upward"
                      size={24}
                      color={i === 0 ? colors.border : colors.text}
                    />
                  </Pressable>

                  <Pressable
                    style={styles.sortBtn}
                    disabled={i === orderedHabits.length - 1}
                    android_ripple={{ borderless: true }}
                    onPress={() => moveHabit(i, 'down')}
                  >
                    <MaterialIcons
                      name="arrow-downward"
                      size={24}
                      color={
                        i === orderedHabits.length - 1
                          ? colors.border
                          : colors.text
                      }
                    />
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <Button label="Cancel" type="secondary" onPress={onDismiss} />
            <Button label="Confirm" type="primary" onPress={handleConfirm} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SortModal;

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

  row: { flexDirection: 'row', gap: 8 },

  habit: {
    flex: 1,
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  habitName: {
    flex: 1,
    color: colors.text,
    fontFamily: fontWeights.semibold,
    fontSize: 14,
  },
  buttonsCol: { flexDirection: 'row', gap: 4 },

  sortBtn: {
    height: 50,
    width: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});
