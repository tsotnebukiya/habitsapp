import CategoryChoosing from '@/components/addHabit/Category';
import ColorChoosing from '@/components/addHabit/Color';
import FrequencyChoosing from '@/components/addHabit/Frequency';
import GoalChoosing from '@/components/addHabit/Goal';
import IconChoosing from '@/components/addHabit/Icon';
import TextChoosing from '@/components/addHabit/Text';
import TypeChoosing from '@/components/addHabit/Type';
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

  const renderContent = () => {
    if (type === 'color') {
      return <ColorChoosing />;
    } else if (type === 'icon') {
      return <IconChoosing />;
    } else if (type === 'name') {
      return <TextChoosing type="name" />;
    } else if (type === 'description') {
      return <TextChoosing type="description" />;
    } else if (type === 'category') {
      return <CategoryChoosing />;
    } else if (type === 'type') {
      return <TypeChoosing />;
    } else if (type === 'goal') {
      return <GoalChoosing />;
    } else if (type === 'repeat') {
      return <FrequencyChoosing />;
    }
  };
  return <>{renderContent()}</>;
}
