import { Redirect, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import useUserProfileStore from '@/lib/stores/user_profile';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useHabitsStore } from '@/lib/stores/habits_store';
import { useAchievementsStore } from '@/lib/stores/achievements_store';

function StackLayout() {
  const { profile } = useUserProfileStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function initializeApp() {
      try {
        // Initial sync for habits if user is logged in
        if (profile?.id) {
          await Promise.all([
            useHabitsStore.getState().syncWithServer(),
            useAchievementsStore.getState().syncWithServer(),
          ]);
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsInitializing(false);
      }
    }

    initializeApp();
  }, [profile?.id]); // Re-run when user logs in

  if (isInitializing) {
    return <View style={{ flex: 1 }} />;
  }

  if (!profile || !profile.onboardingComplete) {
    return <Redirect href="/onboarding/OnboardingIntro" />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-habit"
          options={{
            presentation: 'modal',
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

export default StackLayout;
