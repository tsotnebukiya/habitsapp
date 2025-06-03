// app/onboarding/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

function OnboardingLayout() {
  return (
    <Stack initialRouteName="OnboardingIntro">
      <Stack.Screen name="OnboardingIntro" options={{ headerShown: false }} />
      <Stack.Screen name="OnboardingLogin" options={{ headerShown: false }} />
    </Stack>
  );
}

export default OnboardingLayout;
