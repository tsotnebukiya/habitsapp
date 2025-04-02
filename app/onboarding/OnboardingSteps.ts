// app/onboarding/OnboardingSteps.ts
import { Href } from "expo-router";

// app/onboarding/OnboardingSteps.ts
export const ONBOARDING_STEPS: Href<string>[] = [
    '/onboarding/OnboardingIntro',
    '/onboarding/OnboardingSignUp',
    '/onboarding/OnboardingNotifications',
    '/onboarding/OnboardingTrialTimeline',
    '/(tabs)',
];