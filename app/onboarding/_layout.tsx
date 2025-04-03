// app/onboarding/_layout.tsx
import { SplashScreen, Stack } from 'expo-router';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

SplashScreen.preventAutoHideAsync();

function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack initialRouteName="OnboardingSignUp">
        <Stack.Screen name="OnboardingIntro" options={{ headerShown: false }} />
        <Stack.Screen
          name="OnboardingSignUp"
          options={{ headerShown: false }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

export default RootLayout;
