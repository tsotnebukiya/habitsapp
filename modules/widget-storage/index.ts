// Reexport the native module. On web, it will be resolved to WidgetStorageModule.web.ts
// and on native platforms to WidgetStorageModule.ts
export { default } from './src/WidgetStorageModule';

import WidgetStorageModule from './src/WidgetStorageModule';

/**
 * Stores an item in the widget's shared UserDefaults.
 * @param key The key to store the item under.
 * @param value The string value to store.
 */
export async function setItem(key: string, value: string): Promise<void> {
  return await WidgetStorageModule.setItem(key, value);
}

/**
 * Retrieves an item from the widget's shared UserDefaults.
 * @param key The key of the item to retrieve.
 * @returns The string value stored under the key, or null if the key doesn't exist.
 */
export async function getItem(key: string): Promise<string | null> {
  return await WidgetStorageModule.getItem(key);
}

/**
 * Removes an item from the widget's shared UserDefaults.
 * @param key The key of the item to remove.
 */
export async function removeItem(key: string): Promise<void> {
  return await WidgetStorageModule.removeItem(key);
}

/**
 * Triggers a timeline reload for all widgets.
 * Requires iOS 14+.
 */
export function reloadAllTimelines(): void {
  // Check if the native module and function exist before calling
  if (WidgetStorageModule?.reloadAllTimelines) {
    WidgetStorageModule.reloadAllTimelines();
  } else {
    console.warn(
      "'reloadAllTimelines' is not available on this platform or version."
    );
  }
}
