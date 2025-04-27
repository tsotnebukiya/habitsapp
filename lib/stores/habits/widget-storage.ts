import { NativeModules } from 'react-native';
import { WIDGET_APP_GROUP } from '../constants/widget';

const { WidgetStorage } = NativeModules;

interface WidgetStorageInterface {
  setItem(key: string, value: string): Promise<boolean>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<boolean>;
}

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
