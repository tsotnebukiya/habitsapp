import { ACTIVE_OPACITY } from '@/components/shared/config';
import {
  createAppPaywallHandler,
  trackPremiumFeatureAccessAttempted,
} from '@/lib/analytics/superwall';
import { colors, fontWeights } from '@/lib/constants/ui';
import { useAllHabits } from '@/lib/hooks/useHabits';
import { useSubscriptionStatus } from '@/lib/hooks/useSubscriptionStatus';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useAddHabitStore } from '@/lib/stores/add_habit_store';
import {
  showAchievementsSuperwall,
  showHabitSuperwall,
  showStatsSuperwall,
} from '@/lib/utils/superwall';

import { router, Tabs } from 'expo-router';
import React from 'react';
import { usePostHog } from 'posthog-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabBarIcon(props: { source: any; focused: boolean }) {
  return (
    <View>
      <Icon
        size={24}
        source={props.source}
        color={props.focused ? colors.primary : colors.tabBarGrey}
      />
    </View>
  );
}

function TabBarLabel(props: { children: React.ReactNode; focused: boolean }) {
  return (
    <Text
      style={[
        styles.tabBarLabel,
        props.focused ? styles.tabBarLabelFocused : styles.tabBarLabelUnfocused,
      ]}
    >
      {props.children}
    </Text>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const habits = useAllHabits();
  const { subscriptionStatus } = useSubscriptionStatus();
  const posthog = usePostHog();
  const setEntryPoint = useAddHabitStore((state) => state.setEntryPoint);

  const capture = React.useCallback(
    (event: string, properties?: Record<string, any>) => {
      posthog.capture(event, properties);
    },
    [posthog]
  );

  const currentHabitCount = habits.length;

  const handleStatsTabPress = React.useCallback(() => {
    const paywallContext = {
      placement: 'stats_view',
      entrypoint: 'tab_bar',
      current_habit_count: currentHabitCount,
      subscription_status: subscriptionStatus.status,
      feature_name: 'stats',
      interaction_surface: 'tab_bar',
    } as const;

    trackPremiumFeatureAccessAttempted(capture, paywallContext);
    showStatsSuperwall({
      route: true,
      handler: createAppPaywallHandler(paywallContext, capture),
    });
  }, [capture, currentHabitCount, subscriptionStatus.status]);

  const handleAchievementsTabPress = React.useCallback(() => {
    const paywallContext = {
      placement: 'achievements_view',
      entrypoint: 'tab_bar',
      current_habit_count: currentHabitCount,
      subscription_status: subscriptionStatus.status,
      feature_name: 'achievements',
      interaction_surface: 'tab_bar',
    } as const;

    trackPremiumFeatureAccessAttempted(capture, paywallContext);
    showAchievementsSuperwall({
      route: true,
      handler: createAppPaywallHandler(paywallContext, capture),
    });
  }, [capture, currentHabitCount, subscriptionStatus.status]);

  const handleAddHabit = () => {
    if (habits.length >= 1) {
      const paywallContext = {
        placement: 'add_habit_limit',
        entrypoint: 'tab_fab',
        current_habit_count: currentHabitCount,
        subscription_status: subscriptionStatus.status,
        feature_name: 'additional_habits',
        interaction_surface: 'floating_action_button',
      } as const;

      trackPremiumFeatureAccessAttempted(capture, paywallContext);
      showHabitSuperwall({
        handler: createAppPaywallHandler(paywallContext, capture),
      });
    } else {
      setEntryPoint('tab_fab');
      router.push('/add-habit');
    }
  };
  return (
    <>
      <Tabs
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t('navigation.habits'),
            headerShown: false,
            tabBarItemStyle: {
              marginLeft: 20,
            },

            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                source={require('@/assets/icons/home-smile.png')}
                focused={focused}
              />
            ),
            tabBarLabel: ({ focused }) => (
              <TabBarLabel focused={focused}>
                {t('navigation.habits')}
              </TabBarLabel>
            ),
          }}
        />
        <Tabs.Screen
          name="stats"
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              handleStatsTabPress();
            },
          }}
          options={{
            title: t('navigation.stats'),
            headerShown: false,
            tabBarItemStyle: {
              marginRight: 40,
            },
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                source={require('@/assets/icons/bar-chart-10.png')}
                focused={focused}
              />
            ),
            tabBarLabel: ({ focused }) => (
              <TabBarLabel focused={focused}>
                {t('navigation.stats')}
              </TabBarLabel>
            ),
          }}
        />
        <Tabs.Screen
          name="achievements"
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              handleAchievementsTabPress();
            },
          }}
          options={{
            title: t('navigation.achievements'),
            headerShown: false,
            tabBarItemStyle: {
              marginLeft: 40,
            },
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                source={require('@/assets/icons/award-05.png')}
                focused={focused}
              />
            ),
            tabBarLabel: ({ focused }) => (
              <TabBarLabel focused={focused}>
                {t('navigation.achievements')}
              </TabBarLabel>
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: t('navigation.settings'),
            headerShown: false,
            tabBarItemStyle: {
              marginRight: 20,
            },
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                source={require('@/assets/icons/user-01.png')}
                focused={focused}
              />
            ),
            tabBarLabel: ({ focused }) => (
              <TabBarLabel focused={focused}>
                {t('navigation.settings')}
              </TabBarLabel>
            ),
          }}
        />
      </Tabs>
      <TouchableOpacity
        style={[styles.addButton, { bottom: insets.bottom + 3 }]}
        onPress={handleAddHabit}
        activeOpacity={ACTIVE_OPACITY}
      >
        <Icon size={24} source={require('@/assets/icons/plus.png')} />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 0,
  },
  tabBarIcon: {
    // marginTop: 5,
  },
  tabBarLabel: {
    fontSize: 12,
  },
  tabBarLabelFocused: {
    color: colors.primary,
    fontFamily: fontWeights.interBold,
  },
  tabBarLabelUnfocused: {
    color: colors.tabBarGrey,
    fontFamily: fontWeights.interSemiBold,
  },
  addButton: {
    position: 'absolute',
    zIndex: 1,
    left: '50%',
    transform: [{ translateX: -30 }],
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
