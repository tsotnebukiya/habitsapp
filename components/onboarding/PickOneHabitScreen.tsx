import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  useOnboardingStore,
  type HabitData,
  type OnboardingItem,
} from '@/lib/stores/onboardingStore';

const { width: screenWidth } = Dimensions.get('window');

interface PickOneHabitScreenProps {
  item: OnboardingItem;
  onNext: () => void;
  onPrevious: () => void;
  isFirstScreen: boolean;
  isLastScreen: boolean;
}

const HABITS = [
  {
    id: 'exercise',
    name: 'Exercise',
    icon: '🏃‍♂️',
    description: 'Daily movement and fitness',
  },
  {
    id: 'meditation',
    name: 'Meditation',
    icon: '🧘‍♀️',
    description: 'Mindfulness and mental clarity',
  },
  {
    id: 'reading',
    name: 'Reading',
    icon: '📚',
    description: 'Knowledge and personal growth',
  },
  {
    id: 'water',
    name: 'Drink Water',
    icon: '💧',
    description: 'Stay hydrated throughout the day',
  },
  {
    id: 'sleep',
    name: 'Better Sleep',
    icon: '😴',
    description: 'Consistent sleep schedule',
  },
  {
    id: 'gratitude',
    name: 'Gratitude Journal',
    icon: '📝',
    description: 'Daily appreciation practice',
  },
  {
    id: 'healthy-eating',
    name: 'Healthy Eating',
    icon: '🥗',
    description: 'Nutritious meal choices',
  },
  {
    id: 'walk',
    name: 'Daily Walk',
    icon: '🚶‍♀️',
    description: 'Fresh air and movement',
  },
];

const FREQUENCIES = [
  { id: 'daily', name: 'Daily', description: 'Every day' },
  { id: 'weekdays', name: 'Weekdays', description: 'Monday to Friday' },
  { id: 'weekly', name: 'Weekly', description: '3-4 times per week' },
  { id: 'weekend', name: 'Weekends', description: 'Saturday and Sunday' },
];

export default function PickOneHabitScreen({
  item,
  onNext,
  onPrevious,
  isFirstScreen,
  isLastScreen,
}: PickOneHabitScreenProps) {
  const { setAnswer, getAnswer } = useOnboardingStore();
  const existingAnswer = getAnswer(item.id) as HabitData | undefined;

  const [selectedHabit, setSelectedHabit] = useState<string>(
    existingAnswer?.selectedHabit || ''
  );
  const [selectedFrequency, setSelectedFrequency] = useState<string>(
    existingAnswer?.frequency || ''
  );

  const handleHabitSelect = (habitId: string) => {
    setSelectedHabit(habitId);
    updateAnswer(habitId, selectedFrequency);
  };

  const handleFrequencySelect = (frequencyId: string) => {
    setSelectedFrequency(frequencyId);
    updateAnswer(selectedHabit, frequencyId);
  };

  const updateAnswer = (habit: string, frequency: string) => {
    if (habit && frequency) {
      setAnswer(item.id, {
        selectedHabit: habit,
        frequency: frequency,
      } as HabitData);
    }
  };

  const canProceed = selectedHabit && selectedFrequency;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Pick Your First Habit</Text>
          <Text style={styles.subtitle}>
            Choose one habit to focus on. You can add more later.
          </Text>
        </View>

        {/* Habit Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>
            What habit would you like to build?
          </Text>
          <View style={styles.habitsGrid}>
            {HABITS.map((habit) => (
              <TouchableOpacity
                key={habit.id}
                style={[
                  styles.habitOption,
                  selectedHabit === habit.id && styles.selectedHabitOption,
                ]}
                onPress={() => handleHabitSelect(habit.id)}
              >
                <Text style={styles.habitIcon}>{habit.icon}</Text>
                <Text
                  style={[
                    styles.habitName,
                    selectedHabit === habit.id && styles.selectedHabitText,
                  ]}
                >
                  {habit.name}
                </Text>
                <Text
                  style={[
                    styles.habitDescription,
                    selectedHabit === habit.id && styles.selectedHabitText,
                  ]}
                >
                  {habit.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Frequency Selection */}
        {selectedHabit && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>How often?</Text>
            <View style={styles.frequencyContainer}>
              {FREQUENCIES.map((frequency) => (
                <TouchableOpacity
                  key={frequency.id}
                  style={[
                    styles.frequencyOption,
                    selectedFrequency === frequency.id &&
                      styles.selectedFrequencyOption,
                  ]}
                  onPress={() => handleFrequencySelect(frequency.id)}
                >
                  <Text
                    style={[
                      styles.frequencyName,
                      selectedFrequency === frequency.id &&
                        styles.selectedFrequencyText,
                    ]}
                  >
                    {frequency.name}
                  </Text>
                  <Text
                    style={[
                      styles.frequencyDescription,
                      selectedFrequency === frequency.id &&
                        styles.selectedFrequencyText,
                    ]}
                  >
                    {frequency.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: screenWidth,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  titleContainer: {
    paddingTop: 40,
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  sectionContainer: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
  },
  habitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  habitOption: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    minHeight: 120,
  },
  selectedHabitOption: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  habitIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  habitName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4,
  },
  habitDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  selectedHabitText: {
    color: '#3B82F6',
  },
  frequencyContainer: {
    gap: 12,
  },
  frequencyOption: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  selectedFrequencyOption: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  frequencyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  frequencyDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedFrequencyText: {
    color: '#3B82F6',
  },
});
