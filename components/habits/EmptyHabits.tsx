import { ACTIVE_OPACITY } from '@/components/shared/config';
import {
  createAppPaywallHandler,
  trackPremiumFeatureAccessAttempted,
} from '@/lib/analytics/superwall';
import { colors, fontWeights } from '@/lib/constants/ui';
import { useAllHabits } from '@/lib/hooks/useHabits';
import { useSubscriptionStatus } from '@/lib/hooks/useSubscriptionStatus';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useAddHabitStore } from '@/lib/stores/add_habit_store';
import { dateUtils } from '@/lib/utils/dayjs';
import { showHabitSuperwall } from '@/lib/utils/superwall';
import dayjs from 'dayjs';
import { router } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-paper';

function EmptyHabits({ selectedDate }: { selectedDate: Date }) {
  const { t } = useTranslation();
  const habits = useAllHabits();
  const { subscriptionStatus } = useSubscriptionStatus();
  const posthog = usePostHog();
  const setEntryPoint = useAddHabitStore((state) => state.setEntryPoint);
  const today = dateUtils.today();
  const selected = dayjs(selectedDate);
  let title = t('habits.noHabitsToday');
  let subtitle = t('habits.addOneNow');
  let showAddButton = true;

  // Helper function to format date with translated month names
  const formatDateWithTranslatedMonth = (date: dayjs.Dayjs): string => {
    const monthKey = date.format('MMMM').toLowerCase();
    const translatedMonth = t(`months.${monthKey}`, {
      defaultValue: monthKey,
    });
    const day = date.format('D');
    return `${day} ${translatedMonth}`;
  };

  if (selected.isBefore(today, 'day')) {
    title = t('habits.noHabitsScheduled', {
      date: formatDateWithTranslatedMonth(selected),
    });
    subtitle = '';
    showAddButton = false; // hide CTA for past dates
  } else if (selected.isAfter(today)) {
    title = t('habits.noHabitsPlanned', {
      date: formatDateWithTranslatedMonth(selected),
    });
    subtitle = t('habits.planAhead');
  }

  const handleAddHabit = () => {
    if (habits.length >= 1) {
      const capture = (event: string, properties?: Record<string, any>) => {
        posthog.capture(event, properties);
      };
      const paywallContext = {
        placement: 'add_habit_limit',
        entrypoint: 'empty_state',
        current_habit_count: habits.length,
        subscription_status: subscriptionStatus.status,
        feature_name: 'additional_habits',
        interaction_surface: 'empty_state',
      } as const;

      trackPremiumFeatureAccessAttempted(capture, paywallContext);
      showHabitSuperwall({
        handler: createAppPaywallHandler(paywallContext, capture),
      });
    } else {
      setEntryPoint('empty_state');
      router.push('/add-habit');
    }
  };
  return (
    <View style={styles.emptyContainer}>
      <Image
        source={require('@/assets/images/emptyHabits.png')}
        width={185}
        height={185}
      />

      <View style={styles.emptyTextContainer}>
        <Text style={styles.emptyText}>{title}</Text>
        {!!subtitle && <Text style={styles.emptySubText}>{subtitle}</Text>}
      </View>

      {showAddButton && (
        <TouchableOpacity
          activeOpacity={ACTIVE_OPACITY}
          style={styles.addHabitButton}
          onPress={handleAddHabit}
        >
          <Icon
            source={require('@/assets/icons/plus.png')}
            size={24}
            color="white"
          />
          <Text style={styles.addHabitButtonText}>{t('habits.addHabit')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default EmptyHabits;

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    gap: 10,
    paddingTop: 55,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyTextContainer: {
    gap: 4,
  },
  emptySubText: {
    fontSize: 13,
    color: colors.text,
    fontFamily: fontWeights.regular,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: fontWeights.bold,
    color: colors.text,
    textAlign: 'center',
  },
  addHabitButton: {
    borderRadius: 16,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 20,
    minWidth: 160,
    backgroundColor: colors.primary,
  },
  addHabitButtonText: {
    fontSize: 13,
    fontFamily: fontWeights.bold,
    color: 'white',
  },
});
