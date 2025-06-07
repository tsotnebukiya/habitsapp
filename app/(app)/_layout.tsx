import useHabitsStore from '@/lib/habit-store/store';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { useReconcileWidgetState } from '@/lib/hooks/useReconcileWidgetState';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';
import useUserProfileStore from '@/lib/stores/user_profile';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Redirect, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

function StackLayout() {
  const { profile } = useUserProfileStore();
  const { completedAt } = useOnboardingStore();
  const [isInitializing, setIsInitializing] = useState(true);
  useNotifications();
  useReconcileWidgetState();

  useEffect(() => {
    async function initializeApp() {
      try {
        // Initial sync for habits if user is logged in
        if (profile?.id) {
          await Promise.all([useHabitsStore.getState().syncWithServer()]);
        }
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

  if (!profile) {
    if (completedAt) {
      return <Redirect href="/onboarding/login" />;
    } else {
      return <Redirect href="/onboarding/intro" />;
    }
  }

  return (
    <BottomSheetModalProvider>
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
        <Stack.Screen
          name="update-habit"
          options={{
            presentation: 'modal',
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="badges"
          options={{
            presentation: 'modal',
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            presentation: 'modal',
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </BottomSheetModalProvider>
  );
}

export default StackLayout;
