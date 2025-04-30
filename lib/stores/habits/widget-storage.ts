import { NativeModules } from 'react-native';
import { dateUtils } from '@/lib/utils/dayjs';
import { SharedSlice } from './types';
import dayjs, { OpUnitType } from 'dayjs';

const { WidgetStorage } = NativeModules;

// App Group name - must match the widget's app group
const APP_GROUP = 'group.com.vdl.habitapp';
const WIDGET_DATA_KEY = 'habits';

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
  async setItem(key: string, value: string): Promise<boolean> {
    try {
      if (!WidgetStorage?.setUserDefault) {
        console.error('WidgetStorage.setUserDefault is not available');
        return false;
      }
      return await WidgetStorage.setUserDefault(key, value, APP_GROUP);
    } catch (error) {
      console.error('Failed to set UserDefaults:', error);
      return false;
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      if (!WidgetStorage?.getUserDefault) {
        console.error('WidgetStorage.getUserDefault is not available');
        return null;
      }
      return await WidgetStorage.getUserDefault(key, APP_GROUP);
    } catch (error) {
      console.error('Failed to get UserDefaults:', error);
      return null;
    }
  },

  async removeItem(key: string): Promise<boolean> {
    try {
      if (!WidgetStorage?.removeUserDefault) {
        console.error('WidgetStorage.removeUserDefault is not available');
        return false;
      }
      return await WidgetStorage.removeUserDefault(key, APP_GROUP);
    } catch (error) {
      console.error('Failed to remove UserDefaults:', error);
      return false;
    }
  },
};

export const widgetStorage: WidgetStorageInterface = {
  async setItem(key: string, value: string) {
    return await UserDefaults.setItem(key, value);
  },

  async getItem(key: string) {
    return await UserDefaults.getItem(key);
  },

  async removeItem(key: string) {
    return await UserDefaults.removeItem(key);
  },
};

// Main function to sync store data to widget
export const syncStoreToWidget = async (state: SharedSlice) => {
  try {
    const widgetData = transformStoreDataForWidget(state);
    const jsonString = JSON.stringify(widgetData);
    const success = await widgetStorage.setItem(WIDGET_DATA_KEY, jsonString);

    if (success) {
      console.log('Successfully synced data to widget');
      if (WidgetStorage?.reloadAllTimelines) {
        await WidgetStorage.reloadAllTimelines();
      }
    } else {
      console.error('Failed to sync data to widget');
    }

    return success;
  } catch (error) {
    console.error('Failed to sync store to widget:', error);
    return false;
  }
};
