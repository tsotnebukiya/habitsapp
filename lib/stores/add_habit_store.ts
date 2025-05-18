import dayjs from '@/lib/utils/dayjs';
import { create } from 'zustand';
import { HabitCategory, HabitTemplate } from '../constants/32';
import {
  MeasurementUnit,
  MeasurementUnits,
} from '../constants/measurementUnits';
import { colors } from '../constants/ui';

interface HabitFormData {
  name: string;
  description: string;
  color: string;
  icon: string;
  category: HabitCategory;
  frequencyType: 'daily' | 'weekly';
  startDate: Date;
  showDatePicker: boolean;
  type: 'GOOD' | 'BAD';
  daysOfWeek: number[];
  hasEndDate: boolean;
  endDate: Date | null;
  hasReminder: boolean;
  reminderTime: Date | null;
  streakGoal: number | null;
  goal: {
    value: number;
    unit: MeasurementUnit;
  };
}

export type AddHabitStep = 'category' | 'templates' | 'main';

interface AddHabitState {
  formData: HabitFormData;
  selectedTemplate: HabitTemplate | null;

  setFormField: <K extends keyof HabitFormData>(
    field: K,
    value: HabitFormData[K]
  ) => void;

  applyTemplate: (template: HabitTemplate) => void;

  resetForm: () => void;
}

const initialFormData: HabitFormData = {
  name: '',
  description: '',
  color: colors.habitColors.cyanBlue,
  icon: 'lightbulb',
  category: 'cat1',
  frequencyType: 'daily',
  startDate: dayjs().toDate(),
  showDatePicker: false,
  type: 'GOOD',
  daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Default to all days selected
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
  selectedTemplate: null,
  setFormField: (field, value) => {
    set((state) => ({
      formData: {
        ...state.formData,
        [field]: value,
      },
    }));
  },

  applyTemplate: (template) => {
    let goalValue = 1;
    let goalUnit: MeasurementUnit = MeasurementUnits.count;

    if (template.defaultGoalUnit) {
      goalUnit = MeasurementUnits[template.defaultGoalUnit];
      goalValue = template.defaultGoalValue || 1;
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
        type: template.type,
      },
      selectedTemplate: template,
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
      selectedTemplate: null,
    });
  },
}));
