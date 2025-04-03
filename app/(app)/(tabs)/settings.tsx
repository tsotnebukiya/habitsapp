import React, { useState } from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import useUserProfileStore from '@/lib/interfaces/user_profile';
import { useRouter } from 'expo-router';
import { supabase } from '@/app/supabase';

const SettingsScreen = () => {
  const router = useRouter();
  const { clearProfile } = useUserProfileStore();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearProfile();
    router.replace('/onboarding/OnboardingIntro');
  };
  return <SafeAreaView style={styles.container}></SafeAreaView>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SettingsScreen;
