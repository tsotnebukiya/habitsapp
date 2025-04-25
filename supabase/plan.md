# Notification System Implementation Plan

## Overview

The notification system consists of four main components:

1. Three scheduler functions for different notification types
2. One processor function that runs every minute to send notifications

## Current Implementation Status

### ✅ Database Schema

```sql
-- Notification types enum
CREATE TYPE notification_type AS ENUM (
    'HABIT',
    'MORNING',
    'EVENING',
    'STREAK',
    'GENERAL'
);

-- Notifications table
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

-- Performance index for processor queries
CREATE INDEX idx_notifications_unprocessed_scheduled
ON notifications(scheduled_for)
WHERE processed = false;
```

### ✅ Notification Processor

- Implemented in `supabase/functions/notification-processor/index.ts`
- Runs every minute
- Processes notifications in batches of 599
- Handles invalid tokens and errors
- Uses efficient indexing for queries

## Next Steps: Scheduler Implementation

### 1. Morning/Evening Scheduler

- **Status**: To be implemented
- **File**: `supabase/functions/fixed-time-scheduler/index.ts`
- **Schedule**: Runs hourly (0 \* \* \* \*)
- **Purpose**: Schedule 7 AM and 7 PM notifications
- **Operation**:
  - Identifies users whose local time will be 7 AM or 7 PM in the next hour
  - Creates notifications with type 'MORNING' or 'EVENING'

### 2. Streak Achievement Scheduler

- **Status**: To be implemented
- **File**: `supabase/functions/streak-scheduler/index.ts`
- **Schedule**: Runs hourly (0 \* \* \* \*)
- **Purpose**: Schedule 2 PM streak check notifications
- **Operation**:
  - Identifies users whose local time will be 2 PM in the next hour
  - Creates notifications with type 'STREAK'

### 3. Individual Habit Scheduler

- **Status**: To be implemented
- **File**: `supabase/functions/habit-scheduler/index.ts`
- **Schedule**: Runs hourly (0 \* \* \* \*)
- **Purpose**: Schedule user-specific habit reminders
- **Operation**:
  - Finds habits with reminder_time in the next hour based on user's timezone
  - Creates notifications with type 'HABIT'

## Implementation Order

1. Fixed-time scheduler (Morning/Evening)

   - Simplest to implement
   - Tests basic timezone handling

2. Habit scheduler

   - Builds on timezone handling
   - Adds habit-specific logic

3. Streak scheduler
   - Most complex logic
   - Requires achievement data processing

## Required Environment Variables

```bash
SUPABASE_URL=your_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
EXPO_ACCESS_TOKEN=your_expo_token
```

## Monitoring Considerations

- Each function includes detailed logging
- Track notification delivery success rates
- Monitor invalid token rates
- Watch for timezone calculation issues
