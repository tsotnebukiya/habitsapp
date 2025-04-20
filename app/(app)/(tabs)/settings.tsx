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
import { supabase } from '@/lib/utils/supabase';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { useAppStore } from '@/lib/stores/app_state';

const SettingsScreen = () => {
  const router = useRouter();
  const { clearProfile } = useUserProfileStore();
  const { toggleNotifications } = useNotifications();
  const notificationsEnabled = useAppStore(
    (state) => state.notificationsEnabled
  );

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
