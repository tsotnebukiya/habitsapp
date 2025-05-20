import { DetailChoosingType } from '@/app/(app)/update-habit/detail-choosing';
import Button from '@/components/shared/Button';
import { ACTIVE_OPACITY } from '@/components/shared/config';
import ItemIcon from '@/components/shared/Icon';
import { CATEGORIES_MAP } from '@/lib/constants/HabitTemplates';
import { colors, fontWeights } from '@/lib/constants/ui';
import useHabitsStore from '@/lib/habit-store/store';
import { useHabit } from '@/lib/hooks/useHabits';
import { useUpdateHabitStore } from '@/lib/stores/update_habit_store';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UpdateHabit() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { habitId } = useLocalSearchParams<{ habitId: string }>();
  const habit = useHabit(habitId);
  const updateHabit = useHabitsStore((state) => state.updateHabit);
  const formData = useUpdateHabitStore((state) => state.formData);
  const initializeForm = useUpdateHabitStore((state) => state.initializeForm);
  const resetForm = useUpdateHabitStore((state) => state.resetForm);

  useEffect(() => {
    if (habit) {
      initializeForm(habit);
    }
    return () => {
      resetForm();
    };
  }, [habit, initializeForm, resetForm]);

  const chooseDetail = (type: DetailChoosingType) => {
    router.push({
      pathname: '/update-habit/detail-choosing',
      params: { type },
    });
  };

  const handleSubmit = () => {
    if (!habit) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateHabit(habit.id, {
      name: formData.name,
      description: formData.description,
      color: formData.color,
      icon: formData.icon,
      category_name: formData.category,
    });
    router.back();
  };

  if (!habit) return null;

  return (
    <>
      <View style={styles.flex}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollView,
            { paddingBottom: insets.bottom + 80 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.container, { paddingBottom: insets.bottom }]}>
            <TouchableOpacity
              activeOpacity={ACTIVE_OPACITY}
              style={[styles.header, { backgroundColor: formData.color }]}
              onPress={() => chooseDetail('name')}
            >
              <ItemIcon icon={formData.icon} color={'white'} />
              <View style={styles.headerContent}>
                {formData.name && (
                  <Text style={styles.habitFieldText}>Habit name</Text>
                )}

                <Text style={styles.headerTitle}>
                  {formData.name || 'Habit name'}
                </Text>
              </View>
              <View style={styles.nameButton}>
                <Icon
                  source={require('@/assets/icons/edit-02.png')}
                  color="white"
                  size={18}
                />
              </View>
            </TouchableOpacity>
            <Text style={styles.subTitle}>Appearance</Text>
            <View
              style={[styles.subContainer, styles.subContainerMarginBottom]}
            >
              <TouchableOpacity
                activeOpacity={ACTIVE_OPACITY}
                style={styles.item}
                onPress={() => chooseDetail('color')}
              >
                <MaterialIcons
                  name="color-lens"
                  size={24}
                  color={colors.habitColors.grapePurple}
                />
                <Text style={styles.itemText}>Color</Text>
                <View style={styles.containerRight}>
                  <View
                    style={[
                      styles.colorCircle,
                      { backgroundColor: formData.color },
                    ]}
                  />
                  <Icon
                    source={require('@/assets/icons/chevron-right.png')}
                    size={18}
                    color={colors.text}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={ACTIVE_OPACITY}
                style={styles.item}
                onPress={() => chooseDetail('icon')}
              >
                <MaterialIcons
                  name="image"
                  size={24}
                  color={colors.habitColors.salmonRed}
                />
                <Text style={styles.itemText}>Icon</Text>
                <View style={styles.containerRight}>
                  <ItemIcon icon={formData.icon} color={formData.color} />
                  <Icon
                    source={require('@/assets/icons/chevron-right.png')}
                    size={18}
                    color={colors.text}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={ACTIVE_OPACITY}
                onPress={() => chooseDetail('description')}
                style={styles.item}
              >
                <MaterialIcons
                  name="description"
                  size={24}
                  color={colors.habitColors.amberYellow}
                />
                <Text style={styles.itemText}>Description</Text>
                <View style={styles.containerRight}>
                  {formData.description ? (
                    <Text
                      ellipsizeMode="tail"
                      style={styles.descriptionText}
                      numberOfLines={1}
                    >
                      {formData.description}
                    </Text>
                  ) : (
                    <Text style={styles.descriptionTextNone}>None</Text>
                  )}

                  <Icon
                    source={require('@/assets/icons/chevron-right.png')}
                    size={18}
                    color={colors.text}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={ACTIVE_OPACITY}
                onPress={() => chooseDetail('category')}
                style={styles.item}
              >
                <MaterialIcons
                  name="label"
                  size={24}
                  color={colors.habitColors.indigoBlue}
                />
                <Text style={styles.itemText}>Category</Text>
                <View style={styles.containerRight}>
                  <Text style={styles.descriptionText}>
                    {CATEGORIES_MAP[formData.category].name}
                  </Text>
                  <Icon
                    source={require('@/assets/icons/chevron-right.png')}
                    size={18}
                    color={colors.text}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
          <Button onPress={handleSubmit} label="Save" type="primary" />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    paddingTop: 24,
    paddingHorizontal: 18,
  },
  container: {
    flex: 1,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingTop: 21,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 16,
  },
  header: {
    height: 72,
    borderRadius: 16,
    paddingLeft: 20,
    paddingRight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },
  headerContent: {
    gap: 2,
  },
  habitFieldText: {
    color: 'white',
    fontSize: 12,
    fontFamily: fontWeights.interRegular,
    opacity: 0.8,
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: fontWeights.interBold,
    color: 'white',
  },
  nameButton: { marginLeft: 'auto' },
  subTitle: {
    fontSize: 12,
    marginBottom: 16,
    fontFamily: fontWeights.regular,
    color: 'black',
  },
  subContainer: {
    backgroundColor: colors.border,
    gap: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  subContainerMarginBottom: {
    marginBottom: 34,
  },
  item: {
    backgroundColor: 'white',
    height: 50,
    paddingHorizontal: 16.5,
    gap: 8.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  containerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    flex: 1,
  },
  itemText: {
    fontSize: 12,
    fontFamily: fontWeights.medium,
    color: colors.text,
    minWidth: 80,
  },
  colorCircle: {
    width: 17,
    height: 17,
    borderRadius: 100,
  },
  descriptionTextNone: {
    opacity: 0.5,
    fontFamily: fontWeights.medium,
    fontSize: 12,
    // flex: 1,
  },
  descriptionText: {
    fontFamily: fontWeights.semibold,
    fontSize: 12,
    flex: 1,
    textAlign: 'right',
  },
});
