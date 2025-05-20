import CategoryChoosing from '@/components/addHabit/Category';
import ColorChoosing from '@/components/addHabit/Color';
import IconChoosing from '@/components/addHabit/Icon';
import TextChoosing from '@/components/addHabit/Text';
import { useUpdateHabitStore } from '@/lib/stores/update_habit_store';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export type DetailChoosingType =
  | 'color'
  | 'icon'
  | 'name'
  | 'description'
  | 'category';

export default function DetailChoosing() {
  const { type } = useLocalSearchParams<{ type: DetailChoosingType }>();
  const formData = useUpdateHabitStore((state) => state.formData);
  const setFormField = useUpdateHabitStore((state) => state.setFormField);

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
    }
  };
  return <>{renderContent()}</>;
}
