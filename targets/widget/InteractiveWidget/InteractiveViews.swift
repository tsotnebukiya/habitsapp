import SwiftUI
import WidgetKit
import AppIntents
import os // Import OSLog

private let viewLogger = Logger(subsystem: "com.vdl.habitapp.widget", category: "InteractiveViews") // Define logger

struct InteractiveWidgetEntryView : View {
    var entry: InteractiveProvider.Entry
    @Environment(\.widgetFamily) var family

    // Determine max habits based on widget size (similar to Calendar)
    private var maxHabits: Int {
        switch family {
        case .systemMedium:
            return 3 // Example: Allow 3 habits for medium interactive
        // Add other cases if supporting different sizes
        default:
            return 3
        }
    }

    var body: some View {
        // Corrected logging: Map habits to a description string first
      let habitsDescription = entry.habits.map { "\($0.name)(\($0.id))" }.joined(separator: ", ")
        VStack(alignment: .leading, spacing: 8) {
            Text("Complete Today:")
                .font(.headline)
                .padding(.horizontal)
                .padding(.top, 8)

            // Display habits up to the limit
            ForEach(entry.habits.prefix(maxHabits)) { habit in
                 HabitToggleButton(habit: habit)
                 if habit.id != entry.habits.prefix(maxHabits).last?.id {
                    Divider().padding(.horizontal)
                 }
            }
            Spacer() // Push content to the top
        }
        .padding(.vertical, 8)
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
        // Log button creation and initial state
        // Log computed state right before rendering UI element

        // Use Button with the AppIntent
        Button(intent: ToggleHabitIntent(habitID: habit.id)) {
             HStack {
                Text(habit.icon)
                    .font(.title2)
                Text(habit.name)
                    .font(.body)
                Spacer()
                Image(systemName: isCompletedToday ? "checkmark.circle.fill" : "circle")
                    .foregroundColor(isCompletedToday ? .green : .gray)
                    .font(.title2)
            }
        }
        .buttonStyle(.plain) // Use plain style to make the whole row tappable like a button
        .padding(.horizontal)
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
