# Active Context

## Current Focus

We are focusing on implementing the Achievement Display UI components and the Notification System after completing calendar optimizations.

### Achievement UI Implementation Progress

- ✅ Achievement cards display similar to the provided design
  - ✅ Achievement icon/badge
  - ✅ Achievement name and description
  - ✅ Unlocked/locked state display
- ✅ Achievement unlock modal
  - ✅ Celebration animation with confetti
  - ✅ Achievement details
  - ✅ Multi-achievement support with indicators
- In progress:
  - Refinements to achievement list view
  - Additional animations and transitions
  - Achievement progress indicators

### Recent Changes

1. Added modal system infrastructure:

   - ✅ Created `modal_store.ts` for centralized modal state management
   - ✅ Implemented `ModalContainer` component for app-wide modals
   - ✅ Added support for different modal types (achievement, confirmation, settings)

2. Implemented achievement UI components:

   - ✅ Added `AchievementsModal` for displaying unlocked achievements
   - ✅ Integrated confetti animation for celebrations
   - ✅ Created confirmation dialog for important actions
   - ✅ Added pagination for multiple achievements

3. Improved storage performance:

   - ✅ Migrated from AsyncStorage to MMKV for faster data persistence
   - ✅ Optimized store serialization/deserialization
   - ✅ Enhanced achievement calculation logic

4. Enhanced habit interaction:

   - ✅ Improved habit toggle logic with action-based API
   - ✅ Refactored status management for better user experience
   - ✅ Fixed streak calculation to properly account for active habits

5. UI improvements:
   - ✅ Updated MatrixGridCell to use text-based icons
   - ✅ Enhanced visual feedback for habit interactions

### Matrix Score System

- ✅ Matrix categories defined (physical, mental, emotional, spiritual)
- ✅ Habit-to-matrix mapping implemented
- ✅ Score calculations working
- ✅ Matrix visualization with updated icons

### 2-Week Development Plan

#### Week 1: Complete Core Habit System ✅

1. **Enhanced Habit Creation** ✅

   - ✅ Added predefined habit templates by category
   - ✅ Implemented template selection UI
   - ✅ Completed custom habit form fields
   - ✅ Ensured proper matrix category assignment

2. **Habit Interaction System** ✅

   - ✅ Created unified habit detail modal
   - ✅ Implemented uncomplete functionality
   - ✅ Added increment/decrement controls
   - ✅ Added edit and delete options

3. **Matrix Score System** ✅
   - ✅ Defined matrix categories (physical, mental, emotional, spiritual)
   - ✅ Created habit-to-matrix mapping
   - ✅ Implemented score calculations
   - ✅ Designed matrix visualization

#### Week 2: Analytics & Engagement

1. **Navigation & Structure** ✅

   - ✅ Implemented bottom tab navigation
   - ✅ Created Home and Stats tabs
   - ✅ Ensured proper state management

2. **Achievement System** ✅

   - ✅ Designed core achievement types
   - ✅ Implemented unlocking logic
   - ✅ Created achievement notifications
   - ✅ Designed and implemented achievement display UI

3. **Statistics View** ⏳
   - Implement key charts
   - Create habit comparison view
   - Connect to habit data
   - Add matrix score history

### Market Research Insights

Based on our market analysis of habit tracking apps:

- Users value simplicity combined with powerful tracking
- AI-powered features are highly desirable
- Visual design and feedback drive engagement
- Balance between simplicity and functionality is key
- Matrix/category organization helps users balance life areas
- Gamification elements enhance motivation

The project is currently in its initial setup phase with the following areas of focus:

1. **Core Infrastructure**

   - Basic project structure established
   - Core dependencies installed
   - Development environment setup
   - Sync mechanism implemented

2. **Authentication System**

   - Multiple provider integration pending
   - Token management implementation needed
   - User flow design in progress

3. **State Management & Hooks**

   - Zustand stores setup
   - MMKV/AsyncStorage integration complete
   - Type definitions in progress
   - Offline-first sync pattern established
   - Custom hooks for data selection (e.g., `useHabitsForDate`) established as a pattern.

4. **Documentation**
   - Core files established
   - App.md added for app-specific documentation
   - Memory Bank structure maintained
   - Sync documentation complete

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

### Immediate Tasks

1. Complete authentication system implementation
2. Finalize state management type definitions
3. Set up PostHog analytics
4. Configure Sentry error tracking
5. Test sync mechanism with poor network conditions
6. Implement habit completion tracking UI/logic.

### Upcoming Work

1. UI component library development
2. Testing infrastructure setup
3. Documentation expansion
4. Performance optimization

## Known Issues

1. Environment variable setup pending
2. Authentication flow incomplete
3. Type definitions need refinement
4. Testing infrastructure not configured
5. `[RemoteTextInput]` logs appearing (considered benign for now).

## Current Considerations

1. **Performance**

   - ✅ Status toggle optimization complete (~2-3ms)
   - ✅ Bottom sheet animation speed improved
   - ✅ Non-blocking state updates implemented
   - Monitoring needed for other operations

2. **Security**

   - Token management implementation
   - Secure storage setup
   - API security configuration
   - Data encryption during sync

3. **Developer Experience**
   - Documentation improvements needed
   - Development workflow optimization
   - Testing strategy implementation
   - Sync debugging tools needed

## Questions to Resolve

1. ✅ Best practices for offline data sync
2. Authentication flow edge cases
3. ✅ State persistence strategy (MMKV/AsyncStorage)
4. Performance optimization approach
5. Sync conflict resolution edge cases
6. ✅ Optimal pattern for selecting/memoizing derived state from Zustand (using custom hooks with `useMemo`).

## Questions Resolved

1. ✅ Best practices for offline data sync
2. ✅ State persistence strategy (MMKV/AsyncStorage)
3. ✅ Optimal pattern for selecting/memoizing derived state
4. ✅ Performance optimization for status updates
5. ✅ UI responsiveness improvements

## Next Steps

1. Apply similar non-blocking patterns to other operations
2. Monitor and optimize other UI interactions
3. Consider adding loading indicators for longer operations
4. Document performance measurement results

### Next Steps

1. Test calendar visualization with:
   - Different completion combinations
   - Multiple days selected
   - Edge cases (no habits, all completed)
2. Consider adding:
   - Haptic feedback for day selection
   - Smooth transitions between states
   - Accessibility improvements

### Active Decisions

1. Calendar Visualization:
   - Keep container background white
   - Use light blue for selected day
   - Focus completion status on number
   - Use circles for completion indicators
   - Blue text for today's date

### Matrix System Refactoring (Latest)

1. **Category Management Centralization**

   - Moved all category definitions to `HabitTemplates.ts`
   - Created `CATEGORY_IDS` constant as single source of truth
   - Updated `CATEGORIES` array with complete metadata
   - Refactored habit templates to use centralized categories
   - Improved type safety with TypeScript literal types

2. **Matrix Hook Optimization**

   - Updated to use centralized category definitions
   - Improved memoization of category calculations
   - Enhanced type safety with updated interfaces
   - Streamlined data flow from categories to UI

3. **Scoring System Enhancements**
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
