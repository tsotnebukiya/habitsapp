// // interfaces/pushup_store.ts
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';
// import { supabase } from '../app/supabase';
// import { v4 as uuidv4 } from 'uuid';
// import dayjs from 'dayjs';

// interface PushupEntry {
//     id: string;
//     user_id: string;
//     count: number;
//     timestamp: string;
//     created_at: string;
//     updated_at: string;
// }

// interface PendingOperation {
//     id: string;
//     type: 'create' | 'update' | 'delete';
//     entryData?: PushupEntry;
//     timestamp: Date;
//     retryCount: number;
//     lastAttempt?: Date;
// }

// interface PushupState {
//     // Local state
//     entries: Map<string, PushupEntry>;
//     pendingOperations: PendingOperation[];
//     lastSyncTime: Date;
//     isLoading: boolean;
//     error: string | null;

//     // Actions
//     addEntry: (count: number) => Promise<string>;
//     updateEntry: (id: string, count: number) => Promise<void>;
//     deleteEntry: (id: string) => Promise<void>;
//     syncWithServer: () => Promise<void>;
//     importEntries: (entries: PushupEntry[]) => Promise<void>;
//     processPendingOperations: () => Promise<void>;

//     // Queries
//     getAllEntries: () => PushupEntry[];
//     getEntriesByDateRange: (startDate: Date, endDate: Date) => PushupEntry[];
//     getTotalForDate: (date: Date) => number;
//     getStreak: () => number;
//     getTotalPushups: () => number;
//     clearError: () => void;
// }

// // USAGE NOTES:
// // 1. Call syncWithServer() in these situations:
// //    - When your app launches
// //    - After user logs in
// //    - When user manually requests sync
// //    - Periodically (e.g., every hour) if needed
// //    - Some custom hooks are configured to automatically sync
// //
// // 2. The store automatically attempts to sync pending operations:
// //    - After adding a new entry
// //    - After updating an entry
// //    - After deleting an entry
// //
// // 3. Error Handling:
// //    - Check store.error for sync/operation errors
// //    - Call clearError() after handling errors in UI
// //    - isLoading indicates sync in progress
// //
// // 4. Best Practices:
// //    - Use importEntries() for batch operations
// //    - Consider adding pull-to-refresh in UI to trigger manual sync
// //    - Show last sync time in UI for transparency
// //    - Handle loading states in UI during syncs

// const MAX_RETRY_ATTEMPTS = 3;
// const MIN_RETRY_INTERVAL = 1000 * 60; // 1 minute

// export const usePushupStore = create<PushupState>()(
//     persist(
//         (set, get) => ({
//             entries: new Map(),
//             pendingOperations: [],
//             lastSyncTime: new Date(0),
//             isLoading: false,
//             error: null,

//             addEntry: async (count: number) => {
//                 console.log('[Pushup Store] Creating new pushup entry');

//                 const now = new Date().toISOString();
//                 const newEntry: PushupEntry = {
//                     id: uuidv4(),
//                     user_id: (await supabase.auth.getUser()).data.user?.id ?? '',
//                     count,
//                     timestamp: now,
//                     created_at: now,
//                     updated_at: now,
//                 };

//                 // Update local store first
//                 set((state) => {
//                     const newEntries = new Map(state.entries);
//                     newEntries.set(newEntry.id, newEntry);
//                     return { entries: newEntries };
//                 });

//                 try {
//                     // Try to sync immediately
//                     const { error } = await supabase
//                         .from('pushups')
//                         .insert(newEntry);

//                     if (error) throw error;
//                     console.log(`[Pushup Store] Successfully created entry ${newEntry.id}`);
//                 } catch (error) {
//                     console.warn(`[Pushup Store] Failed to sync entry ${newEntry.id}:`, error);
//                     // Add to pending operations
//                     set((state) => ({
//                         pendingOperations: [...state.pendingOperations, {
//                             id: newEntry.id,
//                             type: 'create',
//                             entryData: newEntry,
//                             timestamp: new Date(),
//                             retryCount: 0,
//                             lastAttempt: new Date()
//                         }]
//                     }));
//                 }

//                 // Try to process any pending operations
//                 await get().processPendingOperations();
//                 return newEntry.id;
//             },

//             processPendingOperations: async () => {
//                 const { pendingOperations } = get();
//                 const now = new Date();
//                 const remainingOperations: PendingOperation[] = [];

//                 for (const operation of pendingOperations) {
//                     // Skip if we've tried too recently
//                     if (operation.lastAttempt &&
//                         now.getTime() - operation.lastAttempt.getTime() < MIN_RETRY_INTERVAL) {
//                         remainingOperations.push(operation);
//                         continue;
//                     }

//                     try {
//                         if (operation.retryCount >= MAX_RETRY_ATTEMPTS) {
//                             console.error(`[Pushup Store] Max retries exceeded for operation on ${operation.id}`);
//                             continue;
//                         }

//                         switch (operation.type) {
//                             case 'create':
//                             case 'update':
//                                 if (operation.entryData) {
//                                     const { error } = await supabase
//                                         .from('pushups')
//                                         .upsert(operation.entryData);
//                                     if (error) throw error;
//                                 }
//                                 break;

//                             case 'delete':
//                                 const { error } = await supabase
//                                     .from('pushups')
//                                     .delete()
//                                     .eq('id', operation.id);
//                                 if (error) throw error;
//                                 break;
//                         }
//                     } catch (error) {
//                         remainingOperations.push({
//                             ...operation,
//                             retryCount: operation.retryCount + 1,
//                             lastAttempt: now
//                         });
//                     }
//                 }

//                 set({ pendingOperations: remainingOperations });
//             },

//             updateEntry: async (id: string, count: number) => {
//                 const entry = get().entries.get(id);
//                 if (!entry) return;

//                 const updatedEntry = {
//                     ...entry,
//                     count,
//                     updated_at: new Date().toISOString()
//                 };

//                 // Update local first
//                 set((state) => {
//                     const newEntries = new Map(state.entries);
//                     newEntries.set(id, updatedEntry);
//                     return { entries: newEntries };
//                 });

//                 try {
//                     const { error } = await supabase
//                         .from('pushups')
//                         .update(updatedEntry)
//                         .eq('id', id);

//                     if (error) throw error;
//                 } catch (error) {
//                     set((state) => ({
//                         pendingOperations: [...state.pendingOperations, {
//                             id,
//                             type: 'update',
//                             entryData: updatedEntry,
//                             timestamp: new Date(),
//                             retryCount: 0,
//                             lastAttempt: new Date()
//                         }]
//                     }));
//                 }

//                 await get().processPendingOperations();
//             },

//             deleteEntry: async (id: string) => {
//                 // Delete locally first
//                 set((state) => {
//                     const newEntries = new Map(state.entries);
//                     newEntries.delete(id);
//                     return { entries: newEntries };
//                 });

//                 try {
//                     const { error } = await supabase
//                         .from('pushups')
//                         .delete()
//                         .eq('id', id);

//                     if (error) throw error;
//                 } catch (error) {
//                     set((state) => ({
//                         pendingOperations: [...state.pendingOperations, {
//                             id,
//                             type: 'delete',
//                             timestamp: new Date(),
//                             retryCount: 0,
//                             lastAttempt: new Date()
//                         }]
//                     }));
//                 }

//                 await get().processPendingOperations();
//             },

//             importEntries: async (entries: PushupEntry[]) => {
//                 // Update local store
//                 set((state) => {
//                     const newEntries = new Map(state.entries);
//                     entries.forEach(entry => newEntries.set(entry.id, entry));
//                     return { entries: newEntries };
//                 });

//                 try {
//                     // Try to sync with server
//                     const { error } = await supabase
//                         .from('pushups')
//                         .upsert(entries);

//                     if (error) throw error;
//                 } catch (error) {
//                     // Add all entries to pending operations
//                     set((state) => ({
//                         pendingOperations: [
//                             ...state.pendingOperations,
//                             ...entries.map(entry => ({
//                                 id: entry.id,
//                                 type: 'create' as const,
//                                 entryData: entry,
//                                 timestamp: new Date(),
//                                 retryCount: 0,
//                                 lastAttempt: new Date()
//                             }))
//                         ]
//                     }));
//                 }

//                 await get().processPendingOperations();
//             },

//             syncWithServer: async () => {
//                 console.log('[Pushup Store] Starting server sync');
//                 set({ isLoading: true });

//                 try {
//                     // Process any pending operations first
//                     await get().processPendingOperations();

//                     const lastSync = get().lastSyncTime.toISOString();
//                     const { data: serverEntries, error } = await supabase
//                         .from('pushups')
//                         .select('*')
//                         .gt('updated_at', lastSync);

//                     if (error) throw error;

//                     if (serverEntries) {
//                         const localEntries = get().entries;

//                         serverEntries.forEach(serverEntry => {
//                             const localEntry = localEntries.get(serverEntry.id);

//                             if (!localEntry || new Date(serverEntry.updated_at) > new Date(localEntry.updated_at)) {
//                                 set((state) => {
//                                     const newEntries = new Map(state.entries);
//                                     newEntries.set(serverEntry.id, serverEntry);
//                                     return { entries: newEntries };
//                                 });
//                             }
//                         });
//                     }

//                     set({
//                         lastSyncTime: new Date(),
//                         error: null
//                     });
//                 } catch (error) {
//                     set({ error: (error as Error).message });
//                 } finally {
//                     set({ isLoading: false });
//                 }
//             },

//             getAllEntries: () => Array.from(get().entries.values()),

//             getTotalForDate: (date: Date) => {
//                 const startOfDay = dayjs(date).startOf('day');
//                 const endOfDay = startOfDay.endOf('day');

//                 return Array.from(get().entries.values())
//                     .filter(entry => {
//                         const entryDate = dayjs(entry.timestamp);
//                         return (entryDate.isAfter(startOfDay) || entryDate.isSame(startOfDay, 'second')) &&
//                                (entryDate.isBefore(endOfDay) || entryDate.isSame(endOfDay, 'second'));
//                     })
//                     .reduce((sum, entry) => sum + entry.count, 0);
//             },

//             clearError: () => set({ error: null }),

//             getEntriesByDateRange: (startDate: Date, endDate: Date) => {
//                 return Array.from(get().entries.values()).filter(entry => {
//                     const entryDate = new Date(entry.timestamp);
//                     return entryDate >= startDate && entryDate <= endDate;
//                 });
//             },

//             getTotalPushups: () => {
//                 return Array.from(get().entries.values())
//                     .reduce((sum, entry) => sum + entry.count, 0);
//             },

//             getStreak: () => {
//                 const entries = Array.from(get().entries.values());
//                 if (entries.length === 0) return 0;

//                 const today = new Date().setHours(0, 0, 0, 0);
//                 let currentStreak = 0;
//                 let currentDate = today;

//                 while (true) {
//                     const hasEntryForDay = entries.some(entry =>
//                         new Date(entry.timestamp).setHours(0, 0, 0, 0) === currentDate
//                     );

//                     if (!hasEntryForDay) break;

//                     currentStreak++;
//                     currentDate -= 86400000; // Subtract one day in milliseconds
//                 }

//                 return currentStreak;
//             },
//         }),
//         // We use AsyncStorage for Pushup Store storage over AsyncStorage
//         // because MMKV has size limit issues, whereas AsyncStorage can handle
//         // much larger amounts of data.
//         {
//             name: 'pushup-store',
//             storage: {
//                 getItem: async (name) => {
//                     const str = await AsyncStorage.getItem(name);
//                     if (!str) return null;
//                     const value = JSON.parse(str);
//                     return {
//                         ...value,
//                         state: {
//                             ...value.state,
//                             entries: new Map(value.state.entries),
//                             lastSyncTime: new Date(value.state.lastSyncTime),
//                             pendingOperations: value.state.pendingOperations.map((op: any) => ({
//                                 ...op,
//                                 timestamp: new Date(op.timestamp),
//                                 lastAttempt: op.lastAttempt ? new Date(op.lastAttempt) : undefined
//                             }))
//                         },
//                     };
//                 },
//                 setItem: async (name, value) => {
//                     const str = JSON.stringify({
//                         ...value,
//                         state: {
//                             ...value.state,
//                             entries: Array.from(value.state.entries.entries()),
//                             lastSyncTime: value.state.lastSyncTime.toISOString(),
//                             pendingOperations: value.state.pendingOperations.map((op: PendingOperation) => ({
//                                 ...op,
//                                 timestamp: op.timestamp.toISOString(),
//                                 lastAttempt: op.lastAttempt?.toISOString()
//                             }))
//                         },
//                     });
//                     await AsyncStorage.setItem(name, str);
//                 },
//                 removeItem: async (name) => {
//                     await AsyncStorage.removeItem(name);
//                 },
//             },
//         }
//     )
// );
