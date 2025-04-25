import { create } from 'zustand';
import {
  MeasurementUnit,
  MeasurementUnits,
} from '../constants/MeasurementUnits';
import { HabitCategory, HabitTemplate } from '../constants/HabitTemplates';
import dayjs from '@/lib/utils/dayjs';

interface HabitFormData {
  name: string;
  description: string;
  color: string;
  icon: string;
  category: HabitCategory | null;
  frequencyType: 'daily' | 'weekly';
  startDate: Date;
  showDatePicker: boolean;

  // New fields for days of week selection
  daysOfWeek: number[];

  // New fields for advanced settings
  showAdvancedSettings: boolean;

  // End date fields
  hasEndDate: boolean;
  endDate: Date | null;

  // Reminder fields
  hasReminder: boolean;
  reminderTime: string | null;

  // Streak goal
  streakGoal: number | null;

  goal: {
    value: number;
    unit: MeasurementUnit;
  };
}

export type AddHabitStep = 'category' | 'templates' | 'main';

interface AddHabitState {
  formData: HabitFormData;
  currentStep: AddHabitStep;
  isValid: boolean;
  selectedTemplate: HabitTemplate | null;

  setFormField: <K extends keyof HabitFormData>(
    field: K,
    value: HabitFormData[K]
  ) => void;

  setCurrentStep: (step: AddHabitStep) => void;

  applyTemplate: (template: HabitTemplate) => void;

  resetForm: () => void;
}

const initialFormData: HabitFormData = {
  name: '',
  description: '',
  color: '#FF6B6B', // First color from your palette
  icon: '🎯', // First icon from your list
  category: null,
  frequencyType: 'daily',
  startDate: dayjs().toDate(),
  showDatePicker: false,

  // Default values for new fields
  daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Default to all days selected

  showAdvancedSettings: false,

  hasEndDate: false,
  endDate: null,

  hasReminder: false,
  reminderTime: null,

  streakGoal: null,

  goal: {
    value: 1,
    unit: MeasurementUnits.count,
  },
};

export const useAddHabitStore = create<AddHabitState>()((set, get) => ({
  formData: { ...initialFormData },
  currentStep: 'category', // Start with category selection
  isValid: false,
  selectedTemplate: null,

  setFormField: (field, value) => {
    set((state) => ({
      formData: {
        ...state.formData,
        [field]: value,
      },
      // Basic validation - just checking if name is not empty
      isValid: field === 'name' ? !!value : !!state.formData.name,
    }));
  },

  setCurrentStep: (step) => {
    set({ currentStep: step });
  },

  applyTemplate: (template) => {
    // Set goal based on template type
    let goalValue = 1;
    let goalUnit = MeasurementUnits.count;

    if (template.goalType === 'duration' && template.defaultGoalValue) {
      goalValue = template.defaultGoalValue;
      goalUnit = MeasurementUnits.minutes;
    } else if (template.goalType === 'count' && template.defaultGoalValue) {
      goalValue = template.defaultGoalValue;
      goalUnit = MeasurementUnits.count;
    }

    set({
      formData: {
        ...get().formData,
        name: template.name,
        description: template.description,
        color: template.color || get().formData.color,
        icon: template.icon,
        category: template.category,
        frequencyType: template.frequency,
        goal: {
          value: goalValue,
          unit: goalUnit,
        },
      },
      selectedTemplate: template,
      isValid: true,
      currentStep: 'main',
    });
  },

  resetForm: () => {
    set({
      formData: {
        ...initialFormData,
        // Ensure dates are reset properly if needed, though initialFormData handles it
        startDate: dayjs().toDate(),
        endDate: null,
        reminderTime: null, // Ensure reminderTime is reset to null string
      },
      currentStep: 'category', // Reset to category step
      isValid: false,
      selectedTemplate: null,
    });
  },
}));
