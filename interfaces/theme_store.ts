// interfaces/theme_store.ts
// Dark mode support coming soon!
// Docs will be updated once dark mode support is fully implemented.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

export const themeStorage = new MMKV({
    id: 'theme-store',
});

const storage = {
    setItem: (name: string, value: string) => themeStorage.set(name, value),
    getItem: (name: string) => themeStorage.getString(name) ?? null,
    removeItem: (name: string) => themeStorage.delete(name),
};

interface ThemeState {
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    isDarkMode: boolean;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            themeMode: 'system',

            setThemeMode: (mode) => set({ themeMode: mode }),

            get isDarkMode() {
                const { themeMode } = get();
                const systemTheme = useColorScheme();
                return themeMode === 'dark' ||
                    (themeMode === 'system' && systemTheme === 'dark');
            },
        }),
        {
            name: 'theme-storage',
            storage: createJSONStorage(() => storage),
        }
    )
);