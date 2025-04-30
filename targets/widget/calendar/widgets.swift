import WidgetKit
import SwiftUI
import AppIntents
import os

private let widgetLogger = Logger(subsystem: "com.vdl.habitapp.widget", category: "WidgetKit")


struct Provider: TimelineProvider {
    private let appGroup = "group.com.vdl.habitapp.widget"  // Match app.config.ts
    
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), habits: mockHabits())
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), habits: mockHabits())
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<SimpleEntry>) -> ()) {
        var entries: [SimpleEntry] = []
        let currentDate: Date = Date()
        let habits: [Habit] = loadHabits()

        // Create an entry for the current time
        let entry = SimpleEntry(date: currentDate, habits: habits)
        entries.append(entry)
        
        // Create a timeline that updates at midnight
    let nextUpdate = Calendar.current.date(byAdding: .minute, value: 5, to: currentDate)!
        let timeline = Timeline(entries: entries, policy: .after(nextUpdate))
        completion(timeline)
    }
    
    func loadHabits() -> [Habit] {
        if let userDefaults = UserDefaults(suiteName: appGroup),
           let habitsData = userDefaults.string(forKey: "habits") {
            // Parse JSON string to [Habit]
            if let data = habitsData.data(using: .utf8),
               let habits = try? JSONDecoder().decode([Habit].self, from: data) {
                return habits
            }
        }
        return mockHabits()
    }
    
    func mockHabits() -> [Habit] {
        let today = Date()
        let weeklyStatus = Dictionary(
            uniqueKeysWithValues: (0...6).map { day -> (String, Bool) in
                let date = Calendar.current.date(byAdding: .day, value: day, to: today)!
                let formatter = ISO8601DateFormatter()
                formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
                return (formatter.string(from: date), false)
            }
        )
        
        return [
            Habit(id: "1", name: "Meditation", icon: "🧘‍♂️", color: "#3498DB", weeklyStatus: weeklyStatus),
            Habit(id: "2", name: "Reading", icon: "📚", color: "#2ECC71", weeklyStatus: weeklyStatus),
            Habit(id: "3", name: "Exercise", icon: "💪", color: "#E74C3C", weeklyStatus: weeklyStatus)
        ]
    }
}



struct WeekHeaderView: View {
    let currentDate: Date
    
    private var weekDays: [String] {
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: currentDate)
        let weekStart = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: today))!
        
        return (0...6).map { day in
            let date = calendar.date(byAdding: .day, value: day, to: weekStart)!
            return calendar.shortWeekdaySymbols[calendar.component(.weekday, from: date) - 1]
        }
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
    
    private var weekRangeText: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d"
        
        let calendar = Calendar.current
        let weekStart = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: currentDate))!
        let weekEnd = calendar.date(byAdding: .day, value: 6, to: weekStart)!
        
        return "\(formatter.string(from: weekStart)) - \(formatter.string(from: weekEnd))"
    }
}

struct HabitRowView: View {
    let habit: Habit
    let currentDate: Date
    
    private var weekDays: [Date] {
    var calendar = Calendar(identifier: .iso8601)
    calendar.timeZone = TimeZone(identifier: "UTC")!  // <-- Important

    let today = calendar.startOfDay(for: currentDate)
    let weekStart = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: today))!

    return (0...6).map { day in
        calendar.date(byAdding: .day, value: day, to: weekStart)!
    }
}
    
    private func isCompleted(for date: Date) -> Bool {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        let dateString = formatter.string(from: date)
        return habit.weeklyStatus[dateString] ?? false
    }
    
    var body: some View {
        HStack(spacing: 6) {
            HStack(spacing: 6) {
                Text(habit.icon)
                    .font(.system(size: 16))
                Text(habit.name)
                    .font(.system(size: 14, weight: .medium))
                    .lineLimit(1)
                    .minimumScaleFactor(0.7)
            }
            .frame(width: 80, alignment: .leading)

            ForEach(weekDays, id: \.timeIntervalSince1970) { date in
                Circle()
                    .stroke(Color.secondary.opacity(0.3), lineWidth: 0.8)
                    .background(
                        Circle()
                            .fill(isCompleted(for: date) ? Color.green : Color.clear)
                    )
                    .frame(width: 14, height: 14)
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 8)
    }
}

struct WeeklyHabitsWidgetEntryView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family
    
    private var maxHabits: Int {
        switch family {
        case .systemMedium:
            return 2
        case .systemLarge:
            return 6
        default:
            return 2
        }
    }
    
    var body: some View {
        VStack(spacing: 0) {
            WeekHeaderView(currentDate: entry.date)
            ForEach(entry.habits.prefix(maxHabits)) { habit in
                HabitRowView(habit: habit, currentDate: entry.date)
                if habit.id != entry.habits.prefix(maxHabits).last?.id {
                    Divider()
                        .padding(.horizontal, 16)
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .containerBackground(.fill.tertiary, for: .widget) // <-- Add here
    }
}

struct WeeklyHabitsWidget: Widget {
    let kind: String = "WeeklyHabitsWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            WeeklyHabitsWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Weekly Habits")
        .description("Track your weekly habits progress")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}

struct WeeklyHabitsWidget_Previews: PreviewProvider {
    static var previews: some View {
        WeeklyHabitsWidgetEntryView(entry: SimpleEntry(date: Date(), habits: Provider().mockHabits()))
            .previewContext(WidgetPreviewContext(family: .systemMedium))
        
        WeeklyHabitsWidgetEntryView(entry: SimpleEntry(date: Date(), habits: Provider().mockHabits()))
            .previewContext(WidgetPreviewContext(family: .systemLarge))
    }
}
