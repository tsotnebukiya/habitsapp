import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from '../../supabase/client';
import { dateUtils } from './dayjs';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register for push notifications
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // Check if we're running on a physical device
  const isDevice = !Platform.select({
    ios: Constants.isDevice === false,
    android: Constants.isDevice === false,
    default: true,
  });
  if (isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    // Project ID from app.json or app.config.js
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })
    ).data;
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

export async function savePushToken(userId: string, token: string) {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        push_token: token,
        updated_at: dateUtils.now().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error saving push token:', error);
  }
}

export async function removePushToken(userId: string) {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        push_token: null,
        updated_at: dateUtils.now().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error removing push token:', error);
  }
}

export async function getNotificationState(): Promise<boolean> {
  // Check system permissions
  const { status: permissionStatus } =
    await Notifications.getPermissionsAsync();
  const systemEnabled = permissionStatus === 'granted';

  // Check if we have a valid push token
  let hasValidToken = false;
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });
    hasValidToken = !!tokenData.data;
  } catch {
    hasValidToken = false;
  }

  // Notifications are enabled if we have both permission and token
  return systemEnabled && hasValidToken;
}
