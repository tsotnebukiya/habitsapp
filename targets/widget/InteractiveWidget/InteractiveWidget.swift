import WidgetKit
import SwiftUI

struct InteractiveHabitWidget: Widget {
    let kind: String = "InteractiveHabitWidget"
    let provider = InteractiveProvider()

    var body: some WidgetConfiguration {
        // Using AppIntentConfiguration for interactive widgets
        AppIntentConfiguration(kind: kind, intent: ToggleHabitIntent.self, provider: provider) { entry in
            InteractiveWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Interactive Habits")
        .description("Tap to complete your habits.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge]) 
    }
}

// Preview for different widget sizes
struct InteractiveHabitWidget_Previews: PreviewProvider {
    static var previews: some View {
        let habitStore = HabitStore()
        let mockEntry = SimpleEntry(date: Date(), habits: habitStore.mockHabits())
        
        Group {
            // Small widget preview
            InteractiveWidgetEntryView(entry: mockEntry)
                .previewContext(WidgetPreviewContext(family: .systemSmall))
                .previewDisplayName("Small Widget")
            
            // Medium widget preview
            InteractiveWidgetEntryView(entry: mockEntry)
                .previewContext(WidgetPreviewContext(family: .systemMedium))
                .previewDisplayName("Medium Widget")
            
            // Large widget preview
            InteractiveWidgetEntryView(entry: mockEntry)
                .previewContext(WidgetPreviewContext(family: .systemLarge))
                .previewDisplayName("Large Widget")
        }
    }
} 
