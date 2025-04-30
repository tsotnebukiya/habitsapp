import WidgetKit
import SwiftUI
import os

private let widgetLogger = Logger(subsystem: "com.vdl.habitapp.widget", category: "InteractiveHabitsWidget")

struct InteractiveHabitsWidget: Widget {
    let kind: String = "InteractiveHabitsWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: InteractiveProvider()) { entry in
            InteractiveHabitsWidgetView(entry: entry)
        }
        .configurationDisplayName("Habits Grid")
        .description("Track your daily habits with quick access.")
        .supportedFamilies([.systemMedium])
    }
}

struct InteractiveHabitsWidgetView: View {
    let entry: SimpleEntry
    
    private let columns = Array(repeating: GridItem(.flexible(), spacing: 8), count: 4)
    
    var body: some View {
        if entry.habits.isEmpty {
            Text("No habits found")
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(.secondary)
        } else {
            LazyVGrid(columns: columns, spacing: 8) {
                ForEach(entry.habits) { habit in
                    HabitItemView(habit: habit)
                }
            }
            .padding(8)
        }
    }
}

#Preview(as: .systemMedium) {
    InteractiveHabitsWidget()
} timeline: {
  SimpleEntry(
        date: .now,
        habits: [
            Habit(id: "1", name: "Meditate", icon: "🧘‍♂️", color: "#FF9500", weeklyStatus: [:]),
            Habit(id: "2", name: "Exercise", icon: "💪", color: "#34C759", weeklyStatus: [:]),
            Habit(id: "3", name: "Read", icon: "📚", color: "#5856D6", weeklyStatus: [:]),
            Habit(id: "4", name: "Journal", icon: "✍️", color: "#FF3B30", weeklyStatus: [:])
        ]
    )
} 
