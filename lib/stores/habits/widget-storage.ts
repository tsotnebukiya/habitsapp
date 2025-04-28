import { NativeModules } from 'react-native';
import { dateUtils } from '@/lib/utils/dayjs';
import { SharedSlice } from './types';
import dayjs, { OpUnitType } from 'dayjs';

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

const WIDGET_DATA_KEY = 'habits'; // Use 'habits' as the key to match widget code

interface WidgetStorageInterface {
  setItem(key: string, value: string): Promise<boolean>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<boolean>;
}

// Transform store data into widget format
const transformStoreDataForWidget = (state: SharedSlice) => {
  const now = dateUtils.nowUTC();
  const startOfWeek = dayjs(now)
    .startOf('isoWeek' as OpUnitType)
    .startOf('day');

  const habits = Array.from(state.habits.values());
  const completions = Array.from(state.completions.values()).filter((c) => {
    const completionDate = dateUtils
      .fromServerDate(c.completion_date)
      .startOf('day');
    const isAfter = completionDate.isSameOrAfter(startOfWeek, 'day');
    return isAfter;
  });

  const widgetData = habits.map((habit) => {
    const weeklyStatus: { [key: string]: boolean } = {};

    for (let i = 0; i < 7; i++) {
      const date = dayjs(startOfWeek).add(i, 'day').utc().startOf('day');
      const dateKey = date.toISOString();

      const isCompleted = completions.some((c) => {
        const completionDate = dayjs.utc(c.completion_date).startOf('day');
        const isSameHabit = c.habit_id === habit.id;
        const isSameDay = completionDate.isSame(date, 'day');
        const isCompletedStatus = c.status === 'completed';
        return isSameHabit && isSameDay && isCompletedStatus;
      });
      weeklyStatus[dateKey] = isCompleted;
    }
    return {
      id: habit.id,
      name: habit.name,
      icon: habit.icon,
      color: habit.color,
      weeklyStatus,
    };
  });

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
export const syncStoreToWidget = async (state: SharedSlice) => {
  try {
    const widgetData = transformStoreDataForWidget(state);
    await widgetStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(widgetData));
    const data = await widgetStorage.getItem(WIDGET_DATA_KEY);
    console.log(data, 'data');
    if (WidgetStorage?.reloadAllTimelines) {
      await WidgetStorage.reloadAllTimelines();
    }
    console.log('Attempted to sync data to widget.');
    return true;
  } catch (error) {
    console.error('Failed to sync store to widget:', error);
    return false;
  }
};
