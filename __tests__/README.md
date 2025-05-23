# Test Suite Documentation

This test suite provides comprehensive coverage for the date handling functionality that was recently fixed in the habit tracking app.

## Test Structure

### 1. **Core Date Utilities** (`__tests__/utils/dayjs.test.ts`)

Tests the fundamental date utility functions that everything else depends on:

- **Local vs UTC handling**: Ensures `today()` vs `todayUTC()`, `normalizeLocal()` vs `normalize()` work correctly
- **Date formatting**: Tests `toLocalDateString()` vs `toServerDateString()`
- **Date comparisons**: Validates `isSameDayLocal()`, `isBeforeDayLocal()`, `isAfterDayLocal()`
- **Edge cases**: Handles DST transitions and invalid dates

### 2. **Habit Logic Functions** (`__tests__/utils/habits.test.ts`)

Tests the habit-specific business logic:

- **Completion matching**: `getHabitStatus()` uses local dates for finding completions
- **Date calculations**: `calculateDateStatus()` and `normalizeDate()` work with local time
- **Progress calculations**: `getCurrentProgress()` and `getProgressText()` handle various units
- **Edge cases**: Handles missing data and boundary conditions

### 3. **React Hooks** (`__tests__/hooks/useHabits.test.ts`)

Tests the React hooks that components use:

- **Date filtering**: `useHabitsForDate()` correctly filters habits by date range and weekly patterns
- **Status information**: `useHabitStatusInfo()` provides accurate completion data
- **Edge cases**: Handles non-existent habits and missing completions

### 4. **Integration Tests** (`__tests__/integration/date-handling.test.ts`)

Tests the complete flow from habit creation to completion tracking:

- **End-to-end flow**: Habit creation, completion tracking, and status updates
- **Timezone edge cases**: Ensures consistency across timezone boundaries
- **Weekly frequency**: Tests day-of-week calculations in local timezone
- **Achievement calculations**: Validates streak calculations use local dates

## Running Tests

### Basic Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npx jest __tests__/utils/dayjs.test.ts

# Run tests matching a pattern
npx jest --testNamePattern="timezone"
```

### Test Results

All tests are currently passing:

- **39 total tests** across 4 test suites
- **100% pass rate**
- **Comprehensive coverage** of date handling edge cases

## Key Issues Tested

### 1. **UTC vs Local Time Consistency**

- **Problem**: Mixed usage of UTC and local time functions
- **Tests**: Verify `normalizeLocal()` vs `normalize()` produce different results in non-UTC timezones
- **Coverage**: Date utilities, habit status, completion matching

### 2. **Habit Creation Date Handling**

- **Problem**: Habits created "today" appeared on "yesterday"
- **Tests**: Ensure habits created with local dates appear on correct days
- **Coverage**: Integration tests, date filtering

### 3. **End Date Filtering**

- **Problem**: Habits with end dates still appeared after end date
- **Tests**: Verify date range filtering works correctly
- **Coverage**: Hook tests, integration tests

### 4. **UI State Updates**

- **Problem**: Completion status not updating in UI
- **Tests**: Ensure `getHabitStatus()` uses consistent date formatting
- **Coverage**: Habit utility tests, status information tests

### 5. **Weekly Frequency Patterns**

- **Problem**: Day-of-week calculations in wrong timezone
- **Tests**: Verify weekly habits appear on correct days in local timezone
- **Coverage**: Hook tests, integration tests

## Test Configuration

### Jest Setup (`jest.setup.js`)

- **Timezone**: Set to `Asia/Tbilisi` (UTC+4) for consistent testing
- **Mocks**: React Native modules, Expo modules, Supabase, external dependencies
- **Module mapping**: `@/` alias for project root

### Key Mocks

- **react-native-url-polyfill**: Prevents import errors
- **modules/widget-storage**: Virtual mock for native module
- **@/lib/constants/MeasurementUnits**: Mock measurement units
- **uuid**: Simple string generator
- **Supabase client**: Mock database operations

## Maintenance

### Adding New Tests

1. **Follow existing patterns**: Use similar structure and naming
2. **Mock dependencies**: Add new mocks to `jest.setup.js` as needed
3. **Test edge cases**: Include timezone boundaries, invalid data, etc.
4. **Update documentation**: Add new test descriptions here

### Common Issues

1. **Import errors**: Add mocks to `jest.setup.js`
2. **Timezone inconsistencies**: Ensure tests use timezone-aware dates
3. **Mock data**: Keep test data realistic and consistent

## Design Principles Validated

### 1. **Clear Separation of Concerns**

- **UTC for Server**: Functions like `toServerDateString()`, `normalize()` for database
- **Local for Users**: Functions like `toLocalDateString()`, `normalizeLocal()` for UI
- **Tests verify**: Both types work correctly and don't interfere

### 2. **Consistent Date Handling**

- **Single source of truth**: All date operations use same utility functions
- **Tests verify**: No mixed UTC/local usage in user-facing operations

### 3. **Robust Edge Case Handling**

- **Timezone boundaries**: Handle dates that cross day boundaries
- **Invalid data**: Graceful handling of malformed dates
- **Tests verify**: System remains stable under edge conditions

This test suite ensures that the date handling fixes are working correctly and will catch any regressions in the future.
