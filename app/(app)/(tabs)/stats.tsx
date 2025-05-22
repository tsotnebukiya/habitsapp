import ChooseHabitModal from '@/components/modals/ChooseHabitModal';
import { ACTIVE_OPACITY } from '@/components/shared/config';
import { colors, fontWeights } from '@/lib/constants/ui';
import useHabitsStore from '@/lib/habit-store/store';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const StatsScreen = () => {
  const insets = useSafeAreaInsets();
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
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
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainerStyle,
        {
          paddingTop: insets.top + 17,
          paddingBottom: insets.bottom + 20,
        },
      ]}
      showsHorizontalScrollIndicator={false}
    >
      <Text style={styles.title}>Statistics</Text>
      <Text style={styles.subtitle}>Selected habits</Text>
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight, // Slightly off-white background for contrast
  },
  contentContainerStyle: {
    paddingHorizontal: 18,
  },
  title: {
    fontSize: 26,
    fontFamily: fontWeights.bold,
    color: colors.text,
    marginBottom: 17,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: fontWeights.medium,
    color: colors.text,
    opacity: 0.5,
    marginBottom: 11,
  },
  selectHabitButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 15,
    paddingRight: 18,
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
});

export default StatsScreen;
