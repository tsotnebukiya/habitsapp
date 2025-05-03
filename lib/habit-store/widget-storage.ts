import * as WidgetStorage from 'widget-storage';
import { dateUtils } from '@/lib/utils/dayjs';
import { SharedSlice } from './types';
import dayjs, { OpUnitType } from 'dayjs';

// const { WidgetStorage } = NativeModules;

// App Group name is defined and used ONLY in the native Swift code.
// const APP_GROUP = 'group.com.vdl.habitapp'; // This is NOT used by the JS calls
const WIDGET_DATA_KEY = 'habits';

interface WidgetStorageInterface {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
}

// Transform store data into widget format
const transformStoreDataForWidget = (state: SharedSlice) => {
  const now = dateUtils.nowUTC();
  const startOfWeek = dayjs(now).startOf('isoWeek').startOf('day');

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
      // Format date to match widget's format
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

// Helper to access UserDefaults through native module
const UserDefaults = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (!WidgetStorage) {
        console.error('Native module WidgetStorage is not available!!');
        return;
      }
      if (typeof WidgetStorage.setItem !== 'function') {
        console.error(
          'WidgetStorage.setItem method is not available on the native module.'
        );
        return;
      }
      await WidgetStorage.setItem(key, value);
    } catch (error) {
      console.error('Failed to set UserDefaults via native module:', error);
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      if (!WidgetStorage) {
        console.error('Native module WidgetStorage is not available!');
        return null;
      }
      if (typeof WidgetStorage.getItem !== 'function') {
        console.error(
          'WidgetStorage.getItem method is not available on the native module.'
        );
        return null;
      }
      return await WidgetStorage.getItem(key);
    } catch (error) {
      console.error('Failed to get UserDefaults via native module:', error);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (!WidgetStorage) {
        console.error('Native module WidgetStorage is not available!');
        return;
      }
      if (typeof WidgetStorage.removeItem !== 'function') {
        console.error(
          'WidgetStorage.removeItem method is not available on the native module.'
        );
        return;
      }
      await WidgetStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove UserDefaults via native module:', error);
    }
  },
};

export const widgetStorage: WidgetStorageInterface = {
  async setItem(key: string, value: string): Promise<void> {
    await UserDefaults.setItem(key, value);
  },

  async getItem(key: string) {
    return await UserDefaults.getItem(key);
  },

  async removeItem(key: string): Promise<void> {
    await UserDefaults.removeItem(key);
  },
};

// Main function to sync store data to widget
export const syncStoreToWidget = async (state: SharedSlice) => {
  if (!WidgetStorage) {
    console.error('Native module WidgetStorage is not available!');
    return;
  }

  let syncSuccess = false;
  try {
    const widgetData = transformStoreDataForWidget(state);
    const jsonString = JSON.stringify(widgetData);
    await widgetStorage.setItem(WIDGET_DATA_KEY, jsonString);

    syncSuccess = true;

    if (
      WidgetStorage &&
      typeof WidgetStorage.reloadAllTimelines === 'function'
    ) {
      WidgetStorage.reloadAllTimelines();
    } else {
      console.warn(
        'WidgetStorage.reloadAllTimelines method is not available on the native module.'
      );
    }
  } catch (error) {
    console.error('Failed to sync store to widget:', error);
    syncSuccess = false;
  }
};
