// components/notifications/NotificationManager.tsx
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import useUserProfileStore from '../../interfaces/user_profile';
import { registerForPushNotificationsAsync, savePushToken, scheduleLocalNotification } from '../../utils/NotificationsSetup';


export function useNotifications() {
  useEffect(() => {
    const userId = useUserProfileStore.getState().profile?.id;
    
    // Register for notifications and save token
    const registerDevice = async () => {
      const token = await registerForPushNotificationsAsync();
      if (token && userId) {
        await savePushToken(userId, token);
      }
    };

    // Set up notification handlers
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      // Handle notification interaction here
    });

    registerDevice();

    // Cleanup
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  // Example functions for scheduling notifications
  const scheduleWeightCheckInReminder = async () => {
    await scheduleLocalNotification({
      title: "Time to check in!",
      body: "Don't forget to log your weight today!",
      trigger: {
        hour: 8, // 8 AM
        minute: 0,
        repeats: true
      }
    });
  };

  const scheduleGoalReminder = async () => {
    await scheduleLocalNotification({
      title: "Goal Check-in",
      body: "How's your progress going? Time to review your goals!",
      trigger: { 
        hour: 20, // 8 PM
        minute: 0,
        repeats: true
      }
    });
  };

  return {
    scheduleWeightCheckInReminder,
    scheduleGoalReminder
  };
}