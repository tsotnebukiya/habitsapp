import CategoryChoosing from '@/components/addHabit/Category';
import ColorChoosing from '@/components/addHabit/Color';
import FrequencyChoosing from '@/components/addHabit/Frequency';
import GoalChoosing from '@/components/addHabit/Goal';
import IconChoosing from '@/components/addHabit/Icon';
import TextChoosing from '@/components/addHabit/Text';
import TypeChoosing from '@/components/addHabit/Type';
import { useAddHabitStore } from '@/lib/stores/add_habit_store';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export type DetailChoosingType =
  | 'color'
  | 'icon'
  | 'name'
  | 'description'
  | 'category'
  | 'type'
  | 'goal'
  | 'repeat';

export default function DetailChoosing() {
  const { type } = useLocalSearchParams<{ type: DetailChoosingType }>();
  const formData = useAddHabitStore((state) => state.formData);
  const setFormField = useAddHabitStore((state) => state.setFormField);

  const renderContent = () => {
    if (type === 'color') {
      return <ColorChoosing formData={formData} setFormField={setFormField} />;
    } else if (type === 'icon') {
      return <IconChoosing formData={formData} setFormField={setFormField} />;
    } else if (type === 'name') {
      return (
        <TextChoosing
          type="name"
          formData={formData}
          setFormField={setFormField}
        />
      );
    } else if (type === 'description') {
      return (
        <TextChoosing
          type="description"
          formData={formData}
          setFormField={setFormField}
        />
      );
    } else if (type === 'category') {
      return (
        <CategoryChoosing formData={formData} setFormField={setFormField} />
      );
    } else if (type === 'type') {
      return <TypeChoosing formData={formData} setFormField={setFormField} />;
    } else if (type === 'goal') {
      return <GoalChoosing formData={formData} setFormField={setFormField} />;
    } else if (type === 'repeat') {
      return (
        <FrequencyChoosing formData={formData} setFormField={setFormField} />
      );
    }
  };
  return <>{renderContent()}</>;
}
