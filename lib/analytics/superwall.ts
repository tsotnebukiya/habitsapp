import {
  PaywallPresentationHandler,
  type PaywallInfo,
} from '@superwall/react-native-superwall';

import {
  clearPaywallAttributionContext,
  setPaywallAttributionContext,
} from '@/lib/analytics/paywallAttribution';

type CaptureFn = (event: string, properties?: Record<string, any>) => void;

type PaywallResult =
  | {
      type: 'purchased';
      productId: string;
    }
  | {
      type: 'declined';
    }
  | {
      type: 'restored';
    };

export type AppPaywallAnalyticsContext = {
  placement: string;
  entrypoint: string;
  current_habit_count?: number;
  subscription_status?: string;
  feature_name?: string;
  interaction_surface?: string;
};

function buildPaywallProperties(
  placement: string,
  info?: PaywallInfo,
  extra: Record<string, unknown> = {}
) {
  return {
    placement,
    ...(info
      ? {
          paywall_identifier: info.identifier,
          paywall_name: info.name,
          paywall_presented_by: info.presentedBy,
          paywall_presented_event_name: info.presentedByEventWithName,
          paywall_experiment_id: info.experiment?.id,
          paywall_variant_id: info.experiment?.variant.id,
          paywall_variant_type: info.experiment?.variant.type,
        }
      : {}),
    ...extra,
  };
}

function buildAppPaywallProperties(
  context: AppPaywallAnalyticsContext,
  info?: PaywallInfo,
  extra: Record<string, unknown> = {}
) {
  return buildPaywallProperties(context.placement, info, {
    entrypoint: context.entrypoint,
    current_habit_count: context.current_habit_count,
    subscription_status: context.subscription_status,
    feature_name: context.feature_name,
    interaction_surface: context.interaction_surface,
    ...extra,
  });
}

function handlePaywallAttributionPresent(
  placement: string,
  info?: PaywallInfo,
  entrypoint?: string
) {
  setPaywallAttributionContext({
    placement,
    paywallVariantId: info?.experiment?.variant.id ?? null,
    entrypoint: entrypoint ?? null,
  });
}

function shouldClearPaywallAttribution(result?: PaywallResult) {
  if (!result) {
    return true;
  }

  return result.type === 'declined';
}

export function createOnboardingPaywallHandler(
  placement: string,
  capture: CaptureFn,
  entrypoint = placement
) {
  const handler = new PaywallPresentationHandler();

  handler.onPresent((info) => {
    handlePaywallAttributionPresent(placement, info, entrypoint);
    capture(
      'onboarding_paywall_presented',
      buildPaywallProperties(placement, info, {
        entrypoint,
      })
    );
  });

  handler.onDismiss((info: PaywallInfo, result: PaywallResult) => {
    if (shouldClearPaywallAttribution(result)) {
      clearPaywallAttributionContext();
    }

    capture(
      'onboarding_paywall_dismissed',
      buildPaywallProperties(placement, info, {
        entrypoint,
        paywall_result: result.type,
        ...(result.type === 'purchased'
          ? { product_id: result.productId }
          : {}),
      })
    );
  });

  handler.onSkip((reason) => {
    clearPaywallAttributionContext();
    capture(
      'onboarding_paywall_skipped',
      buildPaywallProperties(placement, undefined, {
        entrypoint,
        paywall_skip_reason: reason.name,
      })
    );
  });

  handler.onError((error) => {
    clearPaywallAttributionContext();
    capture(
      'onboarding_paywall_error',
      buildPaywallProperties(placement, undefined, {
        entrypoint,
        error_message: error,
      })
    );
  });

  return handler;
}

export function trackPremiumFeatureAccessAttempted(
  capture: CaptureFn,
  context: AppPaywallAnalyticsContext
) {
  capture('premium_feature_access_attempted', {
    placement: context.placement,
    entrypoint: context.entrypoint,
    current_habit_count: context.current_habit_count,
    subscription_status: context.subscription_status,
    feature_name: context.feature_name,
    interaction_surface: context.interaction_surface,
  });
}

export function createAppPaywallHandler(
  context: AppPaywallAnalyticsContext,
  capture: CaptureFn
) {
  const handler = new PaywallPresentationHandler();

  handler.onPresent((info) => {
    handlePaywallAttributionPresent(
      context.placement,
      info,
      context.entrypoint
    );
    capture('paywall_presented', buildAppPaywallProperties(context, info));
  });

  handler.onDismiss((info, result) => {
    if (shouldClearPaywallAttribution(result)) {
      clearPaywallAttributionContext();
    }

    capture(
      'paywall_dismissed',
      buildAppPaywallProperties(context, info, {
        paywall_result: result.type,
        ...(result.type === 'purchased'
          ? { product_id: result.productId }
          : {}),
      })
    );
  });

  handler.onSkip((reason) => {
    clearPaywallAttributionContext();
    capture(
      'paywall_skipped',
      buildAppPaywallProperties(context, undefined, {
        paywall_skip_reason: reason.name,
      })
    );
  });

  handler.onError((error) => {
    clearPaywallAttributionContext();
    capture(
      'paywall_error',
      buildAppPaywallProperties(context, undefined, {
        error_message: error,
      })
    );
  });

  return handler;
}
