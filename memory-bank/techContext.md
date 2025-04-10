# Technical Context

## Development Environment

### Prerequisites

- Node.js v18 or newer
- yarn or npm
- iOS Simulator or Android Emulator
- Expo CLI

### Core Technologies

1. **React Native & Expo**

   - React Native v0.74.5
   - Expo SDK v51
   - Expo Router v3
   - TypeScript v5.5.4

2. **State Management**

   - Zustand v5.0.1
   - MMKV v2.12.2
   - AsyncStorage v1.23.1

3. **UI Components**
   - React Native Reanimated v3.10.1
   - React Native Gesture Handler v2.16.1
   - React Native Skia v1.2.3
   - Various Expo modules

## Dependencies

### Production Dependencies

```json
{
  "@expo/vector-icons": "^14.0.4",
  "@gorhom/bottom-sheet": "^4.6.3",
  "@supabase/supabase-js": "^2.44.4",
  "expo-router": "^3.5.18",
  "posthog-react-native": "^3.3.9",
  "@sentry/react-native": "^6.1.0",
  "react-native-mmkv": "2.12.2",
  "zustand": "^5.0.1"
}
```

### Development Dependencies

```json
{
  "@babel/core": "^7.24.0",
  "@testing-library/react-native": "^12.9.0",
  "typescript": "^5.5.4",
  "jest": "^29.2.1"
}
```

## External Services

### Analytics & Monitoring

1. **PostHog**

   - Event tracking
   - User analytics
   - Feature flags
   - A/B testing

2. **Sentry**
   - Error tracking
   - Performance monitoring
   - Crash reporting
   - Debug symbols

### Backend Services

1. **Supabase**
   - Database
   - Authentication
   - Real-time subscriptions
   - Storage

## Development Setup

### Installation Steps

```bash
# Clone repository
git clone <repository-url>

# Install dependencies
yarn install

# Setup environment variables
cp .env.example .env

# Start development server
yarn dev
```

### Environment Variables

```env
POSTHOG_API_KEY=
SENTRY_DSN=
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

## Build & Deployment

### Local Development

```bash
# iOS
yarn ios

# Android
yarn android

# Web
yarn web
```

### Production Builds

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

## Testing

### Test Setup

- Jest
- React Native Testing Library
- Mock implementations
- Test utilities

### Running Tests

```bash
# Run all tests
yarn test

# Run with coverage
yarn test --coverage
```

## Performance Considerations

### Mobile Optimization

1. **Bundle Size**

   - Asset optimization
   - Code splitting
   - Tree shaking
   - Dynamic imports

2. **Runtime Performance**
   - Memory management
   - Animation optimization
   - List virtualization
   - Image caching

### Development Tools

1. **Debugging**

   - React Native Debugger
   - Chrome DevTools
   - Flipper
   - Performance Monitor

2. **Code Quality**
   - ESLint
   - Prettier
   - TypeScript
   - Husky hooks

## State Management

### Zustand Store Implementation

The application uses Zustand for state management with the following key features:

- Persistent storage using AsyncStorage
- Shared utility functions for common operations
- Type-safe store implementations
- Offline-first architecture

### Key Dependencies

- `zustand`: State management
- `@react-native-async-storage/async-storage`: Local persistence
- `dayjs`: Date manipulation
- `uuid`: Unique ID generation
- `@supabase/supabase-js`: Backend integration

## Database Schema

### Habits

```sql
CREATE TABLE habits (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  goal_value NUMERIC,
  goal_unit TEXT,
  days_of_week INTEGER[],
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);
```

### Habit Completions

```sql
CREATE TYPE habit_completion_status AS ENUM ('not_started', 'in_progress', 'completed', 'failed');

CREATE TABLE habit_completions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  habit_id UUID REFERENCES habits(id),
  completion_date DATE,
  status habit_completion_status,
  value NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE
);
```

### User Achievements

```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  streak_achievements JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

## Technical Decisions

### Offline Support

- Optimistic updates for immediate feedback
- Pending operations queue for failed requests
- Retry mechanism with exponential backoff
- Local state as source of truth

### Data Synchronization

- Periodic sync with server
- Manual sync trigger support
- Conflict resolution favoring server state
- Batch processing of pending operations

### Error Handling

- Centralized error handling
- Type-safe error states
- Retry mechanisms for transient failures
- User-friendly error messages

### Performance Considerations

- Efficient local storage using Maps
- Batch processing for network requests
- Lazy loading of remote data
- Optimized date calculations

## Date Handling

All date operations in the application use dayjs, configured through a central configuration file at `lib/utils/dayjs.ts`. This ensures consistent date handling across the application.

### Configuration

The dayjs configuration includes:

- Basic date operations (`dayjs()`, `toDate()`, `toISOString()`)
- Date comparisons (`isSameOrBefore`, `isSameOrAfter`, `isAfter`)
- Date manipulations (`startOf('day')`, `subtract(1, 'day')`)
- Date formatting (`format('YYYY-MM-DD')`)
- Time differences (`diff()`)
- Timezone support (UTC and local timezone handling)

### Usage Pattern

Always import dayjs from our centralized configuration:

```typescript
import dayjs from '@/lib/utils/dayjs';
```

Never import dayjs directly from the package:

```typescript
// Don't do this
import dayjs from 'dayjs';
```

### Common Operations

- Current time: `dayjs()`
- Format for storage: `dayjs().toISOString()`
- Parse stored dates: `dayjs(storedDate)`
- Date comparisons: `dayjs(date1).isSameOrBefore(date2)`
- Day boundaries: `dayjs().startOf('day')`
- Date arithmetic: `dayjs().subtract(1, 'day')`
- Normalized dates: `dayjs(date).format('YYYY-MM-DD')`

## Date Handling Standards

### Core Date Library

1. **Day.js Implementation**

   - Using custom dayjs instance from `@/lib/utils/dayjs`
   - All date operations must use this instance
   - Direct import from 'dayjs' is prohibited

2. **Standard Date Operations**

   - Start of day: `dayjs(date).startOf('day')`
   - Date comparisons: Use dayjs methods like `isSameOrBefore`, `isSameOrAfter` with 'day' granularity
   - Day of week: Use `day()` method instead of native `getDay()`
   - Date formatting: Use dayjs's `format()` method for consistent output

3. **Best Practices**

   - Always use dayjs for date manipulations
   - Avoid native Date methods
   - Store dates in ISO format
   - Use dayjs's type-safe methods for comparisons
   - When storing in state/database, convert to Date using `toDate()`

4. **Common Patterns**

   ```typescript
   // Date normalization
   const normalizedDate = dayjs(date).startOf('day');

   // Date comparisons
   const isInRange = startDate.isSameOrBefore(targetDate, 'day');

   // Getting day of week
   const dayOfWeek = dayjs(date).day(); // 0 = Sunday

   // Formatting
   const formatted = dayjs(date).format();
   ```

## Storage

[Storage documentation will go here]

## Authentication

[Authentication documentation will go here]
