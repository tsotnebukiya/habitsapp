import CalendarViewNew from '@/components/calendar/CalendarViewNew';
import { colors } from '@/lib/constants/ui';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const StatsScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        { paddingTop: insets.top + 17, paddingBottom: insets.bottom + 20 },
      ]}
      showsHorizontalScrollIndicator={false}
    >
      <CalendarViewNew />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight, // Slightly off-white background for contrast
  },
});

export default StatsScreen;
