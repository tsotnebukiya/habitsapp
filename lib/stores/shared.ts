import AsyncStorage from '@react-native-async-storage/async-storage';
import useUserProfileStore from './user_profile';
import { StoreApi } from 'zustand';
import dayjs from '@/lib/utils/dayjs';

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

export const getUserIdOrThrow = () => {
  const userId = useUserProfileStore.getState().profile?.id;
  if (!userId) throw new Error('User not logged in');
  return userId;
};

export const createBaseState = (): BaseState => ({
  lastSyncTime: dayjs(0).toDate(),
  isLoading: false,
  error: null,
});
