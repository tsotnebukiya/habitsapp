import AsyncStorage from '@react-native-async-storage/async-storage';
import useUserProfileStore from './user_profile';
import { StoreApi } from 'zustand';

export const STORE_CONSTANTS = {
  MAX_RETRY_ATTEMPTS: 3,
  MIN_RETRY_INTERVAL: 1000 * 60, // 1 minute
};

export interface BaseState {
  lastSyncTime: Date;
  isLoading: boolean;
  error: string | null;
}

export interface BasePendingOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  timestamp: Date;
  retryCount: number;
  lastAttempt?: Date;
}

export const createAsyncStorage = (name: string) => ({
  name,
  storage: {
    getItem: async (name: string) => {
      const value = await AsyncStorage.getItem(name);
      return value ? JSON.parse(value) : null;
    },
    setItem: async (name: string, value: any) => {
      await AsyncStorage.setItem(name, JSON.stringify(value));
    },
    removeItem: async (name: string) => {
      await AsyncStorage.removeItem(name);
    },
  },
});

export const createPendingOperation = <T>(
  id: string,
  type: 'create' | 'update' | 'delete',
  table: string,
  data?: T
): BasePendingOperation & { table: string; data?: T } => ({
  id,
  type,
  table,
  data,
  timestamp: new Date(),
  retryCount: 0,
  lastAttempt: new Date(),
});

export const shouldSkipOperation = (op: BasePendingOperation) => {
  const now = new Date();
  return (
    (op.lastAttempt &&
      now.getTime() - op.lastAttempt.getTime() <
        STORE_CONSTANTS.MIN_RETRY_INTERVAL) ||
    op.retryCount >= STORE_CONSTANTS.MAX_RETRY_ATTEMPTS
  );
};

export const getUserIdOrThrow = () => {
  const userId = useUserProfileStore.getState().profile?.id;
  if (!userId) throw new Error('User not logged in');
  return userId;
};

export const createErrorHandler = <T extends BaseState>(
  set: StoreApi<T>['setState']
) => ({
  clearError: () => set({ error: null } as Partial<T>),
  setError: (error: Error) =>
    set({ error: error.message, isLoading: false } as Partial<T>),
});

export const createBaseState = (): BaseState => ({
  lastSyncTime: new Date(0),
  isLoading: false,
  error: null,
});
