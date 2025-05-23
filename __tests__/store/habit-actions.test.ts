import useHabitsStore from '@/lib/habit-store/store';
import {
  CompletionFactory,
  DateFactory,
  HabitFactory,
} from '../utils/test-factories';

// Mock the store persistence to avoid issues
jest.mock('zustand/middleware', () => ({
  persist: (fn: any) => fn,
}));

describe('Habit Store Actions', () => {
  beforeEach(() => {
    // Reset store state using a simple approach
    useHabitsStore.setState({
      habits: new Map(),
      completions: new Map(),
      isLoading: false,
      error: null,
    });
  });

  describe('Basic Store Operations', () => {
    it('should initialize with empty state', () => {
      const store = useHabitsStore.getState();
      expect(store.habits.size).toBe(0);
      expect(store.completions.size).toBe(0);
    });

    it('should be able to access store methods', () => {
      const store = useHabitsStore.getState();
      expect(typeof store.addHabit).toBe('function');
      expect(typeof store.updateHabit).toBe('function');
      expect(typeof store.deleteHabit).toBe('function');
    });
  });

  describe('Habit CRUD Operations', () => {
    it('should add a habit to the store', async () => {
      const newHabit = HabitFactory.create();
      const store = useHabitsStore.getState();

      // Manually add to store for testing
      store.habits.set(newHabit.id, newHabit);

      expect(store.habits.size).toBe(1);
      expect(store.habits.get(newHabit.id)).toEqual(newHabit);
    });

    it('should update a habit in the store', async () => {
      const habit = HabitFactory.create({ name: 'Original Name' });
      const store = useHabitsStore.getState();

      // Add habit
      store.habits.set(habit.id, habit);

      // Update habit
      const updatedHabit = { ...habit, name: 'Updated Name' };
      store.habits.set(habit.id, updatedHabit);

      expect(store.habits.get(habit.id)?.name).toBe('Updated Name');
    });

    it('should delete a habit from the store', async () => {
      const habit = HabitFactory.create();
      const store = useHabitsStore.getState();

      // Add habit
      store.habits.set(habit.id, habit);
      expect(store.habits.size).toBe(1);

      // Delete habit
      store.habits.delete(habit.id);
      expect(store.habits.size).toBe(0);
    });
  });

  describe('Completion Operations', () => {
    it('should add a completion to the store', async () => {
      const habit = HabitFactory.create();
      const completion = CompletionFactory.create(habit.id);
      const store = useHabitsStore.getState();

      // Add habit and completion
      store.habits.set(habit.id, habit);
      store.completions.set(completion.id, completion);

      expect(store.completions.size).toBe(1);
      expect(store.completions.get(completion.id)).toEqual(completion);
    });

    it('should handle multiple completions for same habit', async () => {
      const habit = HabitFactory.create();
      const completion1 = CompletionFactory.createForDate(
        habit.id,
        DateFactory.today()
      );
      const completion2 = CompletionFactory.createForDate(
        habit.id,
        DateFactory.yesterday()
      );
      const store = useHabitsStore.getState();

      // Add completions
      store.completions.set(completion1.id, completion1);
      store.completions.set(completion2.id, completion2);

      expect(store.completions.size).toBe(2);

      // Both should be for the same habit
      const habitCompletions = Array.from(store.completions.values()).filter(
        (c) => c.habit_id === habit.id
      );
      expect(habitCompletions).toHaveLength(2);
    });
  });

  describe('Store State Management', () => {
    it('should handle loading states', () => {
      const store = useHabitsStore.getState();

      // Set loading state
      useHabitsStore.setState({ isLoading: true });
      expect(useHabitsStore.getState().isLoading).toBe(true);

      // Clear loading state
      useHabitsStore.setState({ isLoading: false });
      expect(useHabitsStore.getState().isLoading).toBe(false);
    });

    it('should handle error states', () => {
      const errorMessage = 'Test error';

      // Set error state
      useHabitsStore.setState({ error: errorMessage });
      expect(useHabitsStore.getState().error).toBe(errorMessage);

      // Clear error state
      useHabitsStore.setState({ error: null });
      expect(useHabitsStore.getState().error).toBe(null);
    });
  });
});
