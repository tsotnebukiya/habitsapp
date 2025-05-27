// components/notifications/NotificationManager.tsx
import { supabase } from '@/supabase/client';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';
import { Alert, AppState, AppStateStatus, Linking } from 'react-native';
import { useAppStore } from '../stores/app_state';
import useUserProfileStore from '../stores/user_profile';
import { dateUtils } from '../utils/dayjs';
import {
  getNotificationState,
  registerForPushNotificationsAsync,
  removePushToken,
  savePushToken,
} from '../utils/notifications';
import { useTranslation } from './useTranslation';

export function useNotifications() {
  const { t } = useTranslation();
  const userId = useUserProfileStore((state) => state.profile?.id);
  const { notificationsEnabled, setNotificationsEnabled } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);

  const syncNotificationState = useCallback(async () => {
    if (!userId) return;

    try {
      const actualState = await getNotificationState(userId);
      if (actualState !== notificationsEnabled) {
        setNotificationsEnabled(actualState);
      }
    } catch (error) {
      console.error('Error syncing notification state:', error);
    }
  }, [notificationsEnabled, setNotificationsEnabled, userId]);

  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        await syncNotificationState();
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );
    return () => subscription?.remove();
  }, [syncNotificationState]);

  useEffect(() => {
    if (!userId) return;
    syncNotificationState();
  }, [userId, syncNotificationState]);

  useEffect(() => {
    if (!userId) return;

    async function setupNotifications() {
      try {
        const currentTimezone = dateUtils.getCurrentTimezone();
        await supabase
          .from('users')
          .update({ timezone: currentTimezone })
          .eq('id', userId!);
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    }

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
      }
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('Notification response:', response);
      });

    setupNotifications();

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, [userId]);

  const showPermissionDeniedAlert = useCallback(() => {
    Alert.alert(
      t('notifications.permissionRequired'),
      t('notifications.permissionDeniedMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('notifications.openSettings'),
          onPress: () => {
            Linking.openSettings();
          },
        },
      ]
    );
  }, [t]);

  const toggleNotifications = useCallback(
    async (enable: boolean) => {
      if (!userId) {
        return;
      }

      setIsLoading(true);

      try {
        if (enable) {
          // Check current permissions first
          const { status: currentStatus } =
            await Notifications.getPermissionsAsync();

          if (currentStatus === 'denied') {
            setIsLoading(false);
            showPermissionDeniedAlert();
            return;
          }

          const token = await registerForPushNotificationsAsync();

          if (token) {
            await savePushToken(userId, token);
            setNotificationsEnabled(true);
          } else {
            setNotificationsEnabled(false);
            showPermissionDeniedAlert();
          }
        } else {
          await removePushToken(userId);
          setNotificationsEnabled(false);
        }
      } catch (error) {
        setNotificationsEnabled(false);
        Alert.alert(t('common.error'), t('notifications.notificationError'), [
          {
            text: t('common.retry'),
            onPress: () => toggleNotifications(enable),
          },
          {
            text: t('common.cancel'),
            style: 'cancel',
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [userId, setNotificationsEnabled, showPermissionDeniedAlert, t]
  );

  return {
    toggleNotifications,
    isLoading,
    syncNotificationState,
  };
}
