# Designer Description: Habit Tracking App

## Project Context

Our habit tracking app currently exists as an MVP with the following implemented features:

- **Onboarding Flow**: Basic intro screens, sign-up, and login functionality
- **Main Navigation**: Tab-based structure (Home, Stats, Settings)
- **Habit Management**: Add habit flow, habit listing, habit details view, weekly view
- **Basic Statistics**: Simple stats visualization

## Pages & Components to Design

### 1. Main Dashboard

#### Main Habit Tracking Screen

- **Purpose**: Central hub for viewing and tracking daily habits
- **Components**:
  - Today's date and day display
  - Habit list with completion toggles
  - Weekly day selector (Mon-Sun)
  - Quick-add habit button
  - Progress summary card (completion percentage)
- **Key Interactions**:
  - Tap to complete habit
  - Long Tap habit for details
  - Swipe between days of the week

#### Weekly View

- **Purpose**: Provide weekly overview of habit completion
- **Components**:
  - 7-day grid with habit completion indicators
  - Date selector
  - Completion percentage per day
  - Visual streak indicators
- **Key Interactions**:
  - Tap day to view details
  - Swipe between weeks
  - Mark habits complete directly from weekly view

### 2. Habit Creation Flow

#### Category Selection Screen

- **Purpose**: Allow users to select habit category before creation
- **Components**:
  - Category cards with icons
  - Category descriptions
  - Search functionality
  - Continue button
- **Key Interactions**:
  - Tap to select category
  - Scroll through categories
  - Search for specific categories

#### Custom Habit Creation Form

- **Purpose**: Allow users to define custom habit parameters
- **Components**:
  - Habit name input field
  - Description field
  - Icon selection grid
  - Color picker
  - Frequency selector (daily, specific days, etc.)
  - Reminder toggle
  - Time picker for reminders
- **Key Interactions**:
  - Input text fields
  - Select icon/color
  - Configure frequency options
  - Set reminder times

#### Habit Configuration Options

- **Purpose**: Additional configuration for habit tracking
- **Components**:
  - Goal setting fields (quantity, duration)
  - Unit selection (minutes, times, etc.)
  - Success criteria definition
  - Optional notes field
  - Save button
- **Key Interactions**:
  - Input numerical goals
  - Select from dropdown options
  - Toggle advanced settings
  - Save configuration

### 3. Habit Detail Modal

#### Bottom Sheet Details View

- **Purpose**: Display detailed information about a specific habit
- **Components**:
  - Habit name and icon
  - Completion status
  - Streak information
  - Description
  - Progress chart
  - Edit and delete buttons
- **Key Interactions**:
  - Swipe up for full details
  - Mark complete/incomplete
  - Access edit options
  - View historical data

#### Tracking Functionality

- **Purpose**: Allow detailed tracking within the habit modal
- **Components**:
  - Counter for quantity-based habits
  - Timer for duration-based habits:
    - Circular progress indicator
    - Time display (countdown/up)
    - Start/pause/stop buttons
    - Preset time options
    - Visual states (inactive, active, paused, completed)
  - Notes field for the day
  - Check-in option
- **Key Interactions**:
  - Increment/decrement counters
  - Start/pause/stop timer
  - Reset timer
  - Select preset durations
  - Receive completion notification
  - View timer session history
  - Add notes for the day

#### Edit/Delete Options

- **Purpose**: Modify or remove existing habits
- **Components**:
  - Edit form fields
  - Delete confirmation dialog
  - Archive option
  - Reset streak option
- **Key Interactions**:
  - Edit habit details
  - Confirm deletion
  - Archive instead of delete
  - Reset progress data

### 4. Statistics Page

#### Matrix Grid and Streak/Achievements Tab

- **Purpose**: Visual representation of habit consistency
- **Components**:
  - Heatmap grid showing completion patterns
  - Current and best streak display
  - Achievement badges
  - Consistency percentage
- **Key Interactions**:
  - Tap day for details
  - Toggle between different time periods
  - Filter by habit category

#### Calendar Stats Tab

- **Purpose**: Calendar view of habit data
- **Components**:
  - Monthly calendar with completion indicators
  - Day detail on selection
  - Progress over time chart
  - Monthly success rate
- **Key Interactions**:
  - Navigate between months
  - Select specific days
  - Toggle data visualization options

### 5. Settings Page

#### User Preferences

- **Purpose**: Customize app experience
- **Components**:
  - Theme selection (light/dark)
  - Default view options
  - Start of week preference
  - Sound/vibration toggles
- **Key Interactions**:
  - Toggle switches
  - Select from options
  - Preview changes

#### App Configuration

- **Purpose**: App-wide settings
- **Components**:
  - Notification settings
  - Data backup options
  - Privacy settings
  - Language selection
- **Key Interactions**:
  - Configure notification preferences
  - Set up backup schedule
  - Manage data sharing preferences

#### Account Settings

- **Purpose**: Manage user account
- **Components**:
  - Profile information
  - Email/password update
  - Sign out button
  - Delete account option
- **Key Interactions**:
  - Edit profile data
  - Change authentication details
  - Confirm account actions

### 6. Widget Designs

#### Small Widget (1x1)

- **Purpose**: Quick habit completion for a single habit
- **Components**:
  - Habit name and icon
  - Completion toggle
  - Streak counter
- **Key Interactions**:
  - Tap to complete
  - Tap and hold for app launch

#### Medium Widget (2x1)

- **Purpose**: Today's habits with completion tracking
- **Components**:
  - Date display
  - List of today's habits (3-4)
  - Completion toggles
  - Overall progress indicator
- **Key Interactions**:
  - Mark habits complete
  - Tap to open app to that day

#### Large Widget (4x2)

- **Purpose**: Weekly overview with completion tracking
- **Components**:
  - 7-day grid
  - Top habits for each day
  - Completion status indicators
  - Weekly progress bar
- **Key Interactions**:
  - Complete habits directly
  - Tap day to open app to that day
  - View weekly progress at a glance

### 7. Onboarding Flow

#### Question Screens

- **Purpose**: Collect user preferences and goals
- **Components**:
  - Question text
  - Visual illustrations
  - Progress indicator
  - Next/back buttons
- **Key Interactions**:
  - Read questions
  - Navigate through questions
  - Track progress through onboarding

#### Answer UI Components

- **Purpose**: Various input methods for questions
- **Components**:
  - Multiple choice selections
  - Slider inputs
  - Text input fields
  - Checkbox lists
- **Key Interactions**:
  - Select options
  - Adjust sliders
  - Input text
  - Multi-select where appropriate

#### Progress Indicators

- **Purpose**: Show advancement through onboarding
- **Components**:
  - Step indicator (e.g., "Step 3 of 5")
  - Progress bar
  - Page dots
  - Completion percentage
- **Key Interactions**:
  - View current progress
  - Navigate to specific steps (if allowed)

### 8. Notification Modals

#### Permission Request Designs

- **Purpose**: Request system notification permissions
- **Components**:
  - Explanatory text
  - Benefit illustrations
  - Allow/Skip buttons
  - "Don't ask again" option
- **Key Interactions**:
  - Grant permissions
  - Skip for now
  - Permanently dismiss

#### Achievement Notification Designs

- **Purpose**: Celebrate user milestones
- **Components**:
  - Achievement icon/badge
  - Congratulatory text
  - Streak information
  - Share option
- **Key Interactions**:
  - View achievement details
  - Dismiss notification
  - Share achievement
  - Open related app section

### 9. Achievement System

#### Achievement Badges

- **Purpose**: Gamified rewards for consistency and milestones
- **Components**:
  - Badge designs for different achievements
  - Locked/unlocked states
  - Progress indicators for incomplete badges
  - Badge details view
- **Key Interactions**:
  - View badge collection
  - Tap for achievement details
  - See requirements for locked badges

#### Streak Celebration

- **Purpose**: Motivate users by celebrating streaks
- **Components**:
  - Animated celebration visuals
  - Streak milestone numbers
  - Encouraging messages
  - Share option
- **Key Interactions**:
  - View celebration
  - Share achievement
  - Continue to app

#### Progress Visualization

- **Purpose**: Visual representation of habit journey
- **Components**:
  - Timeline of achievements
  - Growth indicators
  - Milestone markers
  - Comparative statistics
- **Key Interactions**:
  - Scroll through journey
  - Explore milestones
  - View detailed statistics
