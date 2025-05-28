import WidgetKit
import SwiftUI

struct InteractiveWidget: Widget {
    let kind: String = "InteractiveWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(
            kind: kind,
            intent: HabitConfigurationIntent.self,
            provider: SharedHabitConfigurationProvider()
        ) { entry in
            InteractiveWidgetEntryView(entry: entry)
                .containerBackground(.clear, for: .widget)
        }
        .configurationDisplayName("Interactive Habits")
        .description("Track your habits with interactive buttons. Tap habits to mark them complete.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

// Preview for different widget sizes
struct InteractiveHabitWidget_Previews: PreviewProvider {
    static var previews: some View {
        let habitStore = HabitStore()
        let mockEntry = ConfigurableEntry(
            date: Date(), 
            habits: habitStore.mockHabits(),
            selectedHabitIds: [] // Empty selection shows default habits
        )
        
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
