import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFeatureFlag, usePostHog } from 'posthog-react-native';

import {
  ONBOARDING_FLAG_KEY,
  ONBOARDING_FLAG_TIMEOUT_MS,
  buildOnboardingAnalyticsProperties,
  createOnboardingSessionId,
  resolveOnboardingVariant,
  type OnboardingExperimentVariant,
  type OnboardingFlowVariant,
} from '@/lib/analytics/posthog';
import { useAppStore } from '@/lib/stores/app_state';
import { useOnboardingStore } from '@/lib/stores/onboardingStore';

export function useOnboardingAnalytics() {
  const posthog = usePostHog();
  const currentLanguage = useAppStore((state) => state.currentLanguage);
  const {
    variant,
    experimentVariant,
    sessionId,
    exposureTrackedAt,
    setVariant,
    setExperimentVariant,
    setSessionId,
    markExposureTracked,
  } = useOnboardingStore();
  const rawFlagValue = useFeatureFlag(ONBOARDING_FLAG_KEY);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    if (variant && experimentVariant) {
      return;
    }

    if (resolveOnboardingVariant(rawFlagValue)) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setHasTimedOut(true);
    }, ONBOARDING_FLAG_TIMEOUT_MS);

    return () => clearTimeout(timeoutId);
  }, [experimentVariant, rawFlagValue, variant]);

  const resolvedContext = useMemo(() => {
    if (variant && experimentVariant) {
      return {
        flowVariant: variant as OnboardingFlowVariant,
        experimentVariant: experimentVariant as OnboardingExperimentVariant,
        source: 'store' as const,
      };
    }

    const resolvedFromFlag = resolveOnboardingVariant(rawFlagValue);

    if (resolvedFromFlag) {
      return {
        ...resolvedFromFlag,
        source: 'flag' as const,
      };
    }

    if (hasTimedOut) {
      return {
        flowVariant: 'standard' as const,
        experimentVariant: 'control' as const,
        source: 'fallback' as const,
      };
    }

    return null;
  }, [experimentVariant, hasTimedOut, rawFlagValue, variant]);

  useEffect(() => {
    if (!resolvedContext) {
      return;
    }

    if (!sessionId) {
      setSessionId(createOnboardingSessionId());
    }

    if (variant !== resolvedContext.flowVariant) {
      setVariant(resolvedContext.flowVariant);
    }

    if (experimentVariant !== resolvedContext.experimentVariant) {
      setExperimentVariant(resolvedContext.experimentVariant);
    }
  }, [
    experimentVariant,
    resolvedContext,
    sessionId,
    setExperimentVariant,
    setSessionId,
    setVariant,
    variant,
  ]);

  const commonProperties = useMemo(() => {
    if (!sessionId || !variant || !experimentVariant) {
      return null;
    }

    return buildOnboardingAnalyticsProperties({
      sessionId,
      flowVariant: variant as OnboardingFlowVariant,
      experimentVariant: experimentVariant as OnboardingExperimentVariant,
      preferredLanguage: currentLanguage,
    });
  }, [currentLanguage, experimentVariant, sessionId, variant]);

  useEffect(() => {
    if (!commonProperties || exposureTrackedAt) {
      return;
    }

    posthog.capture('onboarding_variant_exposed', commonProperties);

    if (resolvedContext?.source === 'fallback') {
      posthog.capture('onboarding_variant_fallback_used', commonProperties);
    }

    markExposureTracked();
  }, [
    commonProperties,
    exposureTrackedAt,
    markExposureTracked,
    posthog,
    resolvedContext?.source,
  ]);

  const capture = useCallback(
    (event: string, properties: Record<string, unknown> = {}) => {
      if (!commonProperties) {
        return;
      }

      posthog.capture(event, {
        ...commonProperties,
        ...properties,
      });
    },
    [commonProperties, posthog]
  );

  const screen = useCallback(
    (name: string, properties: Record<string, unknown> = {}) => {
      posthog.screen(name, {
        ...(commonProperties ?? {}),
        ...properties,
      });
    },
    [commonProperties, posthog]
  );

  return {
    analyticsReady: !!commonProperties,
    flowVariant: variant as OnboardingFlowVariant | null,
    experimentVariant:
      experimentVariant as OnboardingExperimentVariant | null,
    sessionId,
    commonProperties,
    capture,
    screen,
  };
}
