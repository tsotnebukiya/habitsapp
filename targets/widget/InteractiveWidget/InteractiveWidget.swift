import WidgetKit
import SwiftUI

struct InteractiveHabitWidget: Widget {
    let kind: String = "InteractiveHabitWidget"
    let provider = InteractiveProvider()

    var body: some WidgetConfiguration {
        // Using AppIntentConfiguration for interactive widgets
        AppIntentConfiguration(kind: kind, intent: ToggleHabitIntent.self, provider: provider) { entry in
            InteractiveWidgetEntryView(entry: entry)
                 .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Interactive Habits")
        .description("Tap to complete your habits.")
        // Define supported families (e.g., medium)
        .supportedFamilies([.systemMedium]) 
    }
}

// Basic Preview (can be enhanced later)
struct InteractiveHabitWidget_Previews: PreviewProvider {
    static var previews: some View {
        let habitStore = HabitStore()
        let mockEntry = SimpleEntry(date: Date(), habits: habitStore.mockHabits())
        InteractiveWidgetEntryView(entry: mockEntry)
            .previewContext(WidgetPreviewContext(family: .systemMedium))
    }
} 