import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import useHabitsStore from '@/lib/stores/habits/store';
import { widgetStorage } from '@/lib/stores/habits/widget-storage';
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

              // Check if this habit was completed in widget for today
              const isCompletedInWidget = weeklyStatus[todayKey] === true;

              if (isCompletedInWidget) {
                // Check current state in store
                const currentStatus = useHabitsStore
                  .getState()
                  .getHabitStatus(id, today);
                const habit = useHabitsStore.getState().habits.get(id);

                // Only sync if habit exists and isn't already completed
                if (
                  habit &&
                  (!currentStatus || currentStatus.status !== 'completed')
                ) {
                  console.log(
                    `Syncing widget completion for habit: ${habit.name}`
                  );
                  await toggleHabitStatus(id, today, 'toggle');
                }
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
