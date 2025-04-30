import WidgetKit
import SwiftUI
import os

// Logger specific to the provider
private let calendarProviderLogger = Logger(subsystem: "com.vdl.habitapp.widget", category: "CalendarProvider")

struct CalendarProvider: TimelineProvider {
    // Use the shared HabitStore for data operations
    let habitStore = HabitStore()
    
    // Placeholder uses mock data from the store
    func placeholder(in context: Context) -> SimpleEntry {
        calendarProviderLogger.info("Providing placeholder entry.")
        return SimpleEntry(date: Date(), habits: habitStore.mockHabits())
    }

    // Snapshot uses mock data from the store
    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        calendarProviderLogger.info("Providing snapshot entry.")
        let entry = SimpleEntry(date: Date(), habits: habitStore.mockHabits())
        completion(entry)
    }
    
    // Timeline uses real data loaded from the store
    func getTimeline(in context: Context, completion: @escaping (Timeline<SimpleEntry>) -> ()) {
        calendarProviderLogger.info("Providing timeline entries.")
        var entries: [SimpleEntry] = []
        let currentDate = Date()
        
        // Load habits using the shared store
        let habits = habitStore.loadHabits()
        calendarProviderLogger.debug("Loaded \(habits.count) habits for timeline.")

        // Create an entry for the current time
        let entry = SimpleEntry(date: currentDate, habits: habits)
        entries.append(entry)
        
        // Determine the next update time (e.g., every 5 minutes for frequent checks, or midnight)
        // Using 5 minutes as per original logic, adjust if needed
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 5, to: currentDate) ?? currentDate.addingTimeInterval(300)
        calendarProviderLogger.info("Timeline next update scheduled for \(nextUpdate)")

        let timeline = Timeline(entries: entries, policy: .after(nextUpdate))
        completion(timeline)
    }
} 
