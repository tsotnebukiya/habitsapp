import { DetailChoosingType } from '@/app/(app)/update-habit/detail-choosing';
import Button from '@/components/shared/Button';
import { ACTIVE_OPACITY } from '@/components/shared/config';
import ItemIcon from '@/components/shared/Icon';
import { colors, fontWeights } from '@/lib/constants/ui';
import useHabitsStore from '@/lib/habit-store/store';
import { useHabit } from '@/lib/hooks/useHabits';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useAppStore } from '@/lib/stores/app_state';
import { useUpdateHabitStore } from '@/lib/stores/update_habit_store';
import { dateUtils } from '@/lib/utils/dayjs';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UpdateHabit() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();
  const { habitId } = useLocalSearchParams<{ habitId: string }>();
  const habit = useHabit(habitId);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const notificationsEnabled = useAppStore(
    (state) => state.notificationsEnabled
  );
  const updateHabit = useHabitsStore((state) => state.updateHabit);
  const formData = useUpdateHabitStore((state) => state.formData);
  const setFormField = useUpdateHabitStore((state) => state.setFormField);
  const initializeForm = useUpdateHabitStore((state) => state.initializeForm);
  const resetForm = useUpdateHabitStore((state) => state.resetForm);

  const chooseDetail = (type: DetailChoosingType) => {
    router.push({
      pathname: '/update-habit/detail-choosing',
      params: { type },
    });
  };
  const openReminderPicker = () => {
    setShowReminderPicker(true);
  };

  const handleConfirmReminder = (date: Date) => {
    setFormField('reminderTime', date);
    setShowReminderPicker(false);
  };

  const handleCancelReminder = () => {
    setShowReminderPicker(false);
  };
  const handleNotificationsEnable = () => {
    if (!notificationsEnabled) {
      router.push('/settings/notifications');
    }
  };
  const toggleReminder = () => {
    if (formData.hasReminder) {
      setFormField('reminderTime', null);
      setFormField('hasReminder', false);
    } else {
      setFormField('hasReminder', true);
      setFormField('reminderTime', new Date());
    }
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
      reminder_time:
        formData.hasReminder && formData.reminderTime
          ? dateUtils.toHHMMString(formData.reminderTime)
          : null,
    });
    router.back();
  };

  useEffect(() => {
    if (habit) {
      initializeForm(habit);
    }
    return () => {
      resetForm();
    };
  }, [habit, initializeForm, resetForm]);

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
                  <Text style={styles.habitFieldText}>
                    {t('habits.habitName')}
                  </Text>
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
            <View
              style={[styles.subContainer, styles.subContainerMarginBottom]}
            >
              <TouchableOpacity
                activeOpacity={ACTIVE_OPACITY}
                style={styles.item}
                onPress={() => chooseDetail('color')}
              >
                <SymbolView
                  name="paintpalette.fill"
                  size={24}
                  tintColor={colors.habitColors.grapePurple}
                />
                <Text style={styles.itemText}>{t('habits.color')}</Text>
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
                <SymbolView
                  name="photo.fill"
                  size={24}
                  tintColor={colors.habitColors.salmonRed}
                />
                <Text style={styles.itemText}>{t('habits.icon')}</Text>
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
                <SymbolView
                  name="list.bullet.rectangle.portrait.fill"
                  size={24}
                  tintColor={colors.habitColors.amberYellow}
                />
                <Text style={styles.itemText}>{t('habits.description')}</Text>
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
                    <Text style={styles.descriptionTextNone}>
                      {t('common.none')}
                    </Text>
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
                <SymbolView
                  name="tag.fill"
                  size={24}
                  tintColor={colors.habitColors.indigoBlue}
                />
                <Text style={styles.itemText}>{t('habits.category')}</Text>
                <View style={styles.containerRight}>
                  <Text style={styles.descriptionText}>
                    {t(`categories.${formData.category}`)}
                  </Text>
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
                onPress={handleNotificationsEnable}
                disabled={!!notificationsEnabled}
              >
                <SymbolView
                  name="bell.fill"
                  size={24}
                  tintColor={colors.habitColors.salmonRed}
                />
                <Text style={styles.itemText}>{t('habits.notifications')}</Text>
                {notificationsEnabled && (
                  <Switch
                    trackColor={{ true: '#31C859' }}
                    thumbColor={'white'}
                    ios_backgroundColor="#7c7c7c"
                    onValueChange={toggleReminder}
                    value={formData.hasReminder}
                  />
                )}
                {notificationsEnabled && (
                  <View style={styles.containerRight}>
                    <TouchableOpacity
                      style={[
                        styles.dateButton,
                        !formData.hasReminder && styles.dateButtonDisabled,
                      ]}
                      disabled={!formData.hasReminder}
                      onPress={openReminderPicker}
                    >
                      <Text>
                        {formData.reminderTime?.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        }) || 'hh:mm'}
                      </Text>
                    </TouchableOpacity>
                    <DateTimePickerModal
                      isVisible={showReminderPicker}
                      mode="time"
                      date={formData.reminderTime || new Date()}
                      onConfirm={handleConfirmReminder}
                      onCancel={handleCancelReminder}
                    />
                  </View>
                )}
                {!notificationsEnabled && (
                  <View style={styles.containerRight}>
                    <Text style={[styles.descriptionText, styles.errorColor]}>
                      {t('habits.enableNotificationsToUseReminders')}
                    </Text>
                    <Icon
                      source={require('@/assets/icons/chevron-right.png')}
                      size={18}
                      color={colors.text}
                    />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
          <Button
            onPress={handleSubmit}
            label={t('common.save')}
            type="primary"
          />
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
  dateButton: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.border,
    // minWidth: 86,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateButtonDisabled: {
    opacity: 0.38, // MD guidance for disabled text
  },
  errorColor: {
    color: colors.habitColors.salmonRed,
  },
});
