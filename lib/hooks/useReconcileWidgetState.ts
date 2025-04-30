import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import useHabitsStore from '@/habits-store/store';
import { widgetStorage } from '@/habits-store/widget-storage';
import { dateUtils } from '@/lib/utils/dayjs';
import { normalizeDate } from '@/lib/utils/habits';

const RECONCILIATION_DEBOUNCE = 1000; // 1 second

export const useReconcileWidgetState = () => {
  const toggleHabitStatus = useHabitsStore((state) => state.toggleHabitStatus);
  const appState = useRef(AppState.currentState);
  const lastReconcileTime = useRef<Date | null>(null);
  const isReconciling = useRef(false);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async (nextAppState: AppStateStatus) => {
        // Only reconcile when app comes to foreground from background
        if (appState.current === 'background' && nextAppState === 'active') {
          try {
            // Prevent multiple reconciliations in quick succession
            const now = new Date();
            if (
              lastReconcileTime.current &&
              now.getTime() - lastReconcileTime.current.getTime() <
                RECONCILIATION_DEBOUNCE
            ) {
              console.log(
                'Skipping reconciliation - too soon since last attempt'
              );
              return;
            }

            // Prevent concurrent reconciliations
            if (isReconciling.current) {
              console.log('Skipping reconciliation - already in progress');
              return;
            }

            isReconciling.current = true;
            lastReconcileTime.current = now;

            console.log('Starting widget state reconciliation');

            // Get widget data from UserDefaults
            const widgetDataStr = await widgetStorage.getItem('habits');
            console.log('Widget data:', widgetDataStr);
            if (!widgetDataStr) {
              console.log('No widget data found during reconciliation');
              return;
            }

            const widgetData = JSON.parse(widgetDataStr);
            if (!Array.isArray(widgetData)) {
              console.warn('Widget data is not an array:', widgetData);
              return;
            }

            // Get today's normalized date key
            const today = dateUtils.nowUTC().startOf('day').toDate();
            const todayKey = today.toISOString();

            // Process each habit from widget data
            for (const widgetHabit of widgetData) {
              const { id, weeklyStatus } = widgetHabit;
              if (!id || !weeklyStatus || typeof weeklyStatus !== 'object') {
                console.warn('Invalid habit data in widget:', widgetHabit);
                continue;
              }

              // Get widget status for today (defaults to false if undefined)
              const widgetStatusIsCompleted = weeklyStatus[todayKey] === true;

              // Check current state in store
              const currentStoreStatus = useHabitsStore
                .getState()
                .getHabitStatus(id, today);
              const currentStoreIsCompleted =
                currentStoreStatus?.status === 'completed';
              const habit = useHabitsStore.getState().habits.get(id);

              // Sync if habit exists in store and widget status differs from store status
              if (
                habit &&
                widgetStatusIsCompleted !== currentStoreIsCompleted
              ) {
                console.log(
                  `Syncing widget status (${
                    widgetStatusIsCompleted ? 'completed' : 'not completed'
                  }) for habit: ${habit.name}`
                );
                // Use 'toggle' action which handles both completing and uncompleting
                toggleHabitStatus(id, today, 'toggle');
              }
            }

            console.log('Widget state reconciliation completed');
          } catch (error) {
            console.error('Error reconciling widget state:', error);
          } finally {
            isReconciling.current = false;
          }
        }
        appState.current = nextAppState;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [toggleHabitStatus]);
};
