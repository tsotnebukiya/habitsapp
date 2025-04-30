import SwiftUI
import WidgetKit // For containerBackground

struct WeekHeaderView: View {
    let currentDate: Date
    
    // Use shared utility for weekday symbols
    private var weekDays: [String] {
        DateUtils.weekDays(for: currentDate)
    }
    
    // Use shared utility for week range text
    private var weekRangeText: String {
        DateUtils.weekRangeText(for: currentDate)
    }
    
    var body: some View {
        VStack(spacing: 10) {
            Text(weekRangeText)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.secondary)
            
            HStack(spacing: 4) {
                ForEach(weekDays, id: \.self) { day in
                    Text(day)
                        .font(.system(size: 10, weight: .medium))
                        .frame(maxWidth: .infinity)
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }
}

struct HabitRowView: View {
    let habit: Habit
    let currentDate: Date
    
    // Use shared utility to get dates of the week
    private var weekDates: [Date] {
        DateUtils.datesOfWeek(for: currentDate) // Using default calendar/timezone
    }
    
    // Check completion status for a given date
    private func isCompleted(for date: Date) -> Bool {
        // Standardize the date formatting for lookup to match potential keys
        let formatter = ISO8601DateFormatter()
        // IMPORTANT: Ensure this format matches EXACTLY how keys are stored in weeklyStatus dictionary
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds] 
        formatter.timeZone = TimeZone(secondsFromGMT: 0) // Match timezone used in HabitStore keys
        let dateString = formatter.string(from: date)
        return habit.weeklyStatus[dateString] ?? false
    }
    
    var body: some View {
        HStack(spacing: 6) {
            // Habit Info (Icon + Name)
            HStack(spacing: 6) {
                Text(habit.icon)
                    .font(.system(size: 16))
                Text(habit.name)
                    .font(.system(size: 14, weight: .medium))
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            }
            .frame(width: 80, alignment: .leading)

            // Weekly Status Circles
            ForEach(weekDates, id: \.timeIntervalSince1970) { date in
                Circle()
                    .stroke(Color.secondary.opacity(0.3), lineWidth: 0.8)
                    .background(
                        Circle()
                            .fill(isCompleted(for: date) ? Color.green : Color.clear)
                    )
                    .frame(width: 14, height: 14)
                    // Add accessibility label for better screen reader support
                    .accessibilityLabel(accessibilityLabel(for: date))
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
    }
    
    // Helper for accessibility label on circles
    private func accessibilityLabel(for date: Date) -> String {
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "EEEE, MMM d"
        let dateString = dateFormatter.string(from: date)
        let status = isCompleted(for: date) ? "Completed" : "Not completed"
        return "\(habit.name) on \(dateString): \(status)"
    }
}

struct WeeklyHabitsWidgetEntryView: View {
    // Renamed Provider to CalendarProvider if necessary, but SimpleEntry is global now
    var entry: SimpleEntry 
    @Environment(\.widgetFamily) var family
    
    // Determine max habits based on widget size
    private var maxHabits: Int {
        switch family {
        case .systemMedium:
            return 2
        case .systemLarge:
            // Increased max habits for large widget as per original logic likely intended
            return 6 
        default:
             // Default to medium size limit
            return 2
        }
    }
    
    var body: some View {
        VStack(spacing: 0) {
            WeekHeaderView(currentDate: entry.date)
            // Display habits up to the limit for the current widget size
            ForEach(entry.habits.prefix(maxHabits)) { habit in
                HabitRowView(habit: habit, currentDate: entry.date)
                // Add divider between rows, but not after the last one
                if habit.id != entry.habits.prefix(maxHabits).last?.id {
                    Divider()
                        .padding(.horizontal, 16)
                }
            }
            // Add a spacer if there are fewer habits than max to push content up
            if entry.habits.count < maxHabits {
                 Spacer()
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top) // Align content top
        // Use the standard containerBackground modifier
        .containerBackground(.fill.tertiary, for: .widget) 
    }
} 
