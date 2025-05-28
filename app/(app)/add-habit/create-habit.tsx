import { DetailChoosingType } from '@/app/(app)/add-habit/detail-choosing';
import Button from '@/components/shared/Button';
import { ACTIVE_OPACITY } from '@/components/shared/config';
import ItemIcon from '@/components/shared/Icon';
import { colors, fontWeights } from '@/lib/constants/ui';
import useHabitsStore from '@/lib/habit-store/store';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useAddHabitStore } from '@/lib/stores/add_habit_store';
import { useAppStore } from '@/lib/stores/app_state';
import useUserProfileStore from '@/lib/stores/user_profile';
import dayjs, { dateUtils } from '@/lib/utils/dayjs';
import { translateMeasurementUnit } from '@/lib/utils/translationHelpers';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
import Toast from 'react-native-toast-message';

export default function CreateHabbit() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const profile = useUserProfileStore((state) => state.profile);
  const notificationsEnabled = useAppStore(
    (state) => state.notificationsEnabled
  );
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const addHabit = useHabitsStore((state) => state.addHabit);
  const formData = useAddHabitStore((state) => state.formData);
  const [enableEndDate, setEnableEndDate] = useState(formData.hasEndDate);
  const setFormField = useAddHabitStore((state) => state.setFormField);
  const resetForm = useAddHabitStore((state) => state.resetForm);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const goal = translateMeasurementUnit(
    t,
    formData.goal.unit.id,
    formData.goal.unit
  );
  const goalText = formData.goal.value === 1 ? goal.oneName : goal.name;

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

  const openStartPicker = () => {
    setShowStartPicker(true);
  };

  const openEndPicker = () => {
    setShowEndPicker(true);
  };

  const handleConfirmStart = (date: Date) => {
    setFormField('startDate', date);
    setShowStartPicker(false);
  };

  const handleConfirmEnd = (date: Date) => {
    setFormField('endDate', date);
    setShowEndPicker(false);
  };

  const handleCancelStart = () => {
    setShowStartPicker(false);
  };

  const handleCancelEnd = () => {
    setShowEndPicker(false);
  };

  const toggleSwitch = () => {
    if (enableEndDate) {
      setFormField('endDate', null);
      setFormField('hasEndDate', false);
      setEnableEndDate(false);
    } else {
      // +3months
      const endDate = new Date(formData.startDate);
      endDate.setMonth(endDate.getMonth() + 3);
      setFormField('endDate', endDate);
      setFormField('hasEndDate', true);
      setEnableEndDate(true);
    }
  };

  const chooseDetail = (type: DetailChoosingType) => {
    router.push({ pathname: '/add-habit/detail-choosing', params: { type } });
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

  const handleNotificationsEnable = () => {
    if (!notificationsEnabled) {
      router.push('/settings/notifications');
    }
  };
  const handleSubmit = async () => {
    if (!formData.name) {
      Toast.show({
        type: 'error',
        text1: t('habits.habitNameRequired'),
      });
      return;
    }
    if (formData.goal.value === 0) {
      Toast.show({
        type: 'error',
        text1: t('habits.goalMustBeGreaterThanZero'),
      });
      return;
    }
    if (!profile?.id) return;

    try {
      const habit = {
        name: formData.name,
        description: formData.description,
        color: formData.color,
        icon: formData.icon,
        frequency_type: formData.frequencyType,
        start_date: dayjs(formData.startDate).format('YYYY-MM-DD'),
        user_id: profile.id,
        is_active: true,
        category_name: formData.category,

        // Updated or new fields
        days_of_week:
          formData.frequencyType === 'weekly' ? formData.daysOfWeek : null,
        end_date:
          formData.hasEndDate && formData.endDate
            ? dayjs(formData.endDate).format('YYYY-MM-DD')
            : null,
        gamification_attributes: null,
        reminder_time:
          formData.hasReminder && formData.reminderTime
            ? dateUtils.toHHMMString(formData.reminderTime)
            : null,
        streak_goal: formData.streakGoal,

        // Existing fields
        completions_per_day: formData.goal.value,
        goal_unit: formData.goal.unit.id,
        goal_value: formData.goal.value,
        type: formData.type,
        sort_id: 0,
      };
      addHabit(habit);

      router.replace('/');
    } catch (error) {
      // ... error handling ...
    }
  };

  useEffect(() => {
    return () => {
      resetForm();
    };
  }, []);

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
                  {formData.name || t('habits.habitName')}
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
            <Text style={styles.subTitle}>{t('habits.appearance')}</Text>
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
                <MaterialIcons
                  name="image"
                  size={24}
                  color={colors.habitColors.salmonRed}
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
                <MaterialIcons
                  name="description"
                  size={24}
                  color={colors.habitColors.amberYellow}
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
                <MaterialIcons
                  name="label"
                  size={24}
                  color={colors.habitColors.indigoBlue}
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
            </View>
            <Text style={styles.subTitle}>{t('habits.general')}</Text>
            <View style={styles.subContainer}>
              <TouchableOpacity
                activeOpacity={ACTIVE_OPACITY}
                onPress={() => chooseDetail('type')}
                style={styles.item}
              >
                <MaterialIcons
                  name="check-circle"
                  size={24}
                  color={colors.habitColors.meadowGreen}
                />
                <Text style={styles.itemText}>{t('habits.type')}</Text>

                <View style={styles.containerRight}>
                  <Text style={styles.descriptionText}>
                    {formData.type === 'GOOD'
                      ? t('habits.good')
                      : t('habits.bad')}
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
                onPress={() => chooseDetail('goal')}
                style={styles.item}
              >
                <MaterialIcons
                  name="flag"
                  size={24}
                  color={colors.habitColors.skyBlue}
                />
                <Text style={styles.itemText}>{t('habits.goal')}</Text>
                <View style={styles.containerRight}>
                  <Text style={styles.descriptionText}>
                    {formData.goal.value} {goalText}
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
                onPress={() => chooseDetail('repeat')}
                style={styles.item}
              >
                <MaterialIcons
                  name="sync-lock"
                  size={24}
                  color={colors.habitColors.amethystPurple}
                />
                <Text style={styles.itemText}>{t('habits.repeat')}</Text>
                <View style={styles.containerRight}>
                  <Text style={styles.descriptionText}>
                    {formData.frequencyType === 'daily'
                      ? t('habits.everyDay')
                      : formData.daysOfWeek
                          .map((day) => {
                            const weekdayKeys = [
                              'monday',
                              'tuesday',
                              'wednesday',
                              'thursday',
                              'friday',
                              'saturday',
                              'sunday',
                            ] as const;
                            return t(
                              `weekdays.short.${weekdayKeys[day]}` as any
                            );
                          })
                          .join(', ')}
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
                <MaterialIcons
                  name="notifications-active"
                  size={24}
                  color={colors.habitColors.salmonRed}
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
              <View style={styles.item}>
                <MaterialIcons
                  name="event-available"
                  size={24}
                  color={colors.habitColors.tealGreen}
                />
                <Text style={styles.itemText}>{t('habits.startsOn')}</Text>

                <View style={styles.containerRight}>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={openStartPicker}
                  >
                    <Text>{formData.startDate.toLocaleDateString()}</Text>
                  </TouchableOpacity>

                  <DateTimePickerModal
                    isVisible={showStartPicker}
                    mode="date"
                    date={formData.startDate}
                    onConfirm={handleConfirmStart}
                    onCancel={handleCancelStart}
                  />
                </View>
              </View>
              <View style={styles.item}>
                <MaterialIcons
                  name="calendar-month"
                  size={24}
                  color={colors.habitColors.brown}
                />
                <Text style={styles.itemText}>{t('habits.endsOn')}</Text>
                <Switch
                  trackColor={{ true: '#31C859' }}
                  thumbColor={'white'}
                  ios_backgroundColor="#7c7c7c"
                  onValueChange={toggleSwitch}
                  value={enableEndDate}
                />
                <View style={styles.containerRight}>
                  <TouchableOpacity
                    style={[
                      styles.dateButton,
                      !enableEndDate && styles.dateButtonDisabled,
                    ]}
                    onPress={openEndPicker}
                    disabled={!enableEndDate}
                  >
                    <Text>
                      {formData.endDate?.toLocaleDateString() || 'dd.mm.yyyy'}
                    </Text>
                  </TouchableOpacity>
                  {formData.endDate && (
                    <DateTimePickerModal
                      isVisible={showEndPicker}
                      mode="date"
                      date={formData.endDate}
                      onConfirm={handleConfirmEnd}
                      onCancel={handleCancelEnd}
                    />
                  )}
                </View>
              </View>
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
  errorColor: {
    color: colors.habitColors.salmonRed,
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
  hiddenPointer: {
    // makes the button ignore taps
    pointerEvents: 'none',
  },
});
