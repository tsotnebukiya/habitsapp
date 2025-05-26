import LanguagePickerModal from '@/components/modals/LanguagePicker';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useAppStore } from '@/lib/stores/app_state';
import useUserProfileStore from '@/lib/stores/user_profile';
import { supabase } from '@/supabase/client';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SettingsScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const {
    clearProfile,
    setDailyUpdateNotificationsEnabled,
    setStreakNotificationsEnabled,
    profile,
  } = useUserProfileStore();
  const { toggleNotifications } = useNotifications();
  const { notificationsEnabled } = useAppStore((state) => state);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearProfile();
    router.replace('/onboarding/OnboardingIntro');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 17 }]}>
      <Text style={styles.title}>{t('settings.title')}</Text>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.row}
          onPress={() => setShowLanguagePicker(true)}
        >
          <Text style={styles.text}>{t('settings.language')}</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

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

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>{t('settings.logout')}</Text>
      </TouchableOpacity>

      <LanguagePickerModal
        visible={showLanguagePicker}
        onDismiss={() => setShowLanguagePicker(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  section: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  text: {
    fontSize: 16,
  },
  chevron: {
    fontSize: 18,
    color: '#999',
  },
  logoutButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: 'red',
    fontSize: 16,
  },
});

export default SettingsScreen;
