import WidgetKit
import SwiftUI
import os

private let widgetLogger = Logger(subsystem: "com.vdl.habitapp.widget", category: "Provider")

struct InteractiveProvider: TimelineProvider {
  typealias Entry = SimpleEntry

    func placeholder(in context: Context) -> SimpleEntry {
      SimpleEntry(date: Date(), habits: [
            Habit(id: "placeholder", name: "Loading...", icon: "⌛️", color: "#999999", weeklyStatus: [:])
        ])
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), habits: loadHabits())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<SimpleEntry>) -> ()) {
        let currentDate = Date()
        let refreshDate = Calendar.current.date(byAdding: .minute, value: 5, to: currentDate)!
        let entry = SimpleEntry(date: currentDate, habits: loadHabits())
        
        widgetLogger.info("Creating timeline with refresh policy: \(refreshDate)")
        let timeline = Timeline(entries: [entry], policy: .after(refreshDate))
        completion(timeline)
    }
    
    private func loadHabits() -> [Habit] {
        guard let sharedDefaults = UserDefaults(suiteName: "group.com.vdl.habitapp"),
              let habitsData = sharedDefaults.string(forKey: "habits"),
              let data = habitsData.data(using: .utf8),
              let habits = try? JSONDecoder().decode([Habit].self, from: data) else {
            widgetLogger.error("Failed to load habits data or decode it from UserDefaults")
            return []
        }
        widgetLogger.info("Successfully loaded \(habits.count) habits")
        return habits
    }
} 
