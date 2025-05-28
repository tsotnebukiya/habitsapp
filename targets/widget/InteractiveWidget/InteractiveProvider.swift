import WidgetKit
import SwiftUI
import AppIntents
import os

// Logger specific to the interactive provider
private let interactiveProviderLogger = Logger(subsystem: "com.vdl.habitapp.widget", category: "InteractiveProvider")

struct InteractiveProvider: TimelineProvider {
    typealias Entry = SimpleEntry // Using the shared SimpleEntry

    let habitStore = HabitStore()

    // Placeholder entry
    func placeholder(in context: Context) -> SimpleEntry {
        return SimpleEntry(date: Date(), habits: habitStore.mockHabits())
    }

    // Snapshot for the current state
    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), habits: habitStore.loadHabits())
        completion(entry)
    }
    
    // Timeline generation
    func getTimeline(in context: Context, completion: @escaping (Timeline<SimpleEntry>) -> ()) {
        let currentDate = Date()
        let habits = habitStore.loadHabits()
        let entry = SimpleEntry(date: currentDate, habits: habits)

        // Refresh policy (e.g., every 5 minutes or after the intent action)
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 5, to: currentDate) ?? currentDate.addingTimeInterval(300)
        
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
} 
