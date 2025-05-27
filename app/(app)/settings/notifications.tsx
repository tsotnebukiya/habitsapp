import { colors, fontWeights } from '@/lib/constants/ui';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useAppStore } from '@/lib/stores/app_state';
import useUserProfileStore from '@/lib/stores/user_profile';
import { router } from 'expo-router';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
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
  const { toggleNotifications } = useNotifications();
  console.log(notificationsEnabled);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerSpacing} />

        <Text style={styles.heading}>Notifications</Text>
        <TouchableOpacity
          onPress={handleClose}
          activeOpacity={0.1}
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
        <Text style={styles.text}>{t('settings.notifications')}</Text>
        <Switch
          value={notificationsEnabled ?? false}
          onValueChange={toggleNotifications}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.text}>{t('notifications.dailyUpdate')}</Text>
        <Switch
          value={profile?.allow_daily_update_notifications ?? false}
          onValueChange={setDailyUpdateNotificationsEnabled}
        />
      </View>
      <View style={styles.row}>
        <Text style={styles.text}>{t('notifications.streak')}</Text>
        <Switch
          value={profile?.allow_streak_notifications ?? false}
          onValueChange={setStreakNotificationsEnabled}
        />
      </View>
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
    paddingVertical: 14,
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
  },
});
