import useHabitsStore from '@/lib/habit-store/store';
import { calculateCurrentStreak } from '@/lib/utils/achievements'; // Make sure this is exported
import { useMemo } from 'react';

export function useCurrentStreak(): number {
  // Select the specific state pieces needed for the calculation
  const completions = useHabitsStore((state) => state.completions);
  const habits = useHabitsStore((state) => state.habits);

  // Memoize the calculation based on its dependencies
  const currentStreak = useMemo(() => {
    return calculateCurrentStreak(completions, habits);
  }, [completions, habits]); // Dependency array ensures recalculation only when these change

  return currentStreak;
}
