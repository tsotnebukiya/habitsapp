import { CATEGORIES } from '@/lib/constants/HabitTemplates';
import { dateUtils } from '@/lib/utils/dayjs';
import { Database } from '@/supabase/types';
import { create } from 'zustand';

type Habit = Database['public']['Tables']['habits']['Row'];
type CategoryId = (typeof CATEGORIES)[number]['id'];

interface UpdateHabitFormData {
  name: string;
  description: string;
  color: string;
  icon: string;
  category: CategoryId;
  hasReminder: boolean;
  reminderTime: Date | null;
}

interface UpdateHabitStore {
  formData: UpdateHabitFormData;
  setFormField: <K extends keyof UpdateHabitFormData>(
    field: K,
    value: UpdateHabitFormData[K]
  ) => void;
  initializeForm: (habit: Habit) => void;
  resetForm: () => void;
}

const initialFormData: UpdateHabitFormData = {
  name: '',
  description: '',
  color: '#5BADFF',
  icon: 'dumbbell',
  category: 'cat1',
  hasReminder: false,
  reminderTime: null,
};

export const useUpdateHabitStore = create<UpdateHabitStore>((set) => ({
  formData: initialFormData,
  setFormField: (field, value) =>
    set((state) => ({
      formData: {
        ...state.formData,
        [field]: value,
      },
    })),
  initializeForm: (habit) =>
    set({
      formData: {
        name: habit.name,
        description: habit.description || '',
        color: habit.color || '#5BADFF',
        icon: habit.icon || 'dumbbell',
        category: (habit.category_name as CategoryId) || 'cat1',
        hasReminder: habit.reminder_time !== null,
        reminderTime:
          habit.reminder_time !== null
            ? dateUtils.fromHHMMString(habit.reminder_time)
            : null,
      },
    }),
  resetForm: () => set({ formData: initialFormData }),
}));
