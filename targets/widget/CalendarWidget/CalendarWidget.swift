import WidgetKit
import SwiftUI

struct WeeklyHabitsWidget: Widget {
    let kind: String = "WeeklyHabitsWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(
            kind: kind,
            intent: HabitConfigurationIntent.self,
            provider: SharedHabitConfigurationProvider()
        ) { entry in
            WeeklyHabitsWidgetEntryView(entry: entry)
                .containerBackground(.clear, for: .widget)
        }
        .configurationDisplayName("Weekly Habits")
        .description("Choose which habits to display in your weekly calendar widget.")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}

// Previews using the shared configuration
struct WeeklyHabitsWidget_Previews: PreviewProvider {
    static var previews: some View {
        let habitStore = HabitStore()
        let testDate = Calendar.current.date(from: DateComponents(year: 2025, month: 5, day: 27))! // Monday May 26, 2025
        let mockEntry = ConfigurableEntry(
            date: testDate,
            habits: habitStore.mockHabits(),
            selectedHabitIds: []
        )
        
        WeeklyHabitsWidgetEntryView(entry: mockEntry)
            .previewContext(WidgetPreviewContext(family: .systemMedium))
        
        WeeklyHabitsWidgetEntryView(entry: mockEntry)
            .previewContext(WidgetPreviewContext(family: .systemLarge))
    }
} 
