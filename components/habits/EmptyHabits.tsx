import { ACTIVE_OPACITY } from '@/components/shared/config';
import { colors, fontWeights } from '@/lib/constants/ui';
import { dateUtils } from '@/lib/utils/dayjs';
import dayjs from 'dayjs';
import { router } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-paper';

function EmptyHabits({ selectedDate }: { selectedDate: Date }) {
  const today = dateUtils.today();
  const selected = dayjs(selectedDate);
  let title = 'No habits for today yet.';
  let subtitle = 'Add one now to start tracking.';
  let showAddButton = true;
  console.log('today (UTC):', today.toISOString());
  console.log('today (local):', today.format('YYYY-MM-DD HH:mm:ss'));
  console.log('selected (UTC):', selected.toISOString());
  console.log('selected (local):', selected.format('YYYY-MM-DD HH:mm:ss'));
  console.log(selected);
  console.log(today);
  if (selected.isBefore(today)) {
    title = `No habits were scheduled on ${selected.format('MMM D')}.`;
    subtitle = '';
    showAddButton = false; // hide CTA for past dates
  } else if (selected.isAfter(today)) {
    title = `No habits planned for ${selected.format('MMM D')} yet.`;
    subtitle = 'Plan ahead by adding habits.';
    showAddButton = true;
  }
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
          onPress={() => router.push('/add-habit')}
        >
          <Icon
            source={require('@/assets/icons/plus.png')}
            size={24}
            color="white"
          />
          <Text style={styles.addHabitButtonText}>Add habit</Text>
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
