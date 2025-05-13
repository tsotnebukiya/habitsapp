// app/onboarding/_layout.tsx
import { SplashScreen, Stack } from 'expo-router';
import React from 'react';

SplashScreen.preventAutoHideAsync();

function RootLayout() {
  return (
    <Stack initialRouteName="OnboardingSignUp">
      <Stack.Screen name="OnboardingIntro" options={{ headerShown: false }} />
      <Stack.Screen name="OnboardingSignUp" options={{ headerShown: false }} />
    </Stack>
  );
}

export default RootLayout;
