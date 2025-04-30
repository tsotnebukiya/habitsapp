import SwiftUI
import WidgetKit
import AppIntents
import os // Import OSLog

private let viewLogger = Logger(subsystem: "com.vdl.habitapp.widget", category: "InteractiveViews") // Define logger

struct InteractiveWidgetEntryView : View {
    var entry: InteractiveProvider.Entry
    @Environment(\.widgetFamily) var family

    // Determine max habits based on widget size
    private var maxHabits: Int {
        switch family {
        case .systemSmall:
            return 2
        case .systemMedium:
            return 4 // Updated from 3
        case .systemLarge:
            return 6 // Added large
        @unknown default:
            return 2 // Default to small size limit
        }
    }

    var body: some View {
        // Removed header Text("Complete Today:") and its padding
        // Added switch statement for layout based on family
        switch family {
        case .systemSmall:
            VStack(spacing: 8) {
                 // Use .id for ForEach identifier assuming Habit conforms to Identifiable or has a unique id
                ForEach(entry.habits.prefix(maxHabits), id: \.id) { habit in
                    HabitToggleButton(habit: habit)
                    // Add divider if not the last item in the *displayed* list
                    if habit.id != entry.habits.prefix(maxHabits).last?.id {
                        Divider()
                    }
                }
                // Add Spacer to push content up if fewer than maxHabits are displayed
                if entry.habits.count < maxHabits {
                     Spacer()
                 }
            }
            .padding() // Add padding around the VStack for the small widget
        case .systemMedium:
            // Define grid columns for 2x2 layout
            let columns: [GridItem] = Array(repeating: .init(.flexible()), count: 2)
            LazyVGrid(columns: columns, spacing: 12) { // Added spacing between grid items
                ForEach(entry.habits.prefix(maxHabits), id: \.id) { habit in
                     HabitToggleButton(habit: habit)
                 }
             }
            .padding() // Add padding around the LazyVGrid
        case .systemLarge:
            // Use VStack similar to small, maxHabits handles the limit
            VStack(spacing: 8) {
                ForEach(entry.habits.prefix(maxHabits), id: \.id) { habit in
                    HabitToggleButton(habit: habit)
                    // Add divider if not the last item in the *displayed* list
                    if habit.id != entry.habits.prefix(maxHabits).last?.id {
                        Divider()
                    }
                }
                // Add Spacer to push content up if fewer than maxHabits are displayed
                 if entry.habits.count < maxHabits {
                      Spacer()
                  }
            }
            .padding() // Add padding around the VStack for the large widget
        @unknown default:
            // Fallback to small layout for unknown sizes
             VStack(spacing: 8) {
                 // Use .id for ForEach identifier assuming Habit conforms to Identifiable or has a unique id
                ForEach(entry.habits.prefix(maxHabits), id: \.id) { habit in
                    HabitToggleButton(habit: habit)
                    // Add divider if not the last item in the *displayed* list
                    if habit.id != entry.habits.prefix(maxHabits).last?.id {
                        Divider()
                    }
                }
                // Add Spacer to push content up if fewer than maxHabits are displayed
                if entry.habits.count < maxHabits {
                     Spacer()
                 }
            }
            .padding() // Add padding around the VStack for the default widget
        }
        // Padding will be applied within each case
    }
}

struct HabitToggleButton: View {
    let habit: Habit

    
    // Get today's date string key (important to match the logic in the Intent)
    private var todayDateKey: String {
        let formatter = ISO8601DateFormatter()
        // IMPORTANT: Must match the formatter settings used in ToggleHabitIntent and HabitStore
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        formatter.timeZone = TimeZone(secondsFromGMT: 0) // Consistent timezone
        let now = Date()
        var calendar = Calendar.current
        calendar.timeZone = TimeZone(secondsFromGMT: 0)! // Ensure UTC
        let startOfDay = calendar.startOfDay(for: now)
        return formatter.string(from: startOfDay) // Use current date for toggle
    }
    
    // Determine if the habit is completed today based on the key
    private var isCompletedToday: Bool {
        habit.weeklyStatus[todayDateKey] ?? false
    }

    var body: some View {
        // Use Button with the AppIntent
        Button(intent: ToggleHabitIntent(habitID: habit.id)) {
             // HStack is now the styled label
             HStack(spacing: 8) { // Added spacing for clarity
                Text(habit.icon)
                    .font(.title3) // Slightly smaller icon
                Text(habit.name)
                    .font(.callout) // Slightly smaller text
                    .lineLimit(1) // Prevent wrapping in tight spaces
                    // Removed Spacer() and Image()
            }
            .padding(.vertical, 8) // Internal padding
            .padding(.horizontal, 12)
            .frame(maxWidth: .infinity, alignment: .leading) // Ensure HStack fills width
            .background(isCompletedToday ? Color.green.opacity(0.8) : Color.gray.opacity(0.2)) // Conditional background
            .foregroundColor(isCompletedToday ? .white : .primary) // Conditional text color
            .cornerRadius(10) // Rounded corners
        }
        .buttonStyle(.plain) // Use plain style to make the styled HStack tappable
        // Removed .padding(.horizontal)
        .onAppear {
                viewLogger.info("TodayDateKey: \(todayDateKey, privacy: .public)")
viewLogger.info("""
HabitToggleButton:
- Name: \(habit.name, privacy: .public)
- ID: \(habit.id, privacy: .public)
- WeeklyStatus: \(String(describing: habit.weeklyStatus), privacy: .public) 
- IsCompletedToday: \(isCompletedToday, privacy: .public)
""")
            }
    }
} 
