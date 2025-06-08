import HabitList from '@/components/habits/HabitList';
import WeekView from '@/components/habits/WeekView';
import { colors } from '@/lib/constants/ui';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 17 }]}>
      <WeekView selectedDate={selectedDate} onDateSelect={setSelectedDate} />
      <HabitList selectedDate={selectedDate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight,
  },
});
