import {
  PaywallPresentationHandler,
  default as Superwall,
} from '@superwall/react-native-superwall';
import { router } from 'expo-router';

import { useAddHabitStore } from '@/lib/stores/add_habit_store';

const SUPERWALL_PLACEMENTS = {
  ONBOARDING_LOGIN: 'onboarding_login',
  ONBOARDING_NOTIFICATIONS: 'onboarding_notifications',
  ACHIEVEMENTS_VIEW: 'achievements_view',
  STATS_VIEW: 'stats_view',
  ADD_HABIT_LIMIT: 'add_habit_limit',
} as const;

type AppPaywallOptions = {
  handler?: PaywallPresentationHandler;
  route?: boolean;
};

export function showHabitSuperwall(options: AppPaywallOptions = {}) {
  Superwall.shared.register({
    placement: SUPERWALL_PLACEMENTS.ADD_HABIT_LIMIT,
    handler: options.handler,
    feature: () => {
      useAddHabitStore.getState().setEntryPoint('paywall_unlock');
      router.push('/add-habit');
    },
  });
}

export function showStatsSuperwall(options: AppPaywallOptions = {}) {
  Superwall.shared.register({
    placement: SUPERWALL_PLACEMENTS.STATS_VIEW,
    handler: options.handler,
    feature: () => {
      if (options.route) {
        router.push('/stats');
      }
    },
  });
}

export function showAchievementsSuperwall(options: AppPaywallOptions = {}) {
  Superwall.shared.register({
    placement: SUPERWALL_PLACEMENTS.ACHIEVEMENTS_VIEW,
    handler: options.handler,
    feature: () => {
      if (options.route) {
        router.push('/achievements');
      }
    },
  });
}

export function showOnboardingLoginSuperwall(
  handler?: PaywallPresentationHandler
) {
  Superwall.shared.register({
    placement: SUPERWALL_PLACEMENTS.ONBOARDING_LOGIN,
    handler,
    feature: () => {
      router.push('/(tabs)');
    },
  });
}

export function showOnboardingNotificationsSuperwall(
  handler?: PaywallPresentationHandler
) {
  Superwall.shared.register({
    placement: SUPERWALL_PLACEMENTS.ONBOARDING_NOTIFICATIONS,
    handler,
    feature: () => {
      router.push('/(tabs)');
    },
  });
}
