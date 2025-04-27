import { NativeModules } from 'react-native';
import { dateUtils } from '@/lib/utils/dayjs';
import { SharedSlice } from './types';
import dayjs from 'dayjs';

const { WidgetStorage } = NativeModules;

// ---> ADDED: Check if the native module exists
if (WidgetStorage) {
  console.log('WidgetStorage native module found.');
} else {
  console.error(
    'WidgetStorage native module is NOT available. Check linking/compilation.'
  );
}
// <--- END ADDED

const WIDGET_GROUP = 'group.com.vdl.habitapp.widget';
const WIDGET_DATA_KEY = 'habits'; // Use 'habits' as the key to match widget code

interface WidgetStorageInterface {
  setItem(key: string, value: string): Promise<boolean>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<boolean>;
}

// Transform store data into widget format
const transformStoreDataForWidget = (state: SharedSlice) => {
  const now = dateUtils.nowUTC();
  const startOfWeek = dayjs(now).startOf('week');

  // Get all habits
  const habits = Array.from(state.habits.values());
  const completions = Array.from(state.completions.values())
    // Only include completions from current week
    .filter((c) =>
      dateUtils.fromServerDate(c.completion_date).isAfter(startOfWeek)
    );

  // Transform into widget format (matching Swift Habit struct)
  const widgetData = habits.map((habit) => ({
    id: habit.id,
    name: habit.name,
    icon: habit.icon,
    completions: completions
      .filter((c) => c.habit_id === habit.id)
      .map((c) => dateUtils.fromServerDate(c.completion_date).toISOString()), // Store ISO strings
  }));

  return widgetData;
};

export const widgetStorage: WidgetStorageInterface = {
  async setItem(key: string, value: string) {
    // ---> ADDED: Check before calling
    if (!WidgetStorage) {
      console.error(
        'Cannot setItem: WidgetStorage native module is not available.'
      );
      return false;
    }
    // <--- END ADDED
    try {
      return await WidgetStorage.setItem(key, value);
    } catch (error) {
      console.error('Failed to set widget data:', error);
      return false;
    }
  },

  async getItem(key: string) {
    // ---> ADDED: Check before calling
    if (!WidgetStorage) {
      console.error(
        'Cannot getItem: WidgetStorage native module is not available.'
      );
      return null;
    }
    // <--- END ADDED
    try {
      return await WidgetStorage.getItem(key);
    } catch (error) {
      console.error('Failed to get widget data:', error);
      return null;
    }
  },

  async removeItem(key: string) {
    // ---> ADDED: Check before calling
    if (!WidgetStorage) {
      console.error(
        'Cannot removeItem: WidgetStorage native module is not available.'
      );
      return false;
    }
    // <--- END ADDED
    try {
      return await WidgetStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove widget data:', error);
      return false;
    }
  },
};

// Main function to sync store data to widget
export const syncStoreToWidget = (state: SharedSlice) => {
  try {
    const widgetData = transformStoreDataForWidget(state);
    // Fire and forget - don't await the promise
    widgetStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(widgetData));
    console.log('Attempted to sync data to widget.'); // Added log
    return true;
  } catch (error) {
    console.error('Failed to sync store to widget:', error);
    return false;
  }
};
