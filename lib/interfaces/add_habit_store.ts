import { create } from 'zustand';
import {
  MeasurementUnit,
  MeasurementUnits,
} from '../constants/MeasurementUnits';

interface HabitFormData {
  name: string;
  description: string;
  color: string;
  icon: string;
  frequencyType: 'daily' | 'weekly';
  startDate: Date;
  showDatePicker: boolean;
  goal: {
    value: number;
    unit: MeasurementUnit;
  };
  // Future fields can be added here:
  // categoryId?: string;
  // reminderTime?: Date;
  // streakGoal?: number;
  // etc.
}

interface AddHabitState {
  // Form data
  formData: HabitFormData;

  // Form state
  currentStep: 'main' | 'goal' | string; // Can add more steps later
  isValid: boolean;

  // Actions
  setFormField: <K extends keyof HabitFormData>(
    field: K,
    value: HabitFormData[K]
  ) => void;
  setCurrentStep: (step: string) => void;
  resetForm: () => void;
}

const initialFormData: HabitFormData = {
  name: '',
  description: '',
  color: '#FF6B6B', // First color from your palette
  icon: '🎯', // First icon from your list
  frequencyType: 'daily',
  startDate: new Date(),
  showDatePicker: false,
  goal: {
    value: 1,
    unit: MeasurementUnits.count,
  },
};

export const useAddHabitStore = create<AddHabitState>()((set, get) => ({
  formData: { ...initialFormData },
  currentStep: 'main',
  isValid: false,

  setFormField: (field, value) => {
    set((state) => ({
      formData: {
        ...state.formData,
        [field]: value,
      },
      // Basic validation - just checking if name is not empty
      isValid: field === 'name' ? !!value : state.isValid,
    }));
  },

  setCurrentStep: (step) => {
    set({ currentStep: step });
  },

  resetForm: () => {
    set({
      formData: { ...initialFormData },
      currentStep: 'main',
      isValid: false,
    });
  },
}));
