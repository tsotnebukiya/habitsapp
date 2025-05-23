import CalendarViewNew from '@/components/stats/CalendarViewNew';
import HabitsPicker from '@/components/stats/HabitsPicker';
import { colors, fontWeights } from '@/lib/constants/ui';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const StatsScreen = () => {
  const insets = useSafeAreaInsets();
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainerStyle,
        {
          paddingTop: insets.top + 17,
          paddingBottom: insets.bottom + 20,
        },
      ]}
      showsHorizontalScrollIndicator={false}
    >
      <Text style={styles.title}>Statistics</Text>
      <HabitsPicker
        selectedHabit={selectedHabit}
        setSelectedHabit={setSelectedHabit}
      />
      <CalendarViewNew selectedHabit={selectedHabit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight, // Slightly off-white background for contrast
  },
  contentContainerStyle: {
    paddingHorizontal: 18,
  },
  title: {
    fontSize: 26,
    fontFamily: fontWeights.bold,
    color: colors.text,
    marginBottom: 17,
  },
});

export default StatsScreen;
