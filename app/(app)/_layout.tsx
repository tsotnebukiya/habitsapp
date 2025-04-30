import { Redirect, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import useUserProfileStore from '@/lib/stores/user_profile';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import useHabitsStore from '@/habits-store/store';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { useReconcileWidgetState } from '@/lib/hooks/useReconcileWidgetState';

function StackLayout() {
  const { profile } = useUserProfileStore();
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
        </Stack>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

export default StackLayout;
