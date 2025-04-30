import WidgetKit
import SwiftUI
import AppIntents
import os

// Logger specific to the interactive provider
private let interactiveProviderLogger = Logger(subsystem: "com.vdl.habitapp.widget", category: "InteractiveProvider")

struct InteractiveProvider: AppIntentTimelineProvider {
    typealias Entry = SimpleEntry // Using the shared SimpleEntry
    typealias Intent = ToggleHabitIntent // The intent this provider handles

    let habitStore = HabitStore()

    // Placeholder entry
    func placeholder(in context: Context) -> SimpleEntry {
        interactiveProviderLogger.info("Providing placeholder entry.")
        return SimpleEntry(date: Date(), habits: habitStore.mockHabits())
    }

    // Snapshot for the current state
    func snapshot(for configuration: ToggleHabitIntent, in context: Context) async -> SimpleEntry {
        interactiveProviderLogger.info("Providing snapshot entry.")
        // Return current data, potentially using the intent's parameters if needed later
        return SimpleEntry(date: Date(), habits: habitStore.loadHabits())
    }
    
    // Timeline generation
    func timeline(for configuration: ToggleHabitIntent, in context: Context) async -> Timeline<SimpleEntry> {
        interactiveProviderLogger.info("Providing timeline entries.")
        let currentDate = Date()
        let habits = habitStore.loadHabits()
        let entry = SimpleEntry(date: currentDate, habits: habits)

        // Refresh policy (e.g., every 5 minutes or after the intent action)
        // For interactive widgets, often refreshing after an action is more relevant
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 5, to: currentDate) ?? currentDate.addingTimeInterval(300)
        interactiveProviderLogger.info("Timeline next update scheduled for \(nextUpdate)")
        
        return Timeline(entries: [entry], policy: .after(nextUpdate))
    }
    
    // --- AppIntentTimelineProvider specific methods ---
    
    // Optional: Provide relevance based on the intent
    // func relevance(for configuration: ToggleHabitIntent, in context: Context) async -> TimelineEntryRelevance? {
    //     return TimelineEntryRelevance(score: 1.0) // Example relevance score
    // }
} 
