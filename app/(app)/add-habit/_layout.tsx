import {
  ACTIVE_OPACITY,
  ACTIVE_OPACITY_WHITE,
} from '@/components/shared/config';
import toastConfig from '@/components/shared/toastConfig';
import { colors, fontWeights } from '@/lib/constants/ui';
import { useAllHabits } from '@/lib/hooks/useHabits';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useAddHabitStore } from '@/lib/stores/add_habit_store';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { router, Stack, usePathname } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-paper';
import Toast from 'react-native-toast-message';

function getCurrentAddHabitStep(pathname: string) {
  switch (pathname) {
    case '/add-habit':
      return 'category';
    case '/add-habit/template-selection':
      return 'templates';
    case '/add-habit/create-habit':
      return 'create_habit';
    case '/add-habit/detail-choosing':
      return 'detail_choosing';
    default:
      return 'unknown';
  }
}

export default function AddHabitLayout() {
  const { t } = useTranslation();
  const resetForm = useAddHabitStore((state) => state.resetForm);
  const entrypoint = useAddHabitStore((state) => state.entrypoint);
  const flowStarted = useAddHabitStore((state) => state.flowStarted);
  const flowCompleted = useAddHabitStore((state) => state.flowCompleted);
  const selectedTemplate = useAddHabitStore((state) => state.selectedTemplate);
  const markFlowStarted = useAddHabitStore((state) => state.markFlowStarted);
  const habits = useAllHabits();
  const posthog = usePostHog();
  const pathname = usePathname();
  const backButton = pathname !== '/add-habit';
  const latestFlowStateRef = useRef({
    pathname,
    entrypoint,
    flowStarted,
    flowCompleted,
    currentHabitCount: habits.length,
    selectedTemplateId: selectedTemplate?.id ?? null,
  });

  latestFlowStateRef.current = {
    pathname,
    entrypoint,
    flowStarted,
    flowCompleted,
    currentHabitCount: habits.length,
    selectedTemplateId: selectedTemplate?.id ?? null,
  };

  const handleClose = () => {
    router.replace('/');
  };

  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    if (!entrypoint || flowStarted) {
      return;
    }

    posthog.capture('habit_creation_started', {
      entrypoint,
      current_habit_count: habits.length,
    });
    markFlowStarted();
  }, [entrypoint, flowStarted, habits.length, markFlowStarted, posthog]);

  useEffect(() => {
    return () => {
      const latestFlowState = latestFlowStateRef.current;

      if (latestFlowState.flowStarted && !latestFlowState.flowCompleted) {
        posthog.capture('habit_creation_cancelled', {
          entrypoint: latestFlowState.entrypoint,
          current_habit_count: latestFlowState.currentHabitCount,
          current_step: getCurrentAddHabitStep(latestFlowState.pathname),
          creation_mode: latestFlowState.selectedTemplateId ? 'template' : 'custom',
          template_id: latestFlowState.selectedTemplateId,
        });
      }

      resetForm();
    };
  }, [posthog, resetForm]);

  return (
    <BottomSheetModalProvider>
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          {backButton ? (
            <TouchableOpacity
              onPress={handleBack}
              activeOpacity={ACTIVE_OPACITY}
              style={styles.backButton}
            >
              <Icon
                source={require('@/assets/icons/chevron-left.png')}
                size={18}
                color="black"
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerSpacing} />
          )}

          <Text style={styles.heading}>{t('habits.addNewHabit')}</Text>
          <TouchableOpacity
            onPress={handleClose}
            activeOpacity={ACTIVE_OPACITY_WHITE}
            style={styles.closeButton}
          >
            <Icon
              source={require('@/assets/icons/x-close.png')}
              size={24}
              color="black"
            />
          </TouchableOpacity>
        </View>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="template-selection"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="create-habit"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="detail-choosing"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
        <Toast config={toastConfig} />
      </View>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    // padding: 18,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  headerSpacing: {
    width: 34,
  },
  closeButton: {
    backgroundColor: 'white',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
  },
  heading: {
    fontSize: 14,
    fontFamily: fontWeights.semibold,
    textAlign: 'center',
    color: colors.text,
  },
  backButton: {
    backgroundColor: 'white',
    borderRadius: 100,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
