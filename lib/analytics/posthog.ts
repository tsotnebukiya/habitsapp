import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

import { useAppStore } from '@/lib/stores/app_state';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';

export const ONBOARDING_FLAG_KEY = 'onboard_variant';
export const ONBOARDING_FLOW_VERSION = 'v1';
export const ONBOARDING_FLAG_TIMEOUT_MS = 1500;

export type OnboardingExperimentVariant =
  | 'control'
  | 'quick'
  | 'preview'
  | 'complete';

export type OnboardingFlowVariant =
  | 'standard'
  | 'quick'
  | 'preview'
  | 'complete';

type OnboardingAnalyticsParams = {
  sessionId: string;
  flowVariant: OnboardingFlowVariant;
  experimentVariant: OnboardingExperimentVariant;
  preferredLanguage?: string | null;
};

export function getAppAnalyticsProperties() {
  return {
    platform: Platform.OS,
    app_version: Application.nativeApplicationVersion ?? 'unknown',
    build_number: Application.nativeBuildVersion ?? 'unknown',
    app_env: getAppVariant(),
  };
}

export function getAppVariant() {
  const runtimeVariant = Constants.expoConfig?.extra?.appVariant;

  if (typeof runtimeVariant === 'string' && runtimeVariant.trim().length > 0) {
    return runtimeVariant.trim();
  }

  return __DEV__ ? 'development' : 'production';
}

export function getAppRelease() {
  const applicationId = Application.applicationId ?? 'unknown';
  const appVersion = Application.nativeApplicationVersion ?? 'unknown';
  const buildNumber = Application.nativeBuildVersion ?? 'unknown';

  return `${applicationId}@${appVersion}+${buildNumber}`;
}

export function getAppDist() {
  return Application.nativeBuildVersion ?? 'unknown';
}

export function createOnboardingSessionId() {
  return uuidv4();
}

export function resolveOnboardingVariant(flagValue: unknown): {
  experimentVariant: OnboardingExperimentVariant;
  flowVariant: OnboardingFlowVariant;
} | null {
  switch (flagValue) {
    case 'control':
    case 'standard':
      return {
        experimentVariant: 'control',
        flowVariant: 'standard',
      };
    case 'quick':
      return {
        experimentVariant: 'quick',
        flowVariant: 'quick',
      };
    case 'preview':
      return {
        experimentVariant: 'preview',
        flowVariant: 'preview',
      };
    case 'complete':
      return {
        experimentVariant: 'complete',
        flowVariant: 'complete',
      };
    default:
      return null;
  }
}

export function buildOnboardingAnalyticsProperties({
  sessionId,
  flowVariant,
  experimentVariant,
  preferredLanguage,
}: OnboardingAnalyticsParams) {
  return {
    ...getAppAnalyticsProperties(),
    onboarding_session_id: sessionId,
    onboarding_variant: flowVariant,
    experiment_variant: experimentVariant,
    onboarding_flow_version: ONBOARDING_FLOW_VERSION,
    ...(preferredLanguage ? { preferred_language: preferredLanguage } : {}),
  };
}

export function getCurrentOnboardingAnalyticsProperties() {
  const onboardingState = useOnboardingStore.getState();
  const preferredLanguage = useAppStore.getState().currentLanguage;

  if (
    !onboardingState.sessionId ||
    !onboardingState.variant ||
    !onboardingState.experimentVariant
  ) {
    return null;
  }

  return buildOnboardingAnalyticsProperties({
    sessionId: onboardingState.sessionId,
    flowVariant: onboardingState.variant as OnboardingFlowVariant,
    experimentVariant:
      onboardingState.experimentVariant as OnboardingExperimentVariant,
    preferredLanguage,
  });
}
