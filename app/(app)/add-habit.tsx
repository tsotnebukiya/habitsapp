import React, { useState } from 'react';
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
import { useHabitsStore } from '../../lib/interfaces/habits_store';
import useUserProfileStore from '../../lib/interfaces/user_profile';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';

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

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
  const [frequencyType, setFrequencyType] = useState('daily');
  const [startDate, setStartDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !profile?.id) return;

    await addHabit({
      name,
      description,
      color: selectedColor,
      icon: selectedIcon,
      frequency_type: frequencyType,
      start_date: startDate.toISOString(),
      user_id: profile.id,
      is_active: true,
      category_name: null,
      completions_per_day: 1,
      days_of_week: null,
      end_date: null,
      gamification_attributes: null,
      goal_unit: null,
      goal_value: null,
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
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Habit name"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description (optional)"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        <Text style={styles.sectionTitle}>Color</Text>
        <View style={styles.colorGrid}>
          {COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                selectedColor === color && styles.selectedOption,
              ]}
              onPress={() => setSelectedColor(color)}
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
                selectedIcon === icon && styles.selectedOption,
              ]}
              onPress={() => setSelectedIcon(icon)}
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
                frequencyType === type && styles.selectedFrequency,
              ]}
              onPress={() => setFrequencyType(type)}
            >
              <Text
                style={[
                  styles.frequencyText,
                  frequencyType === type && styles.selectedFrequencyText,
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
          onPress={() => setShowDatePicker(true)}
        >
          <Text>{dayjs(startDate).format('MMMM D, YYYY')}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setStartDate(selectedDate);
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
});
