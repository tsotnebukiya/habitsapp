import { getCurrentOnboardingAnalyticsProperties } from '@/lib/analytics/posthog';
import {
  clearPaywallAttributionContext,
  consumePaywallAttributionProperties,
} from '@/lib/analytics/paywallAttribution';
import { useSubscriptionStatus } from '@/lib/hooks/useSubscriptionStatus';
import { useUserProfileStore } from '@/lib/stores/user_profile';
import { usePostHog } from 'posthog-react-native';
import { useEffect, useRef } from 'react';

function getSubscriptionProperties(
  subscriptionStatus: ReturnType<typeof useSubscriptionStatus>['subscriptionStatus']
) {
  return {
    subscription_status: subscriptionStatus.status,
    entitlements:
      subscriptionStatus.status === 'ACTIVE'
        ? subscriptionStatus.entitlements.map((entitlement) => entitlement.id)
        : [],
    entitlement_types:
      subscriptionStatus.status === 'ACTIVE'
        ? subscriptionStatus.entitlements.map((entitlement) => entitlement.type)
        : [],
  };
}

export function useTrackSubscriptionAnalytics() {
  const posthog = usePostHog();
  const { subscriptionStatus } = useSubscriptionStatus();
  const profile = useUserProfileStore((state) => state.profile);
  const previousStatusRef = useRef<string | null>(null);
  const previousProfileIdRef = useRef<string | null>(profile?.id ?? null);

  useEffect(() => {
    const currentProfileId = profile?.id ?? null;

    if (previousProfileIdRef.current !== currentProfileId) {
      previousProfileIdRef.current = currentProfileId;
      previousStatusRef.current = null;
      clearPaywallAttributionContext();
    }
  }, [profile?.id]);

  useEffect(() => {
    if (subscriptionStatus.status === 'UNKNOWN') {
      previousStatusRef.current = null;
      clearPaywallAttributionContext();
      return;
    }

    if (profile?.id) {
      posthog.identify(profile.id, {
        subscription_status: subscriptionStatus.status,
        has_active_subscription: subscriptionStatus.status === 'ACTIVE',
      });
    }

    const previousStatus = previousStatusRef.current;

    if (!previousStatus) {
      previousStatusRef.current = subscriptionStatus.status;
      return;
    }

    if (previousStatus === subscriptionStatus.status) {
      return;
    }

    const properties = {
      previous_subscription_status: previousStatus,
      ...getSubscriptionProperties(subscriptionStatus),
      ...(getCurrentOnboardingAnalyticsProperties() ?? {}),
    };

    posthog.capture('subscription_status_changed', properties);

    if (subscriptionStatus.status === 'ACTIVE') {
      posthog.capture('subscription_activated', {
        ...properties,
        ...(consumePaywallAttributionProperties() ?? {}),
      });
    }

    if (previousStatus === 'ACTIVE') {
      posthog.capture('subscription_deactivated', properties);
    }

    previousStatusRef.current = subscriptionStatus.status;
  }, [posthog, profile?.id, subscriptionStatus]);
}
