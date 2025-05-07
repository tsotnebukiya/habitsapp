import React from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  Switch,
  TouchableOpacity,
} from 'react-native';
import useUserProfileStore from '@/lib/stores/user_profile';
import { useRouter } from 'expo-router';
import { supabase } from '@/supabase/client';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { useAppStore } from '@/lib/stores/app_state';

const SettingsScreen = () => {
  const router = useRouter();
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
    <SafeAreaView style={styles.container}>
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
    </SafeAreaView>
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
