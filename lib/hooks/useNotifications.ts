// components/notifications/NotificationManager.tsx
import { useEffect, useState, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import useUserProfileStore from '../stores/user_profile';
import {
  registerForPushNotificationsAsync,
  savePushToken,
  removePushToken,
  getNotificationState,
} from '../utils/notifications';
import { useAppStore } from '../stores/app_state';
import { supabase } from '@/supabase/client';
import { dateUtils } from '../utils/dayjs';

export function useNotifications() {
  const userId = useUserProfileStore((state) => state.profile?.id);
  const { notificationsEnabled, setNotificationsEnabled } = useAppStore();

  useEffect(() => {
    if (!userId) return;

    async function setupNotifications() {
      // Update user timezone
      const currentTimezone = dateUtils.getCurrentTimezone();
      // Try to register if preference is null or enabled
      if (notificationsEnabled === null || notificationsEnabled) {
        const [token] = await Promise.all([
          registerForPushNotificationsAsync(),
          await supabase
            .from('users')
            .update({ timezone: currentTimezone })
            .eq('id', userId!),
        ]);
        if (token) {
          await savePushToken(userId!, token);
          setNotificationsEnabled(true);
        } else {
          setNotificationsEnabled(false);
        }
      }
    }

    // Set up notification handlers
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
  }, []);

  const toggleNotifications = useCallback(
    async (enable: boolean) => {
      try {
        if (!userId) return;
        if (enable) {
          const token = await registerForPushNotificationsAsync();
          if (token) {
            await savePushToken(userId, token);
            setNotificationsEnabled(true);
          }
        } else {
          await removePushToken(userId);
          setNotificationsEnabled(false);
        }
      } catch (err) {
        console.log(err, 'error');
      }
    },
    [userId]
  );

  return { toggleNotifications };
}
