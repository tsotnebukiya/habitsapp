# Active Context

## Current Development Status

HabitsLab is a fully functional habit tracking application with core features implemented and operational. Recent major updates include a comprehensive dependency update with Facebook SDK integration, iOS widget system overhaul with configurable widgets, achievement system improvements, UI simplification, and store review integration.

## Recently Completed Major Work ✅

### 1. Major Dependency Update & Facebook SDK Integration (Latest)

- **Expo SDK Updates**: Comprehensive updates across all Expo packages to latest versions
  - expo-apple-authentication: 6.4.2→7.1.3
  - expo-application: 5.9.1→6.0.2
  - expo-notifications: 0.28.19→0.29.14
  - expo-file-system: 17.0.1→18.0.12
  - And many other Expo packages updated
- **Facebook SDK Integration**: Added react-native-fbsdk-next (^13.4.1) for Facebook authentication
- **Enhanced Authentication**: Added expo-auth-session (~6.0.3) and expo-crypto (~14.0.2) for improved auth capabilities
- **Facebook Constants**: Added FACEBOOK_APP_ID and FACEBOOK_CLIENT_TOKEN configuration
- **React Native Updates**: Updated screens, svg, webview, and other RN packages
- **Development Tools**: Updated ESLint configuration and TypeScript libraries
- **Widget Improvements**: Enhanced habit display logic in InteractiveViews.swift using displayHabits pattern

### 2. iOS Widget System Overhaul (Latest)

- **Configurable Widget Architecture**: Complete redesign with user-selectable habit display
- **Shared Configuration System**: Unified `HabitConfigurationIntent` and `SharedHabitConfigurationProvider` for both widgets
- **Enhanced UI Design**: Modern card-based layout with progress visualization and rounded corners
- **Interactive Improvements**: Better action buttons, completion states, and visual feedback
- **Widget Customization**: Users can now select which habits appear in their widgets
- **Technical Architecture**: Moved from `StaticConfiguration` to `AppIntentConfiguration` for advanced features

### 3. Widget UI & UX Enhancements

- **Visual Design Overhaul**: Complete redesign of `InteractiveViews.swift` with modern card layouts
- **Progress Visualization**: Color-based progress overlays showing habit completion status
- **Icon System**: Improved handling of both emoji and SF Symbol icons with proper tinting
- **Multi-Size Support**: Optimized layouts for small (2 habits), medium (4 habits), and large (10 habits) widgets
- **Action States**: Dynamic action buttons (plus for incomplete, checkmark for completed)
- **App Integration**: Added `OpenAppIntent` for seamless navigation back to main app

### 4. Widget Data & Configuration

- **Enhanced Mock Data**: Comprehensive test data with realistic completion patterns across 10 habits
- **Entity System**: New `HabitEntity` and `HabitEntityQuery` for widget configuration
- **Configurable Entry**: Replaced `SimpleEntry` with `ConfigurableEntry` supporting habit selection
- **Provider Consolidation**: Removed separate `InteractiveProvider` in favor of shared configuration approach

## Current Focus Areas

### 1. Facebook Authentication Implementation 🔄

- **Facebook SDK Integration**: Implement Facebook login using newly added react-native-fbsdk-next
- **Authentication Flow**: Integrate Facebook auth with existing Apple/Google authentication system
- **User Experience**: Seamless multi-provider authentication with consistent UI
- **Security**: Proper token handling and secure storage for Facebook authentication

### 2. Internationalization (i18n) Implementation 🔄

- **i18next Integration**: Added i18next and react-i18next for multi-language support
- **Translation Utilities**: Created comprehensive translation helpers for measurement units, categories, progress text, and achievements
- **Dynamic Localization**: Support for proper pluralization and dynamic value insertion
- **Fallback Strategy**: Default values ensure app functionality even without translations

### 3. Enhanced User Experience Features 🔄

- **Picker Component**: Added @react-native-picker/picker for better selection interfaces
- **Keyboard Handling**: Integrated react-native-keyboard-aware-scroll-view for improved form interactions
- **User Account Management**: Added delete-user edge function for GDPR compliance
- **Feedback System**: Implemented email-resend edge function for user feedback collection

### 4. Achievement System Overhaul ✅

- **Simplified Achievement Structure**: Removed description and icon fields for cleaner data model
- **Enhanced Milestone System**: Added new achievement milestones (5, 45, 100, 200 days)
- **Automatic Achievement Display**: Achievements now show automatically when unlocked
- **Store Review Integration**: Automatic review prompts on first achievement milestones (7, 14, 21 days)

### 5. UI Simplification & Component Cleanup ✅

- **Modal System Streamlined**: Removed ConfirmationModal and simplified modal navigation
- **Component Removal**: Deleted unused NumericInput component (108 lines)
- **ChooseHabitModal Integration**: Removed from HabitsPicker for cleaner UI flow
- **Code Quality**: Removed debug console.log statements and improved imports

### 6. Category System Enhancement ✅

- **Display Color Configuration**: Added category-specific color schemes for better visual hierarchy
- **Matrix Calculations**: Enhanced with difference tracking from baseline scores
- **Total Category**: Added unified total category with proper display configuration
- **Baseline Comparisons**: Improved category display with progress from starting point

### 7. Store Review Integration ✅

- **expo-store-review**: Added native store review functionality
- **Milestone Tracking**: Tracks which review milestones have been prompted
- **Smart Prompting**: Only prompts once on first achievement milestone
- **Delayed Execution**: 2-second delay to let achievement celebration show first

### 8. Testing Infrastructure Setup ✅

- Comprehensive testing framework implementation
- Jest configuration with proper module mapping
- MSW (Mock Service Worker) for API mocking
- Testing utilities and factories setup
- Jest Extended for enhanced matchers

### 9. UI Polish & Bug Fixes

- Fixed scroll indicator visibility issues in stats screen
- Improved user experience with proper scroll behavior
- Ongoing modal animations and loading states
- Accessibility enhancements

### 10. Development Workflow Improvements

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
4. **Widget Testing**: Comprehensive testing of new configurable widget system and user flows
5. **UI Polish**: Complete modal animations, loading states, error handling

### Medium Priority

1. **Advanced Widget Features**: Explore additional widget capabilities and configurations
2. **Performance**: Bundle optimization, memory management, widget performance monitoring
3. **Documentation**: Widget architecture documentation and user guides

## Current Architecture Status

### Technology Stack

- **Frontend**: React Native 0.76.9 with Expo SDK 52
- **State Management**: Zustand with MMKV persistence
- **Backend**: Supabase with real-time subscriptions
- **Testing**: Jest + MSW + Testing Library + Jest Extended
- **Widgets**: Native iOS with @bacons/apple-targets (recently overhauled with configurable architecture)
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

The project has recently completed a major iOS widget system overhaul, implementing configurable widgets with modern UI design and user customization capabilities. Current focus areas include widget testing, internationalization implementation, user account features, and form improvements. The development infrastructure has been significantly enhanced with comprehensive testing setup and improved development workflows.

## Current Challenges

1. **Widget Testing & Validation**

   - Testing new configurable widget system
   - Validating multi-size widget layouts
   - Ensuring proper habit selection and display

2. **Internationalization Integration**

   - Implementing language selection UI
   - Creating translation files for supported languages
   - Testing i18n functionality across the app

3. **User Experience Enhancements**
   - Integrating new UI components (picker, keyboard-aware scroll)
   - Implementing user account management features
   - Improving form interactions and feedback
