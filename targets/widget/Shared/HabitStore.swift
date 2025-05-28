import Foundation
import WidgetKit // Needed for Habit? No, Habit is in Models.swift now
import os


extension String {
    var isEmoji: Bool {
        return self.unicodeScalars.first?.properties.isEmojiPresentation ?? false
    }
}

// Logger can remain here or be moved if needed elsewhere later
private let widgetLogger = Logger(subsystem: "com.vdl.habitapp.widget", category: "DataStore")

struct HabitStore {
    // Define App Group constant centrally
    static let appGroup = "group.com.vdl.habitapp.widget"

    // Method to load habits from UserDefaults
    func loadHabits() -> [Habit] {
        if let userDefaults = UserDefaults(suiteName: HabitStore.appGroup),
           let habitsDataString = userDefaults.string(forKey: "habits") {
            // Parse JSON string to [Habit]
            if let data = habitsDataString.data(using: .utf8) {
                do {
                    let habits = try JSONDecoder().decode([Habit].self, from: data)
                    return habits
                } catch {
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
        
        // Use a fixed date for consistent testing: Monday May 26, 2025
        let testDate = Calendar.current.date(from: DateComponents(year: 2025, month: 5, day: 26))!
        
        let mockData = [
            // Health & Wellness Habits
            Habit(
                id: "1",
                name: "Drink Water",
                icon: "drop.fill",
                color: "#3498DB",
                weeklyStatus: [
                    "2025-05-26T00:00:00.000Z": true,  // Monday
                    "2025-05-27T00:00:00.000Z": true,  // Tuesday
                    "2025-05-28T00:00:00.000Z": true,  // Wednesday
                ]
            ),
            Habit(
                id: "2",
                name: "Take Vitamins",
                icon: "pills.fill",
                color: "#FFC857",
                weeklyStatus: [
                    "2025-05-26T00:00:00.000Z": true,  // Monday
                    "2025-05-27T00:00:00.000Z": true,  // Tuesday
                    "2025-05-28T00:00:00.000Z": true,  // Wednesday
                    "2025-05-29T00:00:00.000Z": true   // Thursday
                ]
            ),
            Habit(
                id: "3",
                name: "Morning Exercise",
                icon: "figure.run",
                color: "#E74C3C",
                weeklyStatus: [
                    "2025-05-26T00:00:00.000Z": true,  // Monday
                    "2025-05-28T00:00:00.000Z": true,  // Wednesday
                ]
            ),
            Habit(
                id: "4",
                name: "Meditate",
                icon: "figure.mind.and.body",
                color: "#9B59B6",
                weeklyStatus: [
                    "2025-05-26T00:00:00.000Z": true,  // Monday
                    "2025-05-27T00:00:00.000Z": true,  // Tuesday
                    "2025-05-28T00:00:00.000Z": true,  // Wednesday
                    "2025-05-29T00:00:00.000Z": true,  // Thursday
                    "2025-05-30T00:00:00.000Z": true,  // Friday
                ]
            ),
            
            // Productivity Habits
            Habit(
                id: "5",
                name: "Read 30 Minutes",
                icon: "book.fill",
                color: "#2ECC71",
                weeklyStatus: [
                    "2025-05-26T00:00:00.000Z": true,  // Monday
                    "2025-05-28T00:00:00.000Z": true,  // Wednesday
                    "2025-05-30T00:00:00.000Z": true,  // Friday
                ]
            ),
            Habit(
                id: "6",
                name: "Write Journal",
                icon: "pencil.and.outline",
                color: "#F39C12",
                weeklyStatus: [
                    "2025-05-26T00:00:00.000Z": true,  // Monday
                    "2025-05-27T00:00:00.000Z": true,  // Tuesday
                ]
            ),
            Habit(
                id: "7",
                name: "Learn Spanish",
                icon: "character.book.closed.fill",
                color: "#E67E22",
                weeklyStatus: [
                    "2025-05-27T00:00:00.000Z": true,  // Tuesday
                    "2025-05-29T00:00:00.000Z": true,  // Thursday
                ]
            ),
            
            // Lifestyle Habits
            Habit(
                id: "8",
                name: "Make Bed",
                icon: "bed.double.fill",
                color: "#A1887F",
                weeklyStatus: [
                    "2025-05-26T00:00:00.000Z": true,  // Monday
                    "2025-05-27T00:00:00.000Z": true,  // Tuesday
                    "2025-05-28T00:00:00.000Z": true,  // Wednesday
                    "2025-05-29T00:00:00.000Z": true,  // Thursday
                    "2025-05-30T00:00:00.000Z": true,  // Friday
                    "2025-05-31T00:00:00.000Z": true,  // Saturday
                ]
            ),
            Habit(
                id: "9",
                name: "No Social Media",
                icon: "iphone.slash",
                color: "#34495E",
                weeklyStatus: [
                    "2025-05-26T00:00:00.000Z": true,  // Monday
                    "2025-05-28T00:00:00.000Z": true,  // Wednesday
                    "2025-05-30T00:00:00.000Z": true,  // Friday
                ]
            ),
            Habit(
                id: "10",
                name: "Call Family",
                icon: "phone.fill",
                color: "#1ABC9C",
                weeklyStatus: [
                    "2025-05-26T00:00:00.000Z": true,  // Monday
                    "2025-05-29T00:00:00.000Z": true,  // Thursday
                ]
            )
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
                userDefaults.synchronize()
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
