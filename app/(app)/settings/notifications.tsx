import { ACTIVE_OPACITY_WHITE } from '@/components/shared/config';
import { colors, fontWeights } from '@/lib/constants/ui';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useAppStore } from '@/lib/stores/app_state';
import useUserProfileStore from '@/lib/stores/user_profile';
import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Icon } from 'react-native-paper';

export default function NotificationsScreen() {
  const { t } = useTranslation();

  const handleClose = () => {
    router.back();
  };
  const profile = useUserProfileStore((state) => state.profile);
  const setDailyUpdateNotificationsEnabled = useUserProfileStore(
    (state) => state.setDailyUpdateNotificationsEnabled
  );
  const setStreakNotificationsEnabled = useUserProfileStore(
    (state) => state.setStreakNotificationsEnabled
  );
  const notificationsEnabled = useAppStore(
    (state) => state.notificationsEnabled
  );
  const { toggleNotifications, isLoading } = useNotifications();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerSpacing} />

        <Text style={styles.heading}>{t('settings.notificationSettings')}</Text>
        <TouchableOpacity
          onPress={handleClose}
          activeOpacity={ACTIVE_OPACITY_WHITE}
          style={styles.closeButton}
        >
          <Icon
            source={require('@/assets/icons/x-close.png')}
            size={24}
            color="black"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <View style={styles.textContainer}>
          <Text style={styles.text}>{t('settings.enableNotifications')}</Text>
          <Text style={styles.description}>
            {t('notifications.allowPushNotifications')}
          </Text>
        </View>
        <View style={styles.switchContainer}>
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Switch
              value={notificationsEnabled ?? false}
              onValueChange={toggleNotifications}
              disabled={isLoading}
            />
          )}
        </View>
      </View>

      {/* Only show specific notification types if global notifications are enabled */}
      {notificationsEnabled && (
        <>
          <View style={styles.row}>
            <View style={styles.textContainer}>
              <Text style={styles.text}>{t('notifications.dailyUpdate')}</Text>
              <Text style={styles.description}>
                {t('notifications.dailyProgressSummary')}
              </Text>
            </View>
            <Switch
              value={profile?.allow_daily_update_notifications ?? false}
              onValueChange={setDailyUpdateNotificationsEnabled}
            />
          </View>

          <View style={styles.row}>
            <View style={styles.textContainer}>
              <Text style={styles.text}>{t('notifications.streak')}</Text>
              <Text style={styles.description}>
                {t('notifications.streakNotifications')}
              </Text>
            </View>
            <Switch
              value={profile?.allow_streak_notifications ?? false}
              onValueChange={setStreakNotificationsEnabled}
            />
          </View>
        </>
      )}

      {/* Show message when notifications are disabled */}
      {!notificationsEnabled && (
        <View style={styles.disabledContainer}>
          <Text style={styles.disabledText}>
            {t('notifications.enableToConfigureMessage')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 18,
    marginBottom: 20,
  },
  headerSpacing: {
    width: 34,
  },
  closeButton: {
    backgroundColor: 'white',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
  },
  heading: {
    fontSize: 14,
    fontFamily: fontWeights.semibold,
    textAlign: 'center',
    color: colors.text,
  },
  item: {
    backgroundColor: 'white',
    paddingHorizontal: 19,
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...colors.dropShadow,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 19,
    borderRadius: 16,
    ...colors.dropShadow,
    backgroundColor: 'white',
    marginBottom: 20,
  },
  text: {
    fontSize: 12,
    fontFamily: fontWeights.medium,
    color: colors.text,
    marginBottom: 2,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  description: {
    fontSize: 10,
    fontFamily: fontWeights.regular,
    color: colors.textLight,
    opacity: 0.8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 50,
    justifyContent: 'flex-end',
  },
  disabledContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 19,
    marginTop: 20,
    ...colors.dropShadow,
    alignItems: 'center',
  },
  disabledText: {
    fontSize: 12,
    fontFamily: fontWeights.medium,
    color: colors.textLight,
    textAlign: 'center',
    opacity: 0.8,
  },
});
