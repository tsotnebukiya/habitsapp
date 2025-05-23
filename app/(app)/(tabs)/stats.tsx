import CalendarViewNew from '@/components/stats/CalendarViewNew';
import Records from '@/components/stats/Records';
import WeeklyProgress from '@/components/stats/WeeklyProgress';
import { colors, fontWeights } from '@/lib/constants/ui';
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const StatsScreen = () => {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainerStyle,
        {
          paddingTop: insets.top + 17,
          paddingBottom: 20,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Statistics</Text>
      <CalendarViewNew />
      <Records />
      <WeeklyProgress />
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
