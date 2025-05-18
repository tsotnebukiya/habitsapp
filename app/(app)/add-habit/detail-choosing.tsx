import CategoryChoosing from '@/components/addHabit/Category';
import ColorChoosing from '@/components/addHabit/Color';
import FrequencyChoosing from '@/components/addHabit/Frequency';
import GoalChoosing from '@/components/addHabit/Goal';
import IconChoosing from '@/components/addHabit/Icon';
import TextChoosing from '@/components/addHabit/Text';
import TypeChoosing from '@/components/addHabit/Type';
import { colors, fontWeights } from '@/lib/constants/ui';
import { useAddHabitStore } from '@/lib/stores/add_habit_store';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: DetailChoosingType }>();
  const { formData, setFormField } = useAddHabitStore();
  const handleBack = () => {
    router.back();
  };

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>
          {type === 'color' && 'Color'}
          {type === 'icon' && 'Select icon'}
          {type === 'name' && 'Habit name'}
          {type === 'description' && 'Description'}
          {type === 'category' && 'Category'}
          {type === 'type' && 'Type'}
          {type === 'goal' && 'Goal'}
          {type === 'repeat' && 'Repeat frequency'}
        </Text>
      </View>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingTop: 24,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSpacing: {
    width: 34,
  },
  closeButton: {
    backgroundColor: 'white',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
  },
  heading: {
    fontFamily: fontWeights.interBold,
    fontSize: 20,
    textAlign: 'center',
    color: colors.text,
  },
  backButton: {
    backgroundColor: 'white',
    borderRadius: 100,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
