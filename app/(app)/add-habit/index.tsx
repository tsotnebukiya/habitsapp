import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import useHabitsStore from '@/lib/stores/habits/store';
import { useAddHabitStore } from '@/lib/stores/add_habit_store';
import useUserProfileStore from '@/lib/stores/user_profile';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import dayjs from 'dayjs';
import CategorySelection from './category-selection';
import TemplateSelection from './template-selection';
import Colors from '@/lib/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { dateUtils } from '@/lib/utils/dayjs';

const COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEEAD',
  '#D4A5A5',
  '#9B59B6',
  '#3498DB',
];

const ICONS = ['🎯', '💪', '📚', '🏃‍♂️', '🧘‍♂️', '💧', '🥗', '😴'];

export default function AddHabit() {
  const router = useRouter();
  const { profile } = useUserProfileStore();
  const addHabit = useHabitsStore((state) => state.addHabit);
  const { formData, setFormField, resetForm, isValid, currentStep } =
    useAddHabitStore();
  const insets = useSafeAreaInsets();
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

  // Helper function for toggling days of week
  const toggleDayOfWeek = (dayIndex: number) => {
    const currentDays = [...formData.daysOfWeek];

    if (currentDays.includes(dayIndex)) {
      // Don't allow removing the last day
      if (currentDays.length === 1) return;

      // Remove the day
      setFormField(
        'daysOfWeek',
        currentDays.filter((day) => day !== dayIndex)
      );
    } else {
      // Add the day
      setFormField('daysOfWeek', [...currentDays, dayIndex].sort());
    }
  };

  // Reset form when component mounts
  useEffect(() => {
    resetForm();

    // Set default values only if needed (resetForm handles initial)
    // Default reminder time is handled when toggling the switch
    // Default end date is handled when toggling the switch
  }, [resetForm]); // Added resetForm dependency

  const handleSubmit = async () => {
    if (!formData.name.trim() || !profile?.id) return;

    try {
      const habit = {
        name: formData.name,
        description: formData.description,
        color: formData.color,
        icon: formData.icon,
        frequency_type: formData.frequencyType,
        start_date: dateUtils.toServerDateString(formData.startDate),
        user_id: profile.id,
        is_active: true,
        category_name: formData.category,

        // Updated or new fields
        days_of_week:
          formData.frequencyType === 'weekly' ? formData.daysOfWeek : null,
        end_date:
          formData.hasEndDate && formData.endDate
            ? dateUtils.toServerDateString(formData.endDate)
            : null,
        gamification_attributes: null,
        reminder_time: formData.hasReminder ? formData.reminderTime : null,
        streak_goal: formData.streakGoal,

        // Existing fields
        completions_per_day:
          formData.goal.unit.id === 'count' ? formData.goal.value : 1,
        goal_unit:
          formData.goal.unit.id === 'count'
            ? null
            : formData.goal.unit.shortName,
        goal_value:
          formData.goal.unit.id === 'count' ? null : formData.goal.value,
      };

      addHabit(habit);

      router.back();
    } catch (error) {
      // ... error handling ...
    }
  };

  // Helper function to get Date object for Time Picker from HH:mm string
  const getPickerDate = (timeString: string | null): Date => {
    if (!timeString) return dayjs().hour(9).minute(0).toDate(); // Default to 9 AM if null
    const [hour, minute] = timeString.split(':').map(Number);
    return dayjs().hour(hour).minute(minute).toDate();
  };

  // Render different components based on current step
  if (currentStep === 'category') {
    return <CategorySelection />;
  }

  if (currentStep === 'templates') {
    return <TemplateSelection />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Habit</Text>
        <TouchableOpacity onPress={handleSubmit}>
          <Text
            style={[styles.saveButton, !isValid && styles.saveButtonDisabled]}
          >
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.form}
        contentContainerStyle={{ paddingBottom: insets.bottom || 20 }}
      >
        <TextInput
          style={styles.input}
          placeholder="Habit name"
          value={formData.name}
          onChangeText={(value) => setFormField('name', value)}
        />

        <Text style={styles.sectionTitle}>Goal</Text>
        <TouchableOpacity
          style={styles.goalButton}
          onPress={() => router.push('/add-habit/goal-choosing')}
        >
          <View style={styles.goalInfo}>
            <Text style={styles.goalValue}>
              {formData.goal.value} {formData.goal.unit.shortName}
            </Text>
            <Text style={styles.goalUnit}>{formData.goal.unit.name}</Text>
          </View>
          <FontAwesome6 name="chevron-right" size={16} color="#8E8E93" />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Color</Text>
        <View style={styles.colorGrid}>
          {COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                formData.color === color && styles.selectedOption,
              ]}
              onPress={() => setFormField('color', color)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Icon</Text>
        <View style={styles.iconGrid}>
          {ICONS.map((icon) => (
            <TouchableOpacity
              key={icon}
              style={[
                styles.iconOption,
                formData.icon === icon && styles.selectedOption,
              ]}
              onPress={() => setFormField('icon', icon)}
            >
              <Text style={styles.iconText}>{icon}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {!formData.showAdvancedSettings && (
          <TouchableOpacity
            style={styles.advancedSettingsButton}
            onPress={() => setFormField('showAdvancedSettings', true)}
          >
            <Text style={styles.advancedSettingsText}>
              Show Advanced Settings
            </Text>
            <FontAwesome6 name="chevron-down" size={16} color="#8E8E93" />
          </TouchableOpacity>
        )}

        {formData.showAdvancedSettings && (
          <>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={formData.description}
              onChangeText={(value) => setFormField('description', value)}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.sectionTitle}>Category</Text>
            <View style={styles.categoryContainer}>
              {['physical', 'mental', 'emotional', 'spiritual'].map(
                (category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryOption,
                      formData.category === category && styles.selectedOption,
                    ]}
                    onPress={() => setFormField('category', category as any)}
                  >
                    <Text style={styles.categoryText}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            <Text style={styles.sectionTitle}>Frequency</Text>
            <View style={styles.frequencyOptions}>
              {['daily', 'weekly'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.frequencyOption,
                    formData.frequencyType === type && styles.selectedFrequency,
                  ]}
                  onPress={() =>
                    setFormField('frequencyType', type as 'daily' | 'weekly')
                  }
                >
                  <Text
                    style={[
                      styles.frequencyText,
                      formData.frequencyType === type &&
                        styles.selectedFrequencyText,
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Start Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setDatePickerVisible(true)}
            >
              <View style={styles.dateButtonContent}>
                <Text style={styles.dateButtonText}>
                  {dateUtils.fromUTC(formData.startDate).format('MMMM D, YYYY')}
                </Text>
                <FontAwesome6 name="calendar" size={16} color="#8E8E93" />
              </View>
            </TouchableOpacity>

            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={(date) => {
                setDatePickerVisible(false);
                setFormField('startDate', date);
              }}
              onCancel={() => setDatePickerVisible(false)}
              date={formData.startDate}
            />

            {formData.frequencyType === 'weekly' && (
              <>
                <Text style={styles.sectionTitle}>Days of Week</Text>
                <View style={styles.daysContainer}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                    (day, index) => (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.dayButton,
                          formData.daysOfWeek.includes(index) &&
                            styles.selectedDay,
                        ]}
                        onPress={() => toggleDayOfWeek(index)}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            formData.daysOfWeek.includes(index) &&
                              styles.selectedDayText,
                          ]}
                        >
                          {day}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>
              </>
            )}

            {/* End Date */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>End Date</Text>
              <Switch
                value={formData.hasEndDate}
                onValueChange={(value) => {
                  setFormField('hasEndDate', value);
                  if (value && !formData.endDate) {
                    // Set default end date to 30 days from start
                    const endDate = new Date(formData.startDate);
                    endDate.setDate(endDate.getDate() + 30);
                    setFormField('endDate', endDate);
                  }
                }}
              />
            </View>

            {formData.hasEndDate && (
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setEndDatePickerVisible(true)}
              >
                <View style={styles.dateButtonContent}>
                  <Text style={styles.dateButtonText}>
                    {formData.endDate
                      ? dateUtils
                          .fromUTC(formData.endDate)
                          .format('MMMM D, YYYY')
                      : 'Select End Date'}
                  </Text>
                  <FontAwesome6 name="calendar" size={16} color="#8E8E93" />
                </View>
              </TouchableOpacity>
            )}

            <DateTimePickerModal
              isVisible={isEndDatePickerVisible}
              mode="date"
              onConfirm={(date) => {
                setEndDatePickerVisible(false);
                setFormField('endDate', date);
              }}
              onCancel={() => setEndDatePickerVisible(false)}
              date={formData.endDate || dayjs().toDate()}
              minimumDate={formData.startDate}
            />

            {/* Reminder Time */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Daily Reminder</Text>
              <Switch
                value={formData.hasReminder}
                onValueChange={(value) => {
                  setFormField('hasReminder', value);
                  if (value && !formData.reminderTime) {
                    // Set default reminder time string to 9 AM
                    setFormField('reminderTime', '09:00');
                  }
                  // If toggled off, we might want to set reminderTime back to null
                  else {
                    setFormField('reminderTime', null);
                  }
                }}
              />
            </View>

            {formData.hasReminder && (
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setTimePickerVisible(true)}
              >
                <View style={styles.dateButtonContent}>
                  <Text style={styles.dateButtonText}>
                    {/* Format HH:mm string for display */}
                    {formData.reminderTime
                      ? dayjs(getPickerDate(formData.reminderTime)).format(
                          'h:mm A'
                        )
                      : 'Select Time'}
                  </Text>
                  <FontAwesome6 name="clock" size={16} color="#8E8E93" />
                </View>
              </TouchableOpacity>
            )}

            <DateTimePickerModal
              isVisible={isTimePickerVisible}
              mode="time"
              onConfirm={(date) => {
                // Convert selected date object to HH:mm string
                const selectedTime = dayjs(date);
                const formattedTime = selectedTime.format('HH:mm');
                setFormField('reminderTime', formattedTime);
                setTimePickerVisible(false);
              }}
              onCancel={() => setTimePickerVisible(false)}
              // Convert HH:mm string back to Date for the picker
              date={getPickerDate(formData.reminderTime)}
            />

            {/* Streak Goal */}
            <Text style={styles.sectionTitle}>Streak Goal</Text>
            <View style={styles.streakGoalContainer}>
              <Text style={styles.streakGoalLabel}>
                Set a target streak to achieve (optional)
              </Text>
              <View style={styles.streakInputContainer}>
                <TextInput
                  style={styles.streakInput}
                  keyboardType="number-pad"
                  value={formData.streakGoal?.toString() || ''}
                  onChangeText={(value) => {
                    const num = parseInt(value);
                    setFormField('streakGoal', isNaN(num) ? null : num);
                  }}
                  placeholder="e.g., 21"
                />
                <Text style={styles.streakInputLabel}>days</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  saveButton: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  form: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 4,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  iconOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 4,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  selectedOption: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  frequencyOptions: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  frequencyOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  selectedFrequency: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  frequencyText: {
    color: '#000',
    fontSize: 16,
  },
  selectedFrequencyText: {
    color: '#fff',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  dateButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButtonText: {
    fontSize: 16,
  },
  goalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.light.background.paper,
    borderRadius: 12,
    marginBottom: 24,
  },
  goalInfo: {
    flex: 1,
  },
  goalValue: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text.primary,
    marginBottom: 4,
  },
  goalUnit: {
    fontSize: 14,
    color: Colors.light.text.secondary,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryOption: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    width: '48%',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  dayText: {
    fontSize: 14,
  },
  selectedDay: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  selectedDayText: {
    color: '#fff',
  },
  advancedSettingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginTop: 24,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  advancedSettingsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
  streakGoalContainer: {
    marginBottom: 24,
  },
  streakGoalLabel: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  streakInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    width: 120,
    marginRight: 8,
    fontSize: 16,
  },
  streakInputLabel: {
    color: '#000',
    fontSize: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 8,
  },
  settingLabel: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});
