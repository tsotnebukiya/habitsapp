// app/onboarding/_layout.tsx
import { SplashScreen, Stack } from "expo-router";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack initialRouteName="OnboardingSignUp">
                <Stack.Screen name="OnboardingIntro" options={{ headerShown: false }} />
                <Stack.Screen name="OnboardingSignUp" options={{ headerShown: false }} />
                <Stack.Screen name="OnboardingNotifications" options={{ headerShown: false }} />
                <Stack.Screen name="OnboardingEmailSignupModal" options={{ headerShown: false, presentation: 'modal' }} />
                <Stack.Screen name="OnboardingTrialTimeline" options={{ headerShown: false }} />
                <Stack.Screen name="PaymentPlansModal" options={{ headerShown: false, presentation: 'modal' }} />
            </Stack>
        </GestureHandlerRootView>
    );

};

export default RootLayout;
