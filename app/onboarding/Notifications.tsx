// app/onboarding/Notifications.tsx
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import Button from '@/components/shared/Button';
import { colors, fontWeights } from '@/lib/constants/ui';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useAppStore } from '@/lib/stores/app_state';
import useUserProfileStore from '@/lib/stores/user_profile';
import {
  registerForPushNotificationsAsync,
  savePushToken,
} from '@/lib/utils/notifications';
import * as ExpoNotifications from 'expo-notifications';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function Notifications() {
  const inset = useSafeAreaInsets();
  const { t } = useTranslation();
  const router = useRouter();

  // Local state for the three notification toggles (all default to true)
  const [pushNotificationsEnabled, setPushNotificationsEnabled] =
    useState(true);
  const [dailyUpdatesEnabled, setDailyUpdatesEnabled] = useState(true);
  const [streakRemindersEnabled, setStreakRemindersEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Store hooks
  const { setNotificationsEnabled } = useAppStore();
  const {
    setDailyUpdateNotificationsEnabled,
    setStreakNotificationsEnabled,
    profile,
  } = useUserProfileStore();

  const onPushNotificationsChange = (value: boolean) => {
    setPushNotificationsEnabled(value);
    setDailyUpdatesEnabled(value);
    setStreakRemindersEnabled(value);
  };

  const showPermissionDeniedAlert = () => {
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
  };

  const handleContinue = async () => {
    setIsLoading(true);

    try {
      if (!pushNotificationsEnabled) {
        router.replace('/(tabs)');
        return;
      }

      if (pushNotificationsEnabled) {
        try {
          const { status: currentStatus } =
            await ExpoNotifications.getPermissionsAsync();
          if (currentStatus === 'denied') {
            showPermissionDeniedAlert();
            return;
          } else {
            // Try to register for push notifications
            const token = await registerForPushNotificationsAsync();

            if (token && profile?.id) {
              // Permission granted - save token and enable global notifications
              await savePushToken(profile.id, token);
              setNotificationsEnabled(true);
            } else {
              // Permission denied or failed - still enable local notifications
              setNotificationsEnabled(false);
            }
          }
        } catch (error) {
          console.error('Error requesting notification permission:', error);
          // Even if permission fails, we still enable local notifications
          setNotificationsEnabled(false);
        }
      }

      // Enable specific notification types based on user preferences
      if (dailyUpdatesEnabled) {
        setDailyUpdateNotificationsEnabled(true);
      }

      if (streakRemindersEnabled) {
        setStreakNotificationsEnabled(true);
      }

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error in handleContinue:', error);
      // Even if there's an error, navigate to main app
      router.replace('/(tabs)');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('@/assets/onboarding/gradient.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: inset.top + 20, paddingBottom: inset.bottom + 20 },
        ]}
      >
        <View>
          <View style={styles.notificationIconContainer}>
            <Image source={require('@/assets/icons/bell-03.png')} />
          </View>
          <Text style={styles.title}>
            {t('onboarding.smartRemindersTitle')}
          </Text>

          {/* Push Notifications Toggle */}
          <View style={styles.notificationDescriptionContainer}>
            <View style={styles.textBox}>
              <Text style={styles.textBoxTitle}>
                {t('settings.enableNotifications')}
              </Text>
              <Text style={styles.textBoxDescription}>
                {t('notifications.allowPushNotifications')}
              </Text>
            </View>
            <Switch
              value={pushNotificationsEnabled}
              onValueChange={onPushNotificationsChange}
              disabled={isLoading}
            />
          </View>

          {/* Daily Updates Toggle */}
          <View style={styles.notificationDescriptionContainer}>
            <View style={styles.textBox}>
              <Text style={styles.textBoxTitle}>
                {t('notifications.dailyUpdate')}
              </Text>
              <Text style={styles.textBoxDescription}>
                {t('notifications.dailyProgressSummary')}
              </Text>
            </View>
            <Switch
              value={dailyUpdatesEnabled}
              onValueChange={setDailyUpdatesEnabled}
              disabled={isLoading}
            />
          </View>

          {/* Streak Notifications Toggle */}
          <View style={styles.notificationDescriptionContainer}>
            <View style={styles.textBox}>
              <Text style={styles.textBoxTitle}>
                {t('notifications.streak')}
              </Text>
              <Text style={styles.textBoxDescription}>
                {t('notifications.streakNotifications')}
              </Text>
            </View>
            <Switch
              value={streakRemindersEnabled}
              onValueChange={setStreakRemindersEnabled}
              disabled={isLoading}
            />
          </View>

          <View style={styles.spacer} />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            label={isLoading ? '' : t('common.continue')}
            onPress={handleContinue}
            type="primary"
            disabled={isLoading}
          />
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="white" />
            </View>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  notificationIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 22,
    borderColor: 'rgba(42, 52, 71, 0.23)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 23,
    alignSelf: 'center',
  },
  title: {
    fontFamily: fontWeights.regular,
    fontSize: 26,
    color: colors.text,
    marginBottom: 65,
    textAlign: 'center',
  },
  titleBold: {
    fontFamily: fontWeights.bold,
  },
  notificationDescriptionContainer: {
    marginBottom: 10,
    ...colors.dropShadow,
    borderRadius: 16,
    padding: 18,
    backgroundColor: 'white',
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    width: '100%',
  },
  textBox: {
    gap: 10,
    flex: 1,
  },
  textBoxTitle: {
    fontFamily: fontWeights.semibold,
    fontSize: 14,
    color: colors.text,
  },
  textBoxDescription: {
    fontSize: 11,
    fontFamily: fontWeights.regular,
    color: colors.text,
  },
  spacer: {
    flex: 1,
  },
  buttonContainer: {
    height: 54,
    position: 'relative',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Notifications;
