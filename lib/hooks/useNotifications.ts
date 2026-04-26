// components/notifications/NotificationManager.tsx
import { supabase } from '@/supabase/client';
import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useState } from 'react';
import { usePostHog } from 'posthog-react-native';
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

function getNotificationTriggerType(
  trigger: Notifications.NotificationTrigger | null | undefined
) {
  if (trigger && typeof trigger === 'object' && 'type' in trigger) {
    return String(trigger.type);
  }

  return 'unknown';
}

function getNotificationCategoryIdentifier(
  content: Notifications.NotificationContent
) {
  if ('categoryIdentifier' in content) {
    return content.categoryIdentifier ?? null;
  }

  return null;
}

export function useNotifications() {
  const { t } = useTranslation();
  const userId = useUserProfileStore((state) => state.profile?.id);
  const { notificationsEnabled, setNotificationsEnabled } = useAppStore();
  const posthog = usePostHog();
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
        posthog.capture('notification_received', {
          notification_id: notification.request.identifier,
          notification_trigger_type: getNotificationTriggerType(
            notification.request.trigger
          ),
          notification_category_identifier:
            getNotificationCategoryIdentifier(notification.request.content),
        });
      }
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('Notification response:', response);
        posthog.capture('notification_opened', {
          notification_id: response.notification.request.identifier,
          notification_trigger_type: getNotificationTriggerType(
            response.notification.request.trigger
          ),
          notification_category_identifier:
            getNotificationCategoryIdentifier(
              response.notification.request.content
            ),
          action_identifier: response.actionIdentifier,
        });
      });

    setupNotifications();

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, [posthog, userId]);

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
            posthog.capture('notification_permission_result', {
              source: 'settings',
              permission_status: 'denied',
            });
            setIsLoading(false);
            showPermissionDeniedAlert();
            return;
          }

          const token = await registerForPushNotificationsAsync();

          if (token) {
            await savePushToken(userId, token);
            setNotificationsEnabled(true);
            posthog.capture('notification_permission_result', {
              source: 'settings',
              permission_status: 'granted',
            });
            posthog.capture('notification_preference_changed', {
              source: 'settings',
              preference_key: 'push_notifications',
              enabled: true,
            });
          } else {
            setNotificationsEnabled(false);
            posthog.capture('notification_permission_result', {
              source: 'settings',
              permission_status: 'not_granted',
            });
            showPermissionDeniedAlert();
          }
        } else {
          await removePushToken(userId);
          setNotificationsEnabled(false);
          posthog.capture('notification_preference_changed', {
            source: 'settings',
            preference_key: 'push_notifications',
            enabled: false,
          });
        }
      } catch (error) {
        setNotificationsEnabled(false);
        posthog.capture('notification_permission_result', {
          source: 'settings',
          permission_status: 'error',
        });
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
    [posthog, setNotificationsEnabled, showPermissionDeniedAlert, t, userId]
  );

  return {
    toggleNotifications,
    isLoading,
    syncNotificationState,
  };
}
