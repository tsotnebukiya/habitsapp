import { NativeModule, requireNativeModule } from 'expo';

// Remove the generic type and update the method declarations to match the Swift implementation
declare class WidgetStorageModule extends NativeModule {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  reloadAllTimelines(): void;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<WidgetStorageModule>('WidgetStorage');
