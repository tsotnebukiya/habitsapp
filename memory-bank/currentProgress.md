# Widget Implementation Progress

## Goal

Implement Small, Medium and Large iOS widgets using @bacons/expo-apple-targets based on provided specs.

## Implementation Plan & Status

### Subtask 1: Setup Verification & Library Understanding ✅

- ✅ Review targets/widget directory and files (expo-target.config.js, Swift files)
  - Reviewed and cleaned up unnecessary files (AppIntent.swift, WidgetControl.swift, WidgetLiveActivity.swift)
  - Simplified widgets.swift to use StaticConfiguration
  - Updated index.swift to remove unnecessary references
- ✅ Read relevant sections of the @bacons/expo-apple-targets README (config, linking, workflow)
- ✅ Verify @bacons/apple-targets plugin in app.json
- ✅ Check/note the need for ios.appleTeamId in app.json

### Subtask 2: Data Sharing Investigation

- [ ] Prioritize UserDefaults and App Groups based on library docs
- [ ] Define and configure an App Group ID in Xcode for both targets
- [ ] Modify React Native app (Zustand) to write habit data to shared UserDefaults
- [ ] Implement Swift code to read from shared UserDefaults
- [ ] Plan widget data update strategy

### Subtask 3: Small Widget Implementation (SwiftUI)

- [ ] Design Small widget UI in SwiftUI based on specs
  - [ ] Create compact layout for today's habits
  - [ ] Design progress indicator
  - [ ] Optimize layout for both home screen and lock screen
- [ ] Implement TimelineProvider to fetch data from UserDefaults
- [ ] Populate SwiftUI view with today's habit data
- [ ] Implement tap interaction to open the app
- [ ] Test different widget families (systemSmall, accessoryCircular, accessoryRectangular, accessoryInline)

### Subtask 4: Medium Widget Implementation (SwiftUI)

- [ ] Design Medium widget UI in SwiftUI based on specs
- [ ] Implement TimelineProvider to fetch data from UserDefaults
- [ ] Populate SwiftUI view
- [ ] Implement completion toggle interaction
- [ ] Implement tap interaction to open the app

### Subtask 5: Large Widget Implementation (SwiftUI)

- [ ] Design Large widget UI in SwiftUI based on specs
- [ ] Update/create TimelineProvider for weekly data
- [ ] Populate Large widget SwiftUI view
- [ ] Implement habit completion interactions
- [ ] Implement tap interaction for specific days

### Subtask 6: Testing & Refinement

- [ ] Run npx expo prebuild -p ios --clean
- [ ] Open Xcode project (xed ios)
- [ ] Build and run the app, add widgets
- [ ] Test loading, data, interactions, updates, edge cases
- [ ] Debug using Xcode/Console.app
- [ ] Refine UI/UX

## Current Status

- Completed initial part of Subtask 1: cleaned up and simplified widget implementation
- Next: Continue with Subtask 1 by verifying library setup and configuration
