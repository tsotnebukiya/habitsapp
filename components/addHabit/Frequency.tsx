import { ACTIVE_OPACITY } from '@/components/shared/config';
import { colors, fontWeights } from '@/lib/constants/ui';
import { HabitFrequency } from '@/lib/habit-store/types';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { HabitFormData } from '@/lib/stores/add_habit_store';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../shared/Button';
import { sharedStyles } from './styles';

type FrequencyFormData = Pick<HabitFormData, 'frequencyType' | 'daysOfWeek'>;

export default function FrequencyChoosing({
  formData,
  setFormField,
}: {
  formData: FrequencyFormData;
  setFormField: <K extends keyof HabitFormData>(
    field: K,
    value: HabitFormData[K]
  ) => void;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [tempFrequencyType, setTempFrequencyType] = useState<HabitFrequency>(
    formData.frequencyType
  );
  const [tempDaysOfWeek, setTempDaysOfWeek] = useState<number[]>(
    formData.daysOfWeek
  );

  const toggleDayOfWeek = (dayIndex: number) => {
    const currentDays = [...tempDaysOfWeek];

    if (currentDays.includes(dayIndex)) {
      if (currentDays.length === 1) return;
      setTempDaysOfWeek(currentDays.filter((day) => day !== dayIndex));
    } else {
      setTempDaysOfWeek([...currentDays, dayIndex].sort());
    }
  };

  const handleSubmit = () => {
    setFormField(
      'frequencyType',
      tempFrequencyType as HabitFormData['frequencyType']
    );
    setFormField('daysOfWeek', tempDaysOfWeek as HabitFormData['daysOfWeek']);
    router.back();
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>{t('habits.selectFrequency')}</Text>
      </View>
      <View style={styles.frequencyContainer}>
        <View style={styles.frequencyOptionsContainer}>
          <View style={styles.frequencyOptions}>
            {['daily', 'weekly'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.frequencyOption,
                  tempFrequencyType === type && styles.selectedFrequency,
                ]}
                activeOpacity={ACTIVE_OPACITY}
                onPress={() => setTempFrequencyType(type as HabitFrequency)}
              >
                <Text
                  style={[
                    styles.frequencyText,
                    tempFrequencyType === type && styles.selectedFrequencyText,
                  ]}
                >
                  {type === 'daily'
                    ? t('frequency.daily')
                    : t('frequency.weekly')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {tempFrequencyType === 'weekly' && (
          <View style={styles.card}>
            <Text style={styles.label}>{t('habits.daysOfWeek')}</Text>
            <View style={styles.daysContainer}>
              {[
                'monday',
                'tuesday',
                'wednesday',
                'thursday',
                'friday',
                'saturday',
                'sunday',
              ].map((day, index) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    tempDaysOfWeek.includes(index) && styles.selectedDay,
                  ]}
                  activeOpacity={ACTIVE_OPACITY}
                  onPress={() => toggleDayOfWeek(index)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      tempDaysOfWeek.includes(index) && styles.selectedDayText,
                    ]}
                  >
                    {t(`weekdays.short.${day}` as any)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <Button
          onPress={handleSubmit}
          label={t('common.done')}
          type="primary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: sharedStyles.container,
  header: sharedStyles.header,
  heading: sharedStyles.heading,
  footer: sharedStyles.footer,
  frequencyContainer: {
    paddingTop: 24,
  },
  frequencyOptionsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    ...colors.dropShadow,
    marginBottom: 24,
    padding: 8,
  },
  frequencyOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  frequencyOption: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedFrequency: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  frequencyText: {
    color: colors.text,
    fontSize: 15,
    fontFamily: fontWeights.regular,
  },
  selectedFrequencyText: {
    color: 'white',
    fontFamily: fontWeights.semibold,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    ...colors.dropShadow,
    padding: 16,
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontFamily: fontWeights.medium,
    color: colors.text,
    marginBottom: 12,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  dayText: {
    fontSize: 14,
    fontFamily: fontWeights.regular,
    color: colors.text,
  },
  selectedDay: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectedDayText: {
    color: 'white',
    fontFamily: fontWeights.semibold,
  },
});
