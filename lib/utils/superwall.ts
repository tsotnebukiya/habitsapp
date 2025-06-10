import Superwall from '@superwall/react-native-superwall';
import { router } from 'expo-router';

const SUPERWALL_PLACEMENTS = {
  ONBOARDING_LOGIN: 'onboarding_login',
  ONBOARDING_NOTIFICATIONS: 'onboarding_notifications',
  ACHIEVEMENTS_VIEW: 'achievements_view',
  STATS_VIEW: 'stats_view',
  ADD_HABIT_LIMIT: 'add_habit_limit',
} as const;

export function showHabitSuperwall() {
  Superwall.shared.register({
    placement: SUPERWALL_PLACEMENTS.ADD_HABIT_LIMIT,
    feature: () => {
      router.push('/add-habit');
    },
  });
}

export function showStatsSuperwall(route?: boolean) {
  Superwall.shared.register({
    placement: SUPERWALL_PLACEMENTS.STATS_VIEW,
    feature: () => {
      if (route) {
        router.push('/stats');
      }
    },
  });
}

export function showAchievementsSuperwall(route?: boolean) {
  Superwall.shared.register({
    placement: SUPERWALL_PLACEMENTS.ACHIEVEMENTS_VIEW,
    feature: () => {
      if (route) {
        router.push('/achievements');
      }
    },
  });
}

export function showOnboardingLoginSuperwall() {
  Superwall.shared.register({
    placement: SUPERWALL_PLACEMENTS.ONBOARDING_LOGIN,
    feature: () => {
      router.push('/(tabs)');
    },
  });
}

export function showOnboardingNotificationsSuperwall() {
  Superwall.shared.register({
    placement: SUPERWALL_PLACEMENTS.ONBOARDING_NOTIFICATIONS,
    feature: () => {
      router.push('/(tabs)');
    },
  });
}
