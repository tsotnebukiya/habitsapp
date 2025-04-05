# Active Context

## Current Focus

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
