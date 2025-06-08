import { Stack } from 'expo-router';
import React from 'react';

function OnboardingLayout() {
  return (
    <Stack initialRouteName="intro">
      <Stack.Screen name="intro" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="wizard" options={{ headerShown: false }} />
    </Stack>
  );
}

export default OnboardingLayout;
