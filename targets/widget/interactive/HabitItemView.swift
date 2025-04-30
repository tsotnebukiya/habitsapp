import SwiftUI
import AppIntents

struct HabitItemView: View {
  let habit: Habit
    
    // Calculate completion status based on today's key
    private var isCompletedToday: Bool {
        let todayKey = getTodayDateKey()
        return habit.weeklyStatus[todayKey] ?? false
    }
    
    // Convert hex color string to Color
    private var habitColor: Color {
        habit.colorValue
    }
    
    var body: some View {
        Button(intent: ToggleHabitIntent(habitId: habit.id)) {
            VStack(spacing: 4) {
                Text(habit.icon)
                    .font(.system(size: 24))
                Text(habit.name)
                    .font(.system(size: 12, weight: .medium))
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(habitColor.opacity(isCompletedToday ? 1.0 : 0.4))
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        }
        .buttonStyle(.plain)
    }
    
    // Helper to get today's date key (same as in ToggleHabitIntent)
    private func getTodayDateKey() -> String {
        let now = Date()
        var calendar = Calendar.current
        calendar.timeZone = TimeZone(identifier: "UTC")!
        let startOfDay = calendar.startOfDay(for: now)
        
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        formatter.timeZone = TimeZone(identifier: "UTC")
        return formatter.string(from: startOfDay)
    }
} 
