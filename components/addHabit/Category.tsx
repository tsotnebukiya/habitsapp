import { ACTIVE_OPACITY } from '@/components/shared/config';
import { CATEGORIES } from '@/lib/constants/HabitTemplates';
import { colors, fontWeights } from '@/lib/constants/ui';
import { useAddHabitStore } from '@/lib/stores/add_habit_store';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon, RadioButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../shared/Button';
import { sharedStyles } from './styles';

export default function CategoryChoosing() {
  const insets = useSafeAreaInsets();
  const setFormField = useAddHabitStore((state) => state.setFormField);
  const selectedCategory = useAddHabitStore((state) => state.formData.category);
  const [tempCategory, setTempCategory] = useState<string>(selectedCategory);

  const handleCategorySelect = (categoryId: string) => {
    setTempCategory(categoryId);
  };

  const handleSubmit = () => {
    setFormField('category', tempCategory as any);
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Select category</Text>
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.categoriesContainer}>
          {CATEGORIES.map((category, i) => (
            <TouchableOpacity
              key={i}
              style={styles.categoryCard}
              activeOpacity={ACTIVE_OPACITY}
              onPress={() => handleCategorySelect(category.id)}
            >
              <View style={styles.categoryIconContainer}>
                <View
                  style={[
                    styles.categoryIconBackground,
                    { backgroundColor: category.color },
                  ]}
                />
                <Icon source={category.icon} size={24} color={category.color} />
              </View>
              <View style={styles.categoryTextContainer}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryDescription}>
                  {category.description}
                </Text>
              </View>
              <RadioButton
                value={category.id}
                status={category.id === tempCategory ? 'checked' : 'unchecked'}
                color={colors.primary}
                onPress={() => handleCategorySelect(category.id)}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <Button onPress={handleSubmit} label="Done" type="primary" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: sharedStyles.container,
  header: sharedStyles.header,
  heading: sharedStyles.heading,
  footer: sharedStyles.footer,
  contentContainer: {
    paddingTop: 24,
  },
  categoriesContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 7,
  },
  categoryCard: {
    padding: 18,
    gap: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingLeft: 20,
    paddingRight: 24,
    width: '100%',
    height: 79,
    backgroundColor: 'white',
    ...colors.dropShadow,
  },
  categoryIconContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  categoryIconBackground: {
    width: 44,
    height: 44,
    opacity: 0.1,
    borderRadius: 12,
    position: 'absolute',
  },
  categoryTextContainer: {
    flex: 1,
    gap: 3,
  },
  categoryName: {
    fontSize: 15,
    fontFamily: fontWeights.semibold,
    color: colors.text,
  },
  categoryDescription: {
    fontSize: 11,
    color: colors.text,
    fontFamily: fontWeights.regular,
  },
});
