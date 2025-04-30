import Foundation
import WidgetKit // Needed for Habit? No, Habit is in Models.swift now
import os

// Logger can remain here or be moved if needed elsewhere later
private let widgetLogger = Logger(subsystem: "com.vdl.habitapp.widget", category: "DataStore")

struct HabitStore {
    // Define App Group constant centrally
    static let appGroup = "group.com.vdl.habitapp.widget"

    // Method to load habits from UserDefaults
    func loadHabits() -> [Habit] {
        widgetLogger.info("Attempting to load habits from UserDefaults.")
        if let userDefaults = UserDefaults(suiteName: HabitStore.appGroup),
           let habitsDataString = userDefaults.string(forKey: "habits") {
            widgetLogger.debug("Found habits string in UserDefaults: \(habitsDataString)")
            // Parse JSON string to [Habit]
            if let data = habitsDataString.data(using: .utf8) {
                do {
                    let habits = try JSONDecoder().decode([Habit].self, from: data)
                    widgetLogger.info("Successfully decoded \(habits.count) habits.")
                    return habits
                } catch {
                    widgetLogger.error("Failed to decode habits JSON: \(error.localizedDescription)")
                }
            } else {
                 widgetLogger.warning("Could not convert habits string to Data.")
            }
        } else {
            widgetLogger.info("No habits data found in UserDefaults or UserDefaults suite invalid. Returning mock data.")
        }
        // Return mock data if loading fails or no data exists
        return mockHabits()
    }

    // Method to generate mock habits
    func mockHabits() -> [Habit] {
         widgetLogger.info("Generating mock habits.")
        let today = Date()
        
        // Generate weekly status keys based on the current week, ensuring consistency
        let calendar = Calendar.current
        let startOfWeek = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: today))!
        
        let weeklyStatus = Dictionary(
            uniqueKeysWithValues: (0...6).map { dayOffset -> (String, Bool) in
                let date = calendar.date(byAdding: .day, value: dayOffset, to: startOfWeek)!
                // Use a consistent formatter for keys
                let formatter = ISO8601DateFormatter()
                // IMPORTANT: The format options AND timezone MUST match exactly where these keys are generated/used (e.g., Views, Intents)
                formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds] // Keep consistent with HabitRowView usage if needed
                formatter.timeZone = TimeZone(secondsFromGMT: 0) // Standardize timezone for keys

                // For mock data, ensure the date component is just the date part for matching if necessary
                let dateOnlyFormatter = DateFormatter()
                dateOnlyFormatter.dateFormat = "yyyy-MM-dd"
                dateOnlyFormatter.timeZone = TimeZone(secondsFromGMT: 0)
                let dateKey = dateOnlyFormatter.string(from: date)
                
                // Return the formatted string expected by the saving mechanism/used for lookup
                return (formatter.string(from: date), false) // Assuming ISO8601 is used for storage keys
            }
        )
        
        let mockData = [
            Habit(id: "1", name: "Meditation", icon: "🧘‍♂️", color: "#3498DB", weeklyStatus: weeklyStatus),
            Habit(id: "2", name: "Reading", icon: "📚", color: "#2ECC71", weeklyStatus: weeklyStatus),
            Habit(id: "3", name: "Exercise", icon: "💪", color: "#E74C3C", weeklyStatus: weeklyStatus)
        ]
        widgetLogger.debug("Generated mock habits: \(mockData)")
        return mockData
    }
    
    // Method to save habits to UserDefaults
    func saveHabits(_ habits: [Habit]) {
        widgetLogger.info("Attempting to save \(habits.count) habits to UserDefaults.")
        guard let userDefaults = UserDefaults(suiteName: HabitStore.appGroup) else {
            // Note: Error is logged but not propagated. Intent will not know if saving failed.
            widgetLogger.error("Failed to get UserDefaults suite for saving.")
            return
        }
        
        do {
            let data = try JSONEncoder().encode(habits)
            if let jsonString = String(data: data, encoding: .utf8) {
                userDefaults.set(jsonString, forKey: "habits")
                widgetLogger.info("Successfully saved habits.")
                // Optional: Synchronize UserDefaults if needed immediately, though often not required.
                // userDefaults.synchronize()
            } else {
                widgetLogger.error("Failed to convert encoded habits data to String.")
            }
        } catch {
            // Note: Error is logged but not propagated. Intent will not know if saving failed.
            widgetLogger.error("Failed to encode habits for saving: \(error.localizedDescription)")
        }
    }
}

// Add SimpleEntry definition here as it depends on Habit and is used by Providers
struct SimpleEntry: TimelineEntry {
    let date: Date
    let habits: [Habit]
} 
