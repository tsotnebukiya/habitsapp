import { NativeModules } from 'react-native';
import { dateUtils } from '@/lib/utils/dayjs';
import { SharedSlice } from './types';
import dayjs from 'dayjs';

const { WidgetStorage } = NativeModules;

const WIDGET_GROUP = 'group.com.vdl.habitapp.widget';
const WIDGET_DATA_KEY = 'widget-data';

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

  // Transform into widget format
  const widgetData = {
    habits: habits.map((habit) => ({
      id: habit.id,
      name: habit.name,
      icon: habit.icon,
      completions: completions
        .filter((c) => c.habit_id === habit.id)
        .reduce((acc, completion) => {
          acc[completion.completion_date] = true;
          return acc;
        }, {} as Record<string, boolean>),
    })),
    lastUpdated: dateUtils.nowUTC().toISOString(),
  };

  return widgetData;
};

export const widgetStorage: WidgetStorageInterface = {
  async setItem(key: string, value: string) {
    try {
      return await WidgetStorage.setItem(key, value);
    } catch (error) {
      console.error('Failed to set widget data:', error);
      return false;
    }
  },

  async getItem(key: string) {
    try {
      return await WidgetStorage.getItem(key);
    } catch (error) {
      console.error('Failed to get widget data:', error);
      return null;
    }
  },

  async removeItem(key: string) {
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
    return true;
  } catch (error) {
    console.error('Failed to sync store to widget:', error);
    return false;
  }
};
