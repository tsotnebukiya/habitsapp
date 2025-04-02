import { useEffect, useMemo } from 'react';
import { usePushupStore } from '../interfaces/pushup_store';
import dayjs from 'dayjs';

/**
 * Hook to get all pushup entries
 * @returns {PushupEntry[]} Array of all pushup entries
 */
export const useAllPushupEntries = () => {
    const getAllEntries = usePushupStore(state => state.getAllEntries);
    const entries = usePushupStore(state => state.entries);

    // Only recompute when the entries Map changes
    return useMemo(() => getAllEntries(), [entries]);
};

/**
 * Hook to get today's pushup entries
 * @returns {{ 
 *   entries: PushupEntry[], 
 *   totalCount: number 
 * }} Object containing today's entries and total pushup count
 */
export const useTodaysPushups = () => {
    const entries = usePushupStore(state => state.entries);
    const syncWithServer = usePushupStore(state => state.syncWithServer);

    // Sync with server when component mounts
    useEffect(() => {
        syncWithServer();
    }, []);

    return useMemo(() => {
        const startOfDay = dayjs().startOf('day');
        const endOfDay = dayjs().endOf('day');

        const todaysEntries = Array.from(entries.values()).filter(entry => {
            const entryDate = dayjs(entry.timestamp);
            return entryDate.isAfter(startOfDay) ||
                entryDate.isBefore(endOfDay) ||
                entryDate.isSame(startOfDay) ||
                entryDate.isSame(endOfDay);
        });

        const totalCount = todaysEntries.reduce((sum, entry) => sum + entry.count, 0);

        return {
            entries: todaysEntries,
            totalCount
        };
    }, [entries]);
};

/**
 * Hook to get pushup entries for a specific date
 * @param date {Date} The date to get entries for
 * @returns {{ 
 *   entries: PushupEntry[], 
 *   totalCount: number,
 *   isToday: boolean
 * }} Object containing the date's entries, total count, and whether it's today
 */
export const useDatePushups = (date: Date) => {
    const entries = usePushupStore(state => state.entries);

    return useMemo(() => {
        const targetDay = dayjs(date);
        const startOfDay = targetDay.startOf('day');
        const endOfDay = targetDay.endOf('day');
        const isToday = targetDay.isSame(dayjs(), 'day');

        const dateEntries = Array.from(entries.values()).filter(entry => {
            const entryDate = dayjs(entry.timestamp);
            return (entryDate.isAfter(startOfDay) || entryDate.isSame(startOfDay)) &&
                (entryDate.isBefore(endOfDay) || entryDate.isSame(endOfDay));
        });

        const totalCount = dateEntries.reduce((sum, entry) => sum + entry.count, 0);

        return {
            entries: dateEntries,
            totalCount,
            isToday
        };
    }, [entries, date]);
};

/**
 * Hook to get a single pushup entry by ID
 * @param id {string | null} The ID of the entry to get
 * @returns {PushupEntry | null} The entry if found, null otherwise
 */
export const usePushupEntry = (id: string | null) => {
    const entries = usePushupStore(state => id ? state.entries.get(id) : null);
    return entries ?? null;
};
