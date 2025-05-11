import { requireNativeModule } from 'expo';

declare class WidgetStorageModule {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  reloadAllTimelines(): void;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<WidgetStorageModule>('WidgetStorage');
