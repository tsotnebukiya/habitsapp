# Active Context

## Current Development Status

HabitsApp is a fully functional habit tracking application with core features implemented and operational. Recent major updates include achievement system overhaul, UI simplification, and store review integration.

## Current Focus Areas

### 1. Internationalization (i18n) Implementation 🔄

- **i18next Integration**: Added i18next and react-i18next for multi-language support
- **Translation Utilities**: Created comprehensive translation helpers for measurement units, categories, progress text, and achievements
- **Dynamic Localization**: Support for proper pluralization and dynamic value insertion
- **Fallback Strategy**: Default values ensure app functionality even without translations

### 2. Enhanced User Experience Features 🔄

- **Picker Component**: Added @react-native-picker/picker for better selection interfaces
- **Keyboard Handling**: Integrated react-native-keyboard-aware-scroll-view for improved form interactions
- **User Account Management**: Added delete-user edge function for GDPR compliance
- **Feedback System**: Implemented email-resend edge function for user feedback collection

### 3. Achievement System Overhaul ✅

- **Simplified Achievement Structure**: Removed description and icon fields for cleaner data model
- **Enhanced Milestone System**: Added new achievement milestones (5, 45, 100, 200 days)
- **Automatic Achievement Display**: Achievements now show automatically when unlocked
- **Store Review Integration**: Automatic review prompts on first achievement milestones (7, 14, 21 days)

### 2. UI Simplification & Component Cleanup ✅

- **Modal System Streamlined**: Removed ConfirmationModal and simplified modal navigation
- **Component Removal**: Deleted unused NumericInput component (108 lines)
- **ChooseHabitModal Integration**: Removed from HabitsPicker for cleaner UI flow
- **Code Quality**: Removed debug console.log statements and improved imports

### 3. Category System Enhancement ✅

- **Display Color Configuration**: Added category-specific color schemes for better visual hierarchy
- **Matrix Calculations**: Enhanced with difference tracking from baseline scores
- **Total Category**: Added unified total category with proper display configuration
- **Baseline Comparisons**: Improved category display with progress from starting point

### 4. Store Review Integration ✅

- **expo-store-review**: Added native store review functionality
- **Milestone Tracking**: Tracks which review milestones have been prompted
- **Smart Prompting**: Only prompts once on first achievement milestone
- **Delayed Execution**: 2-second delay to let achievement celebration show first

### 1. Testing Infrastructure Setup ✅

- Comprehensive testing framework implementation
- Jest configuration with proper module mapping
- MSW (Mock Service Worker) for API mocking
- Testing utilities and factories setup
- Jest Extended for enhanced matchers

### 2. UI Polish & Bug Fixes

- Fixed scroll indicator visibility issues in stats screen
- Improved user experience with proper scroll behavior
- Ongoing modal animations and loading states
- Accessibility enhancements

### 3. Development Workflow Improvements

- Enhanced test scripts with coverage and watch modes
- Better development tooling setup
- Improved package management and dependencies

## Recent Achievements ✅

### Achievement System Overhaul

- **Data Model Simplification**: Streamlined achievement structure for better performance
- **Milestone Expansion**: Added 5, 45, 100, 200-day achievements for better progression
- **Automatic Integration**: Achievements now trigger modals automatically without manual handling
- **Review Prompting**: Integrated store review requests with achievement milestones

### UI Simplification

- **Component Cleanup**: Removed 3 unused components (ConfirmationModal, NumericInput, ChooseHabitModal integration)
- **Modal Streamlining**: Simplified modal system with automatic achievement display
- **Code Quality**: Cleaned up debug statements and improved import organization

### Category System Enhancement

- **Visual Improvements**: Added display color configurations for better UI hierarchy
- **Matrix Calculations**: Enhanced with baseline difference tracking
- **Performance**: Improved category calculations with proper memoization

### Store Review Integration

- **Native Integration**: Added expo-store-review for App Store optimization
- **Smart Timing**: Review prompts only on first milestone achievements
- **User Experience**: Delayed prompts to avoid interrupting achievement celebrations

### Testing Infrastructure

- **Jest Setup**: Comprehensive test configuration with proper module resolution
- **MSW Integration**: Mock Service Worker for API testing
- **Test Utilities**: Custom matchers and test factories
- **Coverage**: Test coverage reporting setup
- **Scripts**: Separate test, test:watch, and test:coverage commands

### UI Improvements

- **Stats Screen**: Fixed vertical scroll indicator visibility
- **Component Polish**: Ongoing improvements to user interface
- **Performance**: Maintained optimized rendering and state management

### Development Tools

- **Faker.js**: Added for generating test data
- **Testing Library**: Enhanced with user-event for interaction testing
- **Jest Extended**: Additional matchers for better test assertions

## Next Development Priorities

### High Priority

1. **Internationalization Implementation**: Complete i18n setup with language selection and translation files
2. **User Account Features**: Integrate delete-user and feedback systems into app UI
3. **Form Improvements**: Implement new picker and keyboard-aware components in habit creation/editing
4. **Test Implementation**: Write comprehensive tests for core functionality including new i18n features
5. **UI Polish**: Complete modal animations, loading states, error handling

### Medium Priority

1. **Advanced Testing**: Integration tests and E2E testing setup
2. **Performance**: Bundle optimization, memory management
3. **Documentation**: Test documentation and contribution guidelines

## Current Architecture Status

### Technology Stack

- **Frontend**: React Native 0.76.9 with Expo SDK 52
- **State Management**: Zustand with MMKV persistence
- **Backend**: Supabase with real-time subscriptions
- **Testing**: Jest + MSW + Testing Library + Jest Extended
- **Widgets**: Native iOS with @bacons/apple-targets
- **Analytics**: PostHog + Sentry

## Current Work Context

### Recent Achievements

- **Habit Organization**: SortModal with optimistic updates and offline support
- **UI Components**: Reusable Button and Icon components with standardized styling
- **Performance**: Optimized state updates achieving ~2-3ms response times
- **Code Organization**: Consolidated UI constants and improved component architecture

### Active Decisions

- **Authentication**: Multi-provider approach (Apple, Google) with MMKV storage
- **State Management**: Zustand + MMKV with offline-first architecture
- **Navigation**: Expo Router v3 with file-based routing
- **Performance**: Non-blocking state updates with background sync

### Immediate Next Steps

1. **UI Polish**: Modal animations, loading states, error handling
2. **Authentication**: Complete Apple/Google Sign-in implementation
3. **Testing**: Set up comprehensive test infrastructure
4. **Performance**: Monitor and optimize remaining operations

   - Updated to use centralized category definitions
   - Improved memoization of category calculations
   - Enhanced type safety with updated interfaces
   - Streamlined data flow from categories to UI

5. **Scoring System Enhancements**
   - Integrated with centralized category system
   - Maintained exponential smoothing algorithm
   - Preserved configurable parameters
   - Updated type definitions for better consistency

### Current Focus

1. **Matrix System**

   - Category management is now centralized
   - All components use unified category definitions
   - Type safety improvements across the system
   - Performance optimizations in matrix calculations

2. **Next Steps**
   - Monitor performance of matrix calculations
   - Consider caching strategies for score history
   - Plan UI improvements for matrix visualization
   - Consider adding category-specific insights

### State Management Refactoring

- Implementing shared store utilities
- Standardizing store patterns
- Improving offline support
- Enhancing error handling

### Achievement System

- Streak-based achievements implementation
- Integration with habits system
- Local state management
- Server synchronization

### Recent Changes

1. Created shared store utilities

   - Base state interface
   - Pending operations handling
   - Error handling utilities
   - AsyncStorage integration

2. Updated achievements store

   - Removed unnecessary functions
   - Integrated shared utilities
   - Improved error handling
   - Enhanced offline support

3. Updated habits store

   - Integrated shared utilities
   - Enhanced completion tracking
   - Improved streak calculation
   - Added progress tracking

4. Optimized achievement system:

- Centralized achievement notifications in achievements store
- Removed duplicate handleAchievementUpdate functions
- Simplified component logic
- Improved performance with proper memoization

22. Performance optimizations:

- Fixed infinite update loops in hooks
- Added solid backgrounds for shadow performance
- Optimized shadow rendering across components
- Removed unused imports and dead code

## Active Decisions

### Store Architecture

- Using Zustand for state management
- Implementing offline-first approach
- Standardizing error handling
- Using shared utilities across stores

### Data Flow

- Optimistic updates for better UX
- Server sync with retry mechanism
- Pending operations for offline support
- Local state as source of truth

### Current Challenges

1. Offline synchronization

   - Handling conflicts
   - Retry mechanisms
   - Data consistency

2. Achievement tracking
   - Streak calculation
   - Progress tracking
   - User feedback

## Next Steps

1. Testing

   - Unit tests for stores
   - Integration tests
   - Offline functionality testing

2. UI Implementation

   - Achievement display
   - Progress indicators
   - Error messages

3. Performance Optimization
   - State updates
   - Data fetching
   - Local storage

## Current Focus (Updated)

### Achievement System Optimization

- Attempted to consolidate achievement calculation functions but reverted due to separation of concerns
- Current implementation maintains distinct functions for:
  1. `calculateNewAchievements`: Handles unlocking new achievements
  2. `calculateAchievementsToRemove`: Manages achievement removal on streak breaks
  3. `getNewlyUnlockedAchievements`: Tracks newly unlocked achievements

### Next Steps

1. Optimize achievements store

   - Review current store implementation
   - Identify potential performance bottlenecks
   - Implement memoization where beneficial
   - Consider using derived stores for computed values

2. Optimize habits store

   - Analyze current data flow
   - Review state management patterns
   - Implement performance optimizations
   - Consider batch updates for multiple habits

3. Optimize hooks
   - Review current hook implementations
   - Identify unnecessary re-renders
   - Implement useMemo and useCallback where beneficial
   - Consider custom hooks for shared logic

### Active Decisions

- Maintaining separate achievement calculation functions for better separation of concerns
- Each function has a clear, single responsibility
- This approach favors maintainability and clarity over code consolidation

### Current Considerations

- Need to balance performance optimizations with code maintainability
- Focus on reducing unnecessary re-renders in React components
- Consider implementing caching strategies for frequently accessed data
- Evaluate the impact of store optimizations on overall app performance

1. Standardized date handling across the application:
   - Migrated to custom dayjs instance from `@/lib/utils/dayjs`
   - Removed direct dayjs imports
   - Updated date operations in hooks:
     - `useHabits`: Improved date comparisons with dayjs methods
     - `useMatrix`: Standardized date handling for matrix calculations
   - Established consistent patterns for:
     - Date normalization
     - Comparisons
     - Day of week calculations
     - Date formatting

## Recent Changes

1. Project initialization with Expo
2. Basic directory structure setup
3. Core dependencies installation
4. Initial documentation creation
5. Implemented habits interface with offline sync
6. Added sync initialization in app layout
7. Setup periodic sync in home tab
8. Added App.md to Memory Bank
9. Implemented `WeekView` and `HabitList` components.
10. Added `AddHabit` modal form.
11. Refactored `HabitList` to use `useHabitsForDate` hook.
12. Renamed `habits.ts` store to `habits_store.ts`.
13. Created `lib/hooks/useHabits.ts` with data selection hooks.
14. Stabilized `useHabitsForDate` dependency using ISO date string.
15. Optimized habit status toggle performance:

- Removed blocking async operations
- Implemented non-blocking state updates
- Added performance timing measurements
- Improved UI responsiveness

16. Enhanced bottom sheet interactions:

- Faster sheet closing animation
- Immediate feedback for status changes

17. Improved HabitItem UI:

- Added visual feedback for skipped state
- Enhanced status indication

18. Optimized habit components:

- Added React.memo for performance optimization
- Removed console.log statements and dead code
- Fixed weekly habit filtering by days of week

19. Fixed habit filtering for weekly habits:

- Implemented proper day-of-week filtering
- Ensured weekly habits only appear on scheduled days

20. Enhanced habit creation form:

- Simplified UI with only essential fields visible
- Added advanced settings section for optional fields
- Corrected form header to always show "Add New Habit"

### Calendar Day Visualization

- Simplified calendar day visualization
- Focused completion status on number only
- Maintained clean visual hierarchy:
  1. White container background
  2. Light blue selected day
  3. Blue circle indicators for completion
  4. Blue text for today

### Current Focus

- Ensuring clear visual feedback for:
  - Day selection
  - Completion status
  - Current day
- Maintaining consistent spacing and alignment
- Optimizing touch targets

## Active Decisions

### Authentication Implementation

- Decision to use multiple auth providers (Apple, Google)
- Token-based authentication approach
- Secure storage strategy with MMKV

### State Management

- Zustand chosen for global state
- MMKV for performance-critical data
- AsyncStorage for larger datasets
- Offline-first architecture with optimistic updates
- Sync strategy with pending operations
- **Pattern:** Use custom hooks (e.g., `useHabitsForDate`) to select and memoize derived data from stores
- **Performance:** Non-blocking state updates for UI operations

### Navigation

- Expo Router v3 implementation
- File-based routing structure
- Deep linking support planning

### Performance Optimizations

1. **State Updates**

   - Identified and removed blocking async operations
   - Implemented background processing for server sync
   - Added performance measurement points
   - Achieved ~2-3ms response time for status updates

2. **UI Responsiveness**
   - Optimized bottom sheet animations
   - Immediate visual feedback
   - Background processing for non-critical operations

## Next Steps

### Immediate Focus: Achievement System UI

1. **Achievement Display**

   - Design and implement achievement list view
   - Create achievement detail modal
   - Add achievement progress tracking
   - Implement achievement filters

2. **Achievement Notifications**

   - Design toast notification layout
   - Add animation and interaction
   - Implement notification queueing
   - Add notification preferences

3. **Achievement Categories**
   - Design category system
   - Implement category filters
   - Add category progress tracking
   - Create category-based views

### Technical Debt & Optimization

1. **Code Organization**

   - Implement ESLint configuration
   - Set up automatic import cleanup
   - Organize component structure
   - Document code patterns

2. **Testing**

   - Set up testing infrastructure
   - Add unit tests for critical paths
   - Implement integration tests
   - Add performance benchmarks

3. **Documentation**
   - Update component documentation
   - Document state management patterns
   - Create contribution guidelines
   - Add setup instructions

### Recent Calendar Optimizations

1. Optimized Calendar Performance:
   - Removed performance logging for cleaner code
   - Pre-calculated cell values during grid generation
   - Simplified component structure with DayCellData interface
   - Improved memoization strategy for cell rendering
   - Reduced date operations during render phase
   - Achieved significant performance improvements

### Next Feature: Notification System

Detailed implementation plan for the notification system:

#### Phase 1: Infrastructure Setup (Week 1)

1. Install and configure Expo Notifications
2. Set up notification permissions handling
3. Implement notification token management
4. Create notification store for state management
5. Design notification interfaces and types

#### Phase 2: Core Notification Features (Week 1-2)

1. Implement local notification scheduling
2. Create notification triggers for:
   - Daily habit reminders
   - Weekly habit reminders
   - Achievement unlocks
   - Streak milestones
3. Add notification grouping and categorization
4. Implement notification queue management

#### Phase 3: User Interface (Week 2)

1. Design and implement notification preferences screen
2. Create notification history view
3. Add notification badges to relevant UI elements
4. Implement in-app notification center
5. Add quick actions for notifications

#### Phase 4: Integration & Testing (Week 3)

1. Integrate with existing habit system
2. Connect with achievement system
3. Implement background task handling
4. Add error handling and retry mechanisms
5. Create comprehensive testing suite

#### Phase 5: Polish & Optimization (Week 3-4)

1. Optimize notification delivery timing
2. Implement smart notification batching
3. Add user engagement analytics
4. Fine-tune notification frequency
5. Implement do-not-disturb handling

### Technical Considerations

- Expo Notifications setup
- Background task handling
- Notification permissions
- Token management
- Cross-platform compatibility

### Success Criteria

1. Users receive timely reminders for habits
2. Achievement notifications are engaging
3. Notification preferences are easily manageable
4. System handles background state efficiently
5. Notifications are properly grouped and categorized

### Supabase Integration Updates (25c50d03)

- Upgraded Supabase client to v2.49.4
- Moved Supabase client to dedicated directory
- Added notifications table and functionality
- Implemented push notification system with Edge Functions
- Removed temporary notification files in favor of Supabase-based solution
- Added push_token field to users table

### Current Focus: Notification System Implementation

### Recently Completed

1. Implemented notification system core components:

   - Database schema with notification types and tables
   - Notification processor function (runs every minute)
   - Habit notification scheduler
   - Streak notification scheduler

2. Optimized habit notifications:
   - Moved timezone filtering to prepareNotifications
   - Improved time comparison logic
   - Added detailed logging for debugging
   - Scheduled notifications in user's timezone

### Current Status

1. Notification System Components:

   - ✅ Database Schema
   - ✅ Notification Processor
   - ✅ Habit Scheduler
   - ✅ Streak Scheduler
   - ⏳ Performance Optimization

2. Performance Considerations:
   - Edge function timeout limit of 5000ms
   - Need to handle large user bases (5000+ users)
   - Current implementation may need batching for scale

### Next Steps

1. Implement batching solution for large user bases
2. Add monitoring and error tracking
3. Test with various timezone scenarios
4. Optimize database queries and processing
5. Add rate limiting and failure handling

### Active Decisions

1. Timezone handling moved to notification preparation
2. Using simple hour comparison instead of complex time ranges
3. Detailed logging for production debugging
4. Need to implement batching for scale

### Technical Constraints

1. Edge function timeout: 5000ms maximum
2. Batch size for Expo: 599 notifications
3. Need to handle multiple timezones efficiently
4. Must maintain notification order and timing accuracy

## Recent Changes

### Testing Infrastructure Setup

1. **Jest Configuration**

   - Added comprehensive test configuration
   - Module name mapping for @/ imports
   - Transform ignore patterns for React Native modules
   - Test file patterns and ignore patterns

2. **Testing Dependencies**

   - MSW for API mocking
   - Jest Extended for enhanced assertions
   - Faker.js for test data generation
   - Testing Library User Event for interactions

3. **Test Scripts**
   - `test`: Run tests with no-tests-pass flag
   - `test:watch`: Watch mode for development
   - `test:coverage`: Coverage reporting

### UI Bug Fixes

1. **Stats Screen Scroll Indicator**
   - Fixed `showsHorizontalScrollIndicator` to `showsVerticalScrollIndicator`
   - Improved user experience with proper scroll behavior
   - Maintained consistent UI patterns

### Package Management

1. **Dependency Updates**
   - React Native Calendars updated to v1.1312.0
   - Added @marceloterreiro/flash-calendar for enhanced calendar features
   - Various testing-related dependencies added

## Active Decisions

### Testing Strategy

- **Unit Testing**: Focus on core business logic and utilities
- **Component Testing**: React Native Testing Library for UI components
- **API Testing**: MSW for mocking Supabase interactions
- **Integration Testing**: End-to-end user workflows

### Development Workflow

- **Test-Driven Development**: Write tests alongside feature development
- **Coverage Goals**: Aim for high coverage on critical paths
- **Continuous Testing**: Watch mode for rapid feedback during development

### Code Quality

- **Type Safety**: Maintain strict TypeScript configuration
- **Test Organization**: Structured test files with clear naming
- **Mock Strategy**: Realistic mocks using MSW and factories

## Next Steps

### Immediate Focus: Test Implementation

1. **Core Tests**

   - Habit store tests
   - Achievement system tests
   - Date utility tests
   - Component rendering tests

2. **Integration Tests**

   - Habit creation and completion flows
   - Achievement unlocking scenarios
   - Widget data synchronization
   - Offline/online state transitions

3. **Performance Tests**
   - State update performance
   - Component rendering benchmarks
   - Memory usage monitoring

### Technical Debt & Optimization

1. **Test Coverage**

   - Achieve >80% coverage on critical paths
   - Document testing patterns and guidelines
   - Set up CI/CD test automation

2. **Code Organization**
   - Implement consistent test file structure
   - Create reusable test utilities
   - Document testing best practices

### Current Challenges

1. **Test Setup Complexity**

   - React Native testing environment configuration
   - Supabase mocking strategies
   - Widget testing approaches

2. **Performance Testing**
   - Measuring state update performance
   - Testing offline functionality
   - Widget synchronization testing

## Active Context Summary

The project has significantly improved its development infrastructure with comprehensive testing setup. The focus has shifted to implementing robust tests while continuing UI polish and bug fixes. The recent scroll indicator fix demonstrates ongoing attention to user experience details.

Key areas of active development:

- Writing comprehensive test suites
- Continuing UI improvements and bug fixes
- Preparing for authentication implementation
- Maintaining high code quality standards
