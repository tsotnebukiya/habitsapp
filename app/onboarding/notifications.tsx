// app/onboarding/notifications.tsx
import React, { useEffect, useState } from 'react';
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
import { createOnboardingPaywallHandler } from '@/lib/analytics/superwall';
import { colors, fontWeights } from '@/lib/constants/ui';
import { useOnboardingAnalytics } from '@/lib/hooks/useOnboardingAnalytics';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useAppStore } from '@/lib/stores/app_state';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';
import useUserProfileStore from '@/lib/stores/user_profile';
import {
  registerForPushNotificationsAsync,
  savePushToken,
} from '@/lib/utils/notifications';
import { showOnboardingNotificationsSuperwall } from '@/lib/utils/superwall';
import * as ExpoNotifications from 'expo-notifications';
import { usePostHog } from 'posthog-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function Notifications() {
  const inset = useSafeAreaInsets();
  const { t } = useTranslation();
  const { analyticsReady, capture, screen } = useOnboardingAnalytics();
  const setResumeRoute = useOnboardingStore((state) => state.setResumeRoute);

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

  const buildTogglePayload = (
    pushEnabled: boolean,
    dailyEnabled: boolean,
    streakEnabled: boolean
  ) => ({
    push_enabled: pushEnabled,
    daily_enabled: dailyEnabled,
    streak_enabled: streakEnabled,
  });

  const buildSetupPayload = (
    pushEnabled = pushNotificationsEnabled,
    dailyEnabled = dailyUpdatesEnabled,
    streakEnabled = streakRemindersEnabled
  ) => ({
    push_notifications_enabled: pushEnabled,
    daily_updates_enabled: dailyEnabled,
    streak_reminders_enabled: streakEnabled,
  });

  useEffect(() => {
    setResumeRoute('/onboarding/notifications');

    if (!analyticsReady) {
      return;
    }

    screen('onboarding_notifications');
    capture('notifications_screen_viewed', {
      default_push_enabled: true,
      default_daily_enabled: true,
      default_streak_enabled: true,
    });
  }, [analyticsReady, capture, screen, setResumeRoute]);

  const onPushNotificationsChange = (value: boolean) => {
    setPushNotificationsEnabled(value);
    setDailyUpdatesEnabled(value);
    setStreakRemindersEnabled(value);
    capture(
      'notification_toggle_changed',
      buildTogglePayload(value, value, value)
    );
  };

  const onDailyUpdatesChange = (value: boolean) => {
    setDailyUpdatesEnabled(value);
    capture(
      'notification_toggle_changed',
      buildTogglePayload(pushNotificationsEnabled, value, streakRemindersEnabled)
    );
  };

  const onStreakRemindersChange = (value: boolean) => {
    setStreakRemindersEnabled(value);
    capture(
      'notification_toggle_changed',
      buildTogglePayload(pushNotificationsEnabled, dailyUpdatesEnabled, value)
    );
  };

  const showPermissionDeniedAlert = () => {
    capture('notification_permission_denied_alert_shown', {
      permission_status: 'denied',
    });
    Alert.alert(
      t('notifications.permissionRequired'),
      t('notifications.permissionDeniedMessage'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
          onPress: () => {
            capture('notification_permission_alert_cancelled', {
              permission_status: 'denied',
            });
          },
        },
        {
          text: t('notifications.openSettings'),
          onPress: () => {
            capture('notification_permission_settings_opened', {
              permission_status: 'denied',
            });
            Linking.openSettings();
          },
        },
      ]
    );
  };

  const handleContinue = async () => {
    capture(
      'notifications_continue_pressed',
      buildSetupPayload()
    );
    setIsLoading(true);

    try {
      if (!pushNotificationsEnabled) {
        capture(
          'notifications_setup_completed',
          buildSetupPayload()
        );
        showOnboardingNotificationsSuperwall(
          createOnboardingPaywallHandler('onboarding_notifications', capture)
        );
        return;
      }

      if (pushNotificationsEnabled) {
        try {
          const { status: currentStatus } =
            await ExpoNotifications.getPermissionsAsync();
          capture('notification_permission_checked', {
            permission_status: currentStatus,
          });
          if (currentStatus === 'denied') {
            capture('notification_permission_result', {
              permission_status: 'denied',
              source: 'onboarding',
              ...buildSetupPayload(),
            });
            capture('notification_permission_previously_denied', {
              permission_status: currentStatus,
            });
            showPermissionDeniedAlert();
            return;
          } else {
            // Try to register for push notifications
            const token = await registerForPushNotificationsAsync();

            if (token) {
              capture('notification_permission_result', {
                permission_status: 'granted',
                source: 'onboarding',
                ...buildSetupPayload(),
              });
              capture('notification_permission_granted', {
                permission_status: 'granted',
              });
            } else {
              capture('notification_permission_result', {
                permission_status: 'not_granted',
                source: 'onboarding',
                ...buildSetupPayload(),
              });
              capture('notification_permission_failed', {
                permission_status: currentStatus,
              });
            }

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
          capture('notification_permission_result', {
            permission_status: 'error',
            source: 'onboarding',
            ...buildSetupPayload(),
          });
          capture('notification_permission_error', {
            permission_status: 'error',
          });
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
      capture(
        'notifications_setup_completed',
        buildSetupPayload()
      );
      showOnboardingNotificationsSuperwall(
        createOnboardingPaywallHandler('onboarding_notifications', capture)
      );
    } catch (error) {
      console.error('Error in handleContinue:', error);
      capture(
        'notifications_setup_error',
        buildSetupPayload()
      );
      // Even if there's an error, navigate to main app
      showOnboardingNotificationsSuperwall(
        createOnboardingPaywallHandler('onboarding_notifications', capture)
      );
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
              onValueChange={onDailyUpdatesChange}
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
              onValueChange={onStreakRemindersChange}
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
