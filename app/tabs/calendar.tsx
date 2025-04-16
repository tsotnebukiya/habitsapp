import React from 'react';
import { View } from 'react-native';
import CalendarViewNew from '@/components/calendar/CalendarViewNew';

export default function CalendarScreen() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <CalendarViewNew />
    </View>
  );
}
