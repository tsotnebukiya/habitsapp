import { dateUtils } from '@/lib/utils/dayjs';
import dayjs from 'dayjs';
import * as WidgetStorage from 'modules/widget-storage';
import { getCurrentProgress } from '../utils/misc';
import { Habit, HabitCompletion } from './types';

const WIDGET_DATA_KEY = 'habits';

interface WidgetStorageInterface {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
}

// Transform store data into widget format
const transformStoreDataForWidget = (
  habitsMap: Map<string, Habit>,
  completionsMap: Map<string, HabitCompletion>
) => {
  const now = dateUtils.nowUTC();
  const startOfWeek = dayjs(now).startOf('isoWeek').startOf('day');

  const habits = Array.from(habitsMap.values());
  const completions = Array.from(completionsMap.values()).filter((c) => {
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

      // Find completion for this habit and date
      const completion = completions.find((c) => {
        const completionDate = dayjs.utc(c.completion_date).startOf('day');
        const isSameHabit = c.habit_id === habit.id;
        const isSameDay = completionDate.isSame(date, 'day');
        return isSameHabit && isSameDay;
      });

      // Calculate progress and convert to boolean for widget
      // Widget shows complete only when progress reaches 100%
      const progress = completion
        ? getCurrentProgress(habit, completion.value || 0)
        : 0;
      const isCompleted = progress >= 1.0;

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
export const syncStoreToWidget = async (
  habits: Map<string, Habit>,
  completions: Map<string, HabitCompletion>
) => {
  if (!WidgetStorage) {
    console.error('Native module WidgetStorage is not available!');
    return;
  }

  let syncSuccess = false;
  try {
    const widgetData = transformStoreDataForWidget(habits, completions);
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
