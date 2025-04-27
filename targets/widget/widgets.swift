import WidgetKit
import SwiftUI

struct Provider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), habits: mockHabits())
    }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> SimpleEntry {
        SimpleEntry(date: Date(), habits: mockHabits())
    }
    
    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<SimpleEntry> {
        var entries: [SimpleEntry] = []
        let currentDate = Date()
        let habits = loadHabits()
        
        // Create an entry for the current time
        let entry = SimpleEntry(date: currentDate, habits: habits)
        entries.append(entry)
        
        // Create a timeline that updates at midnight
        return Timeline(entries: entries, policy: .atEnd)
    }
    
    private func loadHabits() -> [Habit] {
        if let userDefaults = UserDefaults(suiteName: "group.com.vdl.habitapp.widget"),
           let habitsData = userDefaults.string(forKey: "habits") {
            // Parse JSON string to [Habit]
            if let data = habitsData.data(using: .utf8),
               let habits = try? JSONDecoder().decode([Habit].self, from: data) {
                return habits
            }
        }
        return mockHabits()
    }
    
    private func mockHabits() -> [Habit] {
        return [
            Habit(id: "1", name: "Meditation", icon: "🧘‍♂️", completions: []),
            Habit(id: "2", name: "Reading", icon: "📚", completions: []),
            Habit(id: "3", name: "Exercise", icon: "💪", completions: [])
        ]
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let habits: [Habit]
}

struct Habit: Codable, Identifiable {
    let id: String
    let name: String
    let icon: String
    let completions: [String] // ISO date strings
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
        VStack(spacing: 8) {
            Text(weekRangeText)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.secondary)
            
            HStack(spacing: 12) {
                ForEach(weekDays, id: \.self) { day in
                    Text(day)
                        .font(.system(size: 12, weight: .medium))
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
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: currentDate)
        let weekStart = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: today))!
        
        return (0...6).map { day in
            calendar.date(byAdding: .day, value: day, to: weekStart)!
        }
    }
    
    private func isCompleted(for date: Date) -> Bool {
        let dateString = ISO8601DateFormatter().string(from: date)
        return habit.completions.contains(dateString)
    }
    
    var body: some View {
        HStack(spacing: 12) {
            HStack(spacing: 8) {
                Text(habit.icon)
                    .font(.system(size: 16))
                Text(habit.name)
                    .font(.system(size: 14, weight: .medium))
                    .lineLimit(1)
            }
            .frame(width: 100, alignment: .leading)
            
            ForEach(weekDays, id: \.timeIntervalSince1970) { date in
                Circle()
                    .stroke(Color.secondary.opacity(0.3), lineWidth: 1)
                    .background(
                        Circle()
                            .fill(isCompleted(for: date) ? Color.green : Color.clear)
                    )
                    .frame(width: 20, height: 20)
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
    }
}

@main
struct WeeklyHabitsWidget: Widget {
    let kind: String = "WeeklyHabitsWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: Provider()) { entry in
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
