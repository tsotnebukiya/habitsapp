import 'react-native-gesture-handler/jestSetup';

// Mock react-native modules
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Use fake timers for all tests
jest.useFakeTimers();

// Mock expo modules
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
}));

jest.mock('expo-font');
jest.mock('expo-asset');

// Mock problematic URL polyfill
jest.mock('react-native-url-polyfill/auto', () => {});

// Mock uuid module
jest.mock('uuid', () => ({
  v4: () => 'test-uuid-1234',
}));

// Mock widget storage module
jest.mock(
  'modules/widget-storage',
  () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    reloadAllTimelines: jest.fn(),
  }),
  { virtual: true }
);

// Mock widget storage lib
jest.mock('@/lib/habit-store/widget-storage', () => ({
  updateWidgetData: jest.fn(),
  reloadAllTimelines: jest.fn(),
  syncStoreToWidget: jest.fn(),
}));

// Mock habits utility to avoid timeout issues in tests
jest.mock('@/lib/utils/habits', () => {
  const originalModule = jest.requireActual('@/lib/utils/habits');
  return {
    ...originalModule,
    handlePostActionOperations: jest.fn((get, habitId, affectedDates) => {
      // Make this synchronous for tests
      get().updateAffectedDates?.(habitId, affectedDates);
      get().calculateAndUpdate?.();
    }),
  };
});

// Mock MeasurementUnits constants
jest.mock('@/lib/constants/MeasurementUnits', () => ({
  MeasurementUnits: {
    times: {
      id: 'times',
      oneName: 'Time',
      name: 'Times',
      shortName: '×',
      category: 'count',
      baseIncrement: 1,
      defaultGoal: 1,
    },
    minutes: {
      id: 'minutes',
      oneName: 'Minute',
      name: 'Minutes',
      shortName: 'min',
      category: 'time',
      baseIncrement: 5,
      defaultGoal: 30,
    },
  },
}));

// Mock Supabase client
jest.mock('@/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({ data: [], error: null })),
      insert: jest.fn(() => Promise.resolve({ data: [], error: null })),
      update: jest.fn(() => Promise.resolve({ data: [], error: null })),
      upsert: jest.fn(() => Promise.resolve({ data: [], error: null })),
      delete: jest.fn(() => Promise.resolve({ data: [], error: null })),
      eq: jest.fn(function () {
        return this;
      }),
      in: jest.fn(function () {
        return this;
      }),
      gte: jest.fn(function () {
        return this;
      }),
      lte: jest.fn(function () {
        return this;
      }),
      order: jest.fn(function () {
        return this;
      }),
      limit: jest.fn(function () {
        return this;
      }),
    })),
  },
}));

// Mock user profile store
jest.mock('@/lib/stores/user_profile', () => ({
  useUserProfileStore: {
    getState: () => ({
      profile: { id: 'test-user-id' },
    }),
  },
}));

// Mock dayjs timezone plugin
jest.mock('dayjs', () => {
  const originalDayjs = jest.requireActual('dayjs');
  const utc = jest.requireActual('dayjs/plugin/utc');
  const timezone = jest.requireActual('dayjs/plugin/timezone');

  originalDayjs.extend(utc);
  originalDayjs.extend(timezone);

  return originalDayjs;
});

// Mock react-native-toast-message
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));

// Mock react-native-modal-datetime-picker
jest.mock('react-native-modal-datetime-picker', () => 'DateTimePickerModal');

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock faker module
jest.mock(
  'faker',
  () => ({
    datatype: {
      uuid: () => 'test-uuid-1234',
      number: (options) => options?.min || 1,
    },
    lorem: {
      words: (count) =>
        Array.from({ length: count }, (_, i) => `word${i + 1}`).join(' '),
      word: () => 'testword',
    },
    internet: {
      email: () => 'test@example.com',
      color: () => '#FF0000',
    },
    name: {
      findName: () => 'Test User',
    },
    date: {
      past: () => new Date('2025-01-01'),
      recent: () => new Date('2025-05-20'),
    },
    seed: () => {},
  }),
  { virtual: true }
);

// Mock expo-store-review
jest.mock('expo-store-review', () => ({
  requestReview: jest.fn(() => Promise.resolve()),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
}));

// Mock react-native-mmkv
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn(() => ({
    set: jest.fn(),
    getString: jest.fn(() => null),
    delete: jest.fn(),
  })),
}));

// Mock zustand middleware
jest.mock('zustand/middleware', () => ({
  persist: (fn) => fn,
  createJSONStorage: () => ({
    setItem: jest.fn(),
    getItem: jest.fn(() => null),
    removeItem: jest.fn(),
  }),
}));

// Mock app state store directly
jest.mock('@/lib/stores/app_state', () => ({
  useAppStore: jest.fn(() => ({
    notificationsEnabled: true,
    promptedReviewMilestones: [],
    setNotificationsEnabled: jest.fn(),
    requestReview: jest.fn(() => Promise.resolve(true)),
    resetPromptedMilestones: jest.fn(),
    clearAllData: jest.fn(),
  })),
  appStorage: {
    set: jest.fn(),
    getString: jest.fn(() => null),
    delete: jest.fn(),
  },
}));

// Set timezone for consistent testing
process.env.TZ = 'Asia/Tbilisi';

// Import custom matchers
// import './__tests__/utils/custom-matchers';
