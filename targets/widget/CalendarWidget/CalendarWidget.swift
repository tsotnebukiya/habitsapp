import WidgetKit
import SwiftUI

struct WeeklyHabitsWidget: Widget {
    let kind: String = "WeeklyHabitsWidget"
    // Reference the separated Provider
    let provider = CalendarProvider()

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: provider) { entry in
            // Reference the separated Entry View
            WeeklyHabitsWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Weekly Habits")
        .description("Track your weekly habits progress")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}

// Previews can optionally live here or in CalendarViews.swift
// Let's keep them with the main widget definition for now.
struct WeeklyHabitsWidget_Previews: PreviewProvider {
    static var previews: some View {
         // Use the HabitStore for mock data in previews
        let habitStore = HabitStore()
        let mockEntry = SimpleEntry(date: Date(), habits: habitStore.mockHabits())
        
        WeeklyHabitsWidgetEntryView(entry: mockEntry)
            .previewContext(WidgetPreviewContext(family: .systemMedium))
        
        WeeklyHabitsWidgetEntryView(entry: mockEntry)
            .previewContext(WidgetPreviewContext(family: .systemLarge))
    }
} 
