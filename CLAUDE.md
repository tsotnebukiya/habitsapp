# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start                # Expo dev server
npm run dev              # Dev server with APP_VARIANT=development
npm run ios              # Build & run iOS
npm run android          # Build & run Android
npm run compile          # TypeScript typecheck (tsc)
npm test                 # Jest tests
npm run test:watch       # Jest watch mode
npm run test:coverage    # Jest coverage
npm run supabase:typegen # Regenerate Supabase types from schema
```

After code changes, run `npm run compile` to typecheck.

## Architecture

**React Native (0.76) + Expo 52 + Expo Router 4** habit-tracking app ("HabitsLab") with offline-first Supabase sync.

### Routing (`app/`)

File-based Expo Router. `(app)/` = protected routes with tab navigation (home, stats, achievements, settings). `onboarding/` = auth flow (login, wizard, notifications). Modal routes use `presentation: 'modal'`.

### State Management (`lib/`)

Zustand stores persisted to MMKV (encrypted):

- **`useHabitsStore`** (`lib/habit-store/store.ts`) — main store with slices: HabitSlice, CompletionSlice, CalendarSlice, SyncSlice, AchievementSlice. Persists Maps as arrays via custom serializer. Pending operations queue for offline sync.
- **`useUserProfileStore`** — Supabase `users` table mirror with optimistic updates
- **`useAppStore`** — global state (language, notifications, review milestones)
- **`useModalStore`** — centralized modal management
- **Form stores** — `useAddHabitStore`, `useUpdateHabitStore`, `useOnboardingStore`

### Backend (`supabase/`)

Supabase PostgreSQL with RLS. Tables: `users`, `habits`, `habit_completions`, `user_achievements`. Edge functions (Deno) handle push notifications (daily-update, streak milestones, habit reminders). Auth via Google, Apple, Facebook OAuth + email/password.

### Key Patterns

- **Offline-first**: MMKV is primary source, pending ops queue retries failed Supabase writes with exponential backoff. Sync on app launch.
- **Optimistic updates**: UI updates immediately, server sync is non-blocking background work.
- **Matrix scoring**: 5 categories (Body/Mind/Heart/Spirit/Work), DPS 0-100 per category, DMS uses exponential smoothing over 14 days. Logic in `lib/utils/achievements.ts`.
- **iOS widgets**: App Group `group.com.vdl.habitapp.widget`, native Swift in `targets/widget/`, bridged via `widget-storage` native module. Calendar widget + interactive toggle widget.
- **i18n**: i18next with translations in `lib/translations/`. Hook: `useTranslation`.

### Path Alias

`@/*` maps to project root (e.g., `@/lib/hooks/useHabits`).

### Key Libraries

- UI: `react-native-paper`, `@gorhom/bottom-sheet`, `react-native-calendars`
- Animations: `react-native-reanimated`
- Storage: `react-native-mmkv` (primary), `async-storage` (auth tokens)
- Analytics: Sentry (crashes), PostHog (events)
- Monetization: Superwall (paywalls/subscriptions)
- Dates: dayjs with UTC/timezone/isoWeek plugins (`lib/utils/dayjs.ts`)
