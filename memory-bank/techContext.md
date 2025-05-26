# Technical Context

## Development Environment

### Prerequisites

- Node.js v18 or newer
- yarn or npm
- iOS Simulator or Android Emulator
- Expo CLI

### Core Technologies

1. **React Native & Expo**

   - React Native v0.76.9
   - Expo SDK v52
   - Expo Router v3
   - TypeScript v5.8.3

2. **State Management**

   - Zustand v5.0.1
   - MMKV v2.12.2
   - AsyncStorage v1.23.1

3. **Testing Framework**

   - Jest v29.2.1
   - React Native Testing Library v12.9.0
   - MSW (Mock Service Worker) v2.8.4
   - Jest Extended v5.0.3
   - Faker.js v6.6.6
   - Testing Library User Event v14.6.1

4. **UI Components**

   - React Native Reanimated v3.10.1
   - React Native Gesture Handler v2.16.1
   - React Native Skia v1.2.3
   - React Native Calendars v1.1312.0
   - @marceloterreiro/flash-calendar v1.3.0
   - Various Expo modules

5. **iOS Widget Specific**
   - Swift (for widget views, logic, and intents)
   - SwiftUI (for widget UI)
   - WidgetKit (Apple framework for building widgets)
   - App Intents (Apple framework for interactive widgets)
   - `@bacons/expo-apple-targets` (Expo package for integrating native Swift targets)
   - App Groups (iOS mechanism for sharing data between app and extensions)
   - `UserDefaults` (used with App Groups for data storage)

## Dependencies

### Production Dependencies

```json
{
  "@expo/vector-icons": "^14.1.0",
  "@gorhom/bottom-sheet": "^5.1.4",
  "@marceloterreiro/flash-calendar": "^1.3.0",
  "@supabase/supabase-js": "^2.44.4",
  "expo-router": "^3.5.18",
  "expo-store-review": "~8.0.1",
  "posthog-react-native": "^3.3.9",
  "@sentry/react-native": "^6.1.0",
  "react-native-mmkv": "2.12.2",
  "zustand": "^5.0.1",
  "react-native-calendars": "^1.1312.0",
  "react-native-confetti-cannon": "^1.5.2",
  "react-native-context-menu-view": "^1.16.0",
  "@bacons/expo-apple-targets": "^0.1.1-beta.1"
}
```

### Development Dependencies

```json
{
  "@babel/core": "^7.25.2",
  "@testing-library/react-native": "^12.9.0",
  "@testing-library/user-event": "^14.6.1",
  "@types/jest": "^29.5.12",
  "faker": "^6.6.6",
  "jest": "^29.2.1",
  "jest-expo": "52.0.6",
  "jest-extended": "^5.0.3",
  "msw": "^2.8.4",
  "typescript": "^5.8.3"
}
```

## Testing Infrastructure

### Jest Configuration

```json
{
  "preset": "jest-expo",
  "setupFiles": ["./jest.setup.js"],
  "testMatch": ["**/__tests__/**/*.test.{js,jsx,ts,tsx}"],
  "testPathIgnorePatterns": [
    "__tests__/utils/test-factories.ts",
    "__tests__/utils/custom-matchers.ts"
  ],
  "transformIgnorePatterns": [
    "node_modules/(?!(react-native|@react-native|expo|@expo|@supabase|zustand|dayjs)/)"
  ],
  "moduleNameMapping": {
    "^@/(.*)$": "<rootDir>/$1"
  }
}
```

### Test Scripts

```bash
# Run tests with no-tests-pass flag
npm run test

# Watch mode for development
npm run test:watch

# Coverage reporting
npm run test:coverage
```

### Testing Tools

1. **MSW (Mock Service Worker)**

   - API mocking for Supabase interactions
   - Realistic network request/response simulation
   - Offline testing capabilities

2. **Jest Extended**

   - Enhanced assertion matchers
   - Better test readability
   - Additional utility functions

3. **Faker.js**

   - Test data generation
   - Realistic mock data creation
   - Consistent test scenarios

4. **Testing Library User Event**
   - User interaction simulation
   - Event handling testing
   - Accessibility testing support

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
   - Database Schema:
     - Users: Stores user profiles with category scores (cat1_score through cat5_score)
     - Habits: Stores habit definitions and configurations
     - Habit Completions: Tracks habit completion history
     - User Achievements: Stores achievement progress with one-to-one user relationship
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

- Jest with Expo preset
- React Native Testing Library
- MSW for API mocking
- Jest Extended for enhanced matchers
- Faker.js for test data generation
- Custom test utilities and factories

### Running Tests

```bash
# Run all tests (with no-tests-pass flag)
yarn test

# Run tests in watch mode
yarn test:watch

# Run with coverage
yarn test:coverage
```

### Test Organization

```
__tests__/
├── components/          # Component tests
├── stores/             # State management tests
├── utils/              # Utility function tests
├── integration/        # Integration tests
└── utils/
    ├── test-factories.ts    # Test data factories
    └── custom-matchers.ts   # Custom Jest matchers
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

2. **Testing**
   - Jest performance monitoring
   - Component rendering benchmarks
   - State update performance tests
   - Memory usage tracking

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

### Notifications

```sql
CREATE TYPE notification_type AS ENUM (
    'HABIT',
    'MORNING',
    'EVENING',
    'STREAK',
    'GENERAL'
);

CREATE TABLE notifications (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    habit_id uuid REFERENCES habits(id),
    title text NOT NULL,
    body text NOT NULL,
    subtitle text,
    data jsonb DEFAULT '{}'::jsonb,
    badge integer,
    sound text,
    notification_type notification_type DEFAULT 'GENERAL'::notification_type,
    scheduled_for timestamptz NOT NULL,
    processed boolean DEFAULT false
);

CREATE INDEX idx_notifications_unprocessed_scheduled
ON notifications(scheduled_for)
WHERE processed = false;
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

## Core Libraries

### State Management

- **Zustand**: Primary state management solution

  - Type-safe stores with TypeScript
  - Middleware support (persist, immer)
  - Minimal boilerplate

- **MMKV**: High-performance key-value storage

  - Native implementation using C++
  - Significantly faster than AsyncStorage
  - Used for persisting Zustand stores
  - Optimized binary storage format

- **Immer**: Used with Zustand for immutable state updates
  - Simplifies complex state updates
  - Maintains immutability guarantees
  - Improves code readability

### UI Components

- **React Native**: Core UI framework

  - Cross-platform components
  - Native rendering

- **Expo**: Development platform

  - Easy access to native APIs
  - Simplified build process
  - Development tools

- **react-native-reanimated**: Advanced animations

  - Performance-optimized animations
  - Gesture handling

- **react-native-bottom-sheet**: Modal and drawer UI

  - Smooth animations
  - Customizable behavior
  - Gesture-based interactions

- **react-native-context-menu-view**: Context menus

  - Native context menu implementation
  - Platform-specific behavior

- **react-native-confetti-cannon**: Celebration effects
  - Used for achievement unlocks
  - Customizable particle effects
  - Performance-optimized animations

### Navigation

- **Expo Router v3**: File-based routing
  - Type-safe navigation
  - Deep linking support
  - URL-based navigation

### Database

- **Supabase**: Backend as a service
  - PostgreSQL database
  - Authentication
  - Real-time updates
  - Edge functions

### Data Formatting/Utilities

- **dayjs**: Date manipulation

  - Type-safe date operations
  - Lightweight alternative to moment.js
  - Consistent date handling

- **nanoid**: ID generation
  - Compact, URL-friendly IDs
  - Secure, unpredictable
  - Significantly smaller than UUID

## Development Environment

### Tools

- **TypeScript**: Type safety

  - Strict mode enabled
  - Comprehensive type definitions
  - Path aliases for imports

- **ESLint**: Code quality

  - Custom rule configuration
  - React Native specific rules
  - TypeScript integration

- **Prettier**: Code formatting
  - Consistent code style
  - EditorConfig integration

### Project Structure

- `/app`: Expo Router file-based routes
- `/components`: Reusable UI components
- `/lib`: Core application logic
  - `/hooks`: Custom React hooks
  - `/stores`: Zustand stores (e.g., `habits_store.ts`, `user_profile_store.ts`)
    - `/actions`: Modular store slices/actions (e.g., `habits/actions/completions.ts`)
  - `/utils`: Utility functions (e.g., `dayjs.ts`, `supabase.ts`, `habits.ts`, `achievements.ts`)
  - `/types`: Global TypeScript type definitions (many slice-specific types are now colocated within `/lib/stores/actions`)
  - `/constants`: Application constants
- `/assets`: Static assets

## Key Technical Decisions

1. **Zustand + MMKV**: Chosen for state management and persistence due to:

   - Minimal boilerplate compared to Redux
   - TypeScript integration
   - Performance benefits with MMKV
   - Simplified store implementation

2. **Supabase**: Selected as backend for:

   - PostgreSQL support
   - Real-time capabilities
   - Edge functions
   - Authentication services
   - Open-source nature

3. **Expo Managed Workflow**: Adopted for:

   - Simplified development
   - Easy access to native APIs
   - OTA updates
   - Build service
   - Development tools

4. **File-based Routing**: Implemented with Expo Router for:

   - URL-based navigation
   - Deep linking support
   - Familiar web-like routing
   - Type safety

5. **Offline-First Architecture**: Designed for:
   - Resilience to connectivity issues
   - Optimistic updates
   - Seamless user experience
   - Background synchronization

## Supabase Integration

### Version and Setup

- Using @supabase/supabase-js v2.49.4 (upgraded from 2.44.4)
- Supabase client is now located in `supabase/client.ts`
- Types are auto-generated using `supabase:typegen` npm script

### Database Schema

The database includes the following tables:

- habits
- habit_completions
- notifications
- user_achievements
- users (updated with push_token field)

### Edge Functions

1. **Notification Processor** (`notification-processor/index.ts`)

   - Runs every minute
   - Processes notifications in batches of 599
   - Handles invalid tokens
   - Updates notification status

2. **Habit Notifications** (`habits-note/index.ts`)

   - Runs hourly
   - Schedules habit reminders
   - Handles timezone-aware scheduling
   - Performance considerations for large scale

3. **Streak Notifications** (`streak-note/index.ts`)
   - Runs hourly
   - Schedules streak achievement notifications
   - Targets 2 PM local time
   - Handles timezone differences

### Type Generation

- Types are now generated into `supabase/types.ts`
- Command: `npx supabase gen types typescript --project-id jmkqqbzjdndmxrtfibsa --schema public`

### Performance Constraints

1. Edge Function Limits:

   - 5000ms timeout maximum
   - Memory limitations
   - CPU constraints

2. Batch Processing:
   - Expo limit: 599 notifications per batch
   - Database query optimization needed
   - Memory efficient processing required

### Environment Variables

```bash
SUPABASE_URL=project_url
SUPABASE_SERVICE_ROLE_KEY=service_role_key
EXPO_ACCESS_TOKEN=expo_token
```

### Technical Dependencies

1. **Supabase Edge Runtime**

   - Edge function environment
   - Database access
   - Type definitions

2. **Day.js**

   - Timezone handling
   - Date calculations
   - UTC conversions

3. **Expo Notifications**
   - Push notification delivery
   - Token management
   - Error handling

### Development Patterns

1. **Timezone Handling**

   - Store times in UTC
   - Convert to user timezone for processing
   - Handle DST changes

2. **Error Handling**

   - Invalid token cleanup
   - Batch processing errors
   - Database transaction safety

3. **Performance Optimization**
   - Efficient database queries
   - Memory-efficient processing
   - Batch operations

### Monitoring Considerations

1. **Logging**

   - Detailed debug information
   - Error tracking
   - Performance metrics

2. **Metrics**

   - Notification delivery rates
   - Processing times
   - Error rates

3. **Alerts**
   - Function timeouts
   - High error rates
   - Invalid token spikes

## Native iOS Widgets

- **Framework:** Swift, SwiftUI, WidgetKit, AppIntents
- **Integration:** `@bacons/expo-apple-targets` library used to generate and manage the native widget target within the Expo project.
- **Development Environment:** Xcode is required for native Swift/SwiftUI development, debugging (including `os.Logger` output via Console.app), and simulator/device testing.
- **Data Sharing:** Requires configuration of an **App Group** in both the main application target and the widget extension target within Xcode. Data is shared via `UserDefaults(suiteName: "group.com.vdl.habitapp.widget")`.
- **Key Dependencies/APIs:**
  - `WidgetKit`: For defining widgets (`Widget`, `WidgetBundle`), timelines (`TimelineProvider`, `TimelineEntry`), and views (`View`).
  - `SwiftUI`: For building the widget user interface.
  - `AppIntents`: Used for the `InteractiveHabitWidget` to define the `ToggleHabitIntent`, allowing background actions triggered from the widget.
  - `Foundation`: For data handling (JSON encoding/decoding, `Date`, `Calendar`, `UserDefaults`, `ISO8601DateFormatter`).
  - `os.Logger`: Used for logging within the Swift widget code.
- **Build Process:** `npx expo prebuild -p ios` generates/updates the Xcode project, incorporating the widget target defined by `targets/widget/expo-target.config.js`.

# Tech Context

## Core Technologies

- **React Native (Expo)**: Cross-platform mobile application development using JavaScript/TypeScript and React.
  - Expo SDK is used for accessing native device features and simplifying the development workflow.
- **TypeScript**: For static typing, improving code quality and maintainability.
- **Supabase**: Backend-as-a-Service (BaaS).
  - **Database (PostgreSQL)**: Storing user data, habits, completions, achievements, and notification schedules.
    - Key tables: `users`, `habits`, `habit_completions`, `user_achievements`, `notifications`.
    - The `users` table now includes `allow_streak_notifications` (boolean) and `allow_daily_update_notifications` (boolean) to manage user preferences for these specific notification types. Default value for these is `TRUE`.
  - **Authentication**: Manages user sign-up, sign-in (email/password, Google, Apple), and session management.
  - **Edge Functions (Deno)**: Serverless functions for backend logic, written in TypeScript.
    - `daily-update-note`: Handles scheduling of daily morning/evening summary notifications. Filters users based on their `allow_daily_update_notifications` preference.
    - `streak-note`: Handles scheduling of streak-related notifications. Filters users based on their `allow_streak_notifications` preference and includes refactored logic for streak calculation.
    - Other functions for tasks like sending reminder notifications, calculating streaks (potentially to be consolidated or removed if `streak-note` covers all needs).
  - **Storage**: For user-uploaded content (not heavily used yet).
- **Zustand**: State management library for React. Used for managing global and feature-specific state (user profile, app settings, habits).
- **React Native MMKV**: For fast, encrypted on-device storage, used by Zustand middleware for persistence.
- **Day.js**: Lightweight library for date and time manipulation.
- **Expo Router**: File-system based routing for React Native apps.
- **PostHog**: Product analytics and event tracking.
- **RevenutCat**: Subscription and in-app purchase management (setup pending).

## Development Setup & Workflow

- **IDE**: Visual Studio Code with the Cursor AI pair programmer extension.
- **Version Control**: Git, with the repository hosted on GitHub (implied).
- **Package Management**: `npm` or `yarn` (typical for React Native/Expo projects).
- **Expo CLI**: Used for running the app in development (Expo Go app or simulators/emulators), building, and submitting to app stores.
- **Supabase CLI**: Used for managing Supabase project, including database migrations, Edge Function deployment, and generating types.
  - Database schema changes (like adding new columns to `users`) are managed via Supabase migrations, and types are regenerated using `supabase gen types typescript --project-id <PROJECT_ID> --schema public > supabase/types.ts`.

## Technical Constraints & Considerations

- **Offline Support**: `useHabitsStore` has a robust pending operations queue for offline habit tracking. `useUserProfileStore` uses a simpler background sync for profile updates.
- **Performance**: MMKV is chosen for fast local storage. Edge Functions are used for backend tasks that don't require a full server.
- **Security**: Supabase handles authentication securely. MMKV provides encryption for local data. Service role keys for Supabase are used in Edge Functions and should be managed securely as environment variables.
- **Scalability**: Supabase provides a scalable backend infrastructure. Edge Functions can scale independently.
- **Cross-Platform Consistency**: Expo and React Native help maintain consistency, but platform-specific considerations (e.g., push notification setup) are still relevant.

## Dependencies (Key Libraries)

- `expo`
- `react`, `react-native`
- `@supabase/supabase-js`
- `zustand`
- `react-native-mmkv`
- `dayjs`
- `expo-router`
- `@react-native-google-signin/google-signin`
- `expo-apple-authentication`
- `react-native-toast-message`
- `posthog-react-native`
- `@revenuecat/purchases-react-native` (setup pending)

_This document was last updated on April 26, 2024, to reflect the addition of notification preference columns in the `users` table and updated Edge Function filtering logic._

## UI Constants & Styling

The project now uses a centralized approach to UI constants and styling:

```typescript
// lib/constants/ui.ts
export const colors = {
  primary: '#3BAA74',
  secondary: '#3978B7',
  text: '#1A1A1A',
  bgLight: '#FFFFFF',
  border: '#E5E5E5',
  // ... other colors

  habitColors: {
    cyanBlue: '#2F80ED',
    salmonRed: '#EB5757',
    // ... other habit colors
  },

  dropShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
};

export const fontWeights = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semibold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
  interRegular: 'Poppins_400Regular',
  interMedium: 'Poppins_500Medium',
  interSemiBold: 'Poppins_600SemiBold',
  interBold: 'Poppins_700Bold',
};
```

## Component Patterns

### Shared Components

1. **Button Component**

   - Primary/Secondary variants
   - Consistent styling and touch feedback
   - Type-safe props interface

2. **Icon Component**

   - Automatic tint calculation based on background
   - Support for emoji and MaterialIcons
   - Consistent sizing and color handling

3. **Toast Configuration**
   - Standardized toast appearance
   - Custom styling for different types (info, success, error)
   - Consistent font family usage

### Modal System

The modal system has been enhanced with:

- Centralized modal store
- Type-safe modal types
- Consistent layout patterns
- Standardized animations
- Proper backdrop handling
