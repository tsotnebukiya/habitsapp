import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useHabitsStore } from '@/lib/interfaces/habits_store';
import { useAddHabitStore } from '@/lib/interfaces/add_habit_store';
import useUserProfileStore from '@/lib/interfaces/user_profile';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import Colors from '@/lib/constants/Colors';

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
  const { formData, setFormField, resetForm, isValid } = useAddHabitStore();

  // Reset form when component mounts
  useEffect(() => {
    resetForm();
  }, []);

  const handleSubmit = async () => {
    if (!formData.name.trim() || !profile?.id) return;

    await addHabit({
      name: formData.name,
      description: formData.description,
      color: formData.color,
      icon: formData.icon,
      frequency_type: formData.frequencyType,
      start_date: formData.startDate.toISOString(),
      user_id: profile.id,
      is_active: true,
      category_name: null,
      completions_per_day:
        formData.goal.unit.id === 'count' ? formData.goal.value : 1,
      days_of_week: null,
      end_date: null,
      gamification_attributes: null,
      goal_unit:
        formData.goal.unit.id === 'count' ? null : formData.goal.unit.shortName,
      goal_value:
        formData.goal.unit.id === 'count' ? null : formData.goal.value,
      reminder_time: null,
      streak_goal: null,
    });

    router.back();
  };

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

      <ScrollView style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Habit name"
          value={formData.name}
          onChangeText={(value) => setFormField('name', value)}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description (optional)"
          value={formData.description}
          onChangeText={(value) => setFormField('description', value)}
          multiline
          numberOfLines={3}
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
          <FontAwesome6
            name="chevron-right"
            size={16}
            color={Colors.light.text.secondary}
          />
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
          onPress={() => setFormField('showDatePicker', true)}
        >
          <Text>{dayjs(formData.startDate).format('MMMM D, YYYY')}</Text>
        </TouchableOpacity>

        {formData.showDatePicker && (
          <DateTimePicker
            value={formData.startDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setFormField('showDatePicker', false);
              if (selectedDate) {
                setFormField('startDate', selectedDate);
              }
            }}
          />
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
    marginTop: 16,
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
});
