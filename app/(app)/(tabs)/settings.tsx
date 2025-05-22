import { useNotifications } from '@/lib/hooks/useNotifications';
import { useAppStore } from '@/lib/stores/app_state';
import useUserProfileStore from '@/lib/stores/user_profile';
import { supabase } from '@/supabase/client';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SettingsScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.text}>Push Notifications</Text>
          <Switch
            value={notificationsEnabled ?? false}
            onValueChange={toggleNotifications}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.text}>Daily Update Notifications</Text>
          <Switch
            value={profile?.allow_daily_update_notifications ?? false}
            onValueChange={setDailyUpdateNotificationsEnabled}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.text}>Streak Notifications</Text>
          <Switch
            value={profile?.allow_streak_notifications ?? false}
            onValueChange={setStreakNotificationsEnabled}
          />
        </View>
      </View>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
