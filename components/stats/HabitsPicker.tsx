import ChooseHabitModal from '@/components/modals/ChooseHabitModal';
import { ACTIVE_OPACITY } from '@/components/shared/config';
import { colors, fontWeights } from '@/lib/constants/ui';
import useHabitsStore from '@/lib/habit-store/store';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon, IconButton } from 'react-native-paper';

type Props = {
  selectedHabit: string | null;
  setSelectedHabit: React.Dispatch<React.SetStateAction<string | null>>;
};

const HabitsPicker = ({ selectedHabit, setSelectedHabit }: Props) => {
  const [showChooseModal, setShowChooseModal] = useState(false);
  const habits = useHabitsStore((state) => state.habits);
  const habitName = selectedHabit
    ? habits.get(selectedHabit)?.name
    : 'All habits';

  const onDismissChooseModal = () => {
    setShowChooseModal(false);
  };
  const onSelectHabit = (habitId: string | null) => {
    setSelectedHabit(habitId);
    setShowChooseModal(false);
  };
  const handleReset = () => {
    setSelectedHabit(null);
  };
  return (
    <>
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>Selected habits</Text>
        {selectedHabit ? (
          <IconButton
            icon={() => (
              <MaterialIcons
                name="settings-backup-restore"
                size={24}
                color={colors.text}
              />
            )}
            style={styles.noMargin}
            onPress={handleReset}
          />
        ) : (
          <View style={{ height: 40 }} />
        )}
      </View>
      <TouchableOpacity
        style={styles.selectHabitButton}
        activeOpacity={ACTIVE_OPACITY}
        onPress={() => setShowChooseModal(true)}
      >
        <View style={styles.buttonRow}>
          <MaterialIcons
            name="check-circle"
            size={24}
            color={colors.habitColors.meadowGreen}
          />
          <Text style={styles.buttonText}>Habits</Text>
        </View>
        <View style={styles.buttonRow}>
          <Text style={styles.habitText}>{habitName}</Text>
          <Icon
            source={require('@/assets/icons/chevron-right.png')}
            size={18}
            color={colors.text}
          />
        </View>
      </TouchableOpacity>
      <ChooseHabitModal
        visible={showChooseModal}
        onDismiss={onDismissChooseModal}
        selectedHabit={selectedHabit}
        onSelectHabit={onSelectHabit}
      />
    </>
  );
};

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 13,
    fontFamily: fontWeights.medium,
    color: colors.text,
    opacity: 0.5,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  selectHabitButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    paddingRight: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...colors.dropShadow,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 14,
    fontFamily: fontWeights.semibold,
    color: colors.text,
  },
  habitText: {
    fontSize: 13,
    fontFamily: fontWeights.medium,
    color: colors.text,
  },
  noMargin: {
    margin: 0,
  },
});

export default HabitsPicker;
