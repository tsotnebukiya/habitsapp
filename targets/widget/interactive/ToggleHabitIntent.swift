import AppIntents
import WidgetKit
import SwiftUI
import os

private let intentLogger = Logger(subsystem: "com.vdl.habitapp.widget", category: "ToggleHabitIntent")

struct ToggleHabitIntent: AppIntent {
    static var title: LocalizedStringResource = "Toggle Habit Status"
    static var description = IntentDescription("Marks a habit as complete or opens the app if already complete.")
    
    @Parameter(title: "Habit ID")
    var habitId: String
    
    // App Group and UserDefaults key - Make sure this matches widget-storage.ts
    private let appGroup = "group.com.vdl.habitapp"
    private let habitsKey = "habits"
    
    init() {}
    
    init(habitId: String) {
        self.habitId = habitId
    }
    
    // Helper to get today's date key in UTC ISO8601 format
    private func getTodayDateKey() -> String {
        let now = Date()
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        formatter.timeZone = TimeZone(identifier: "UTC")
        // Use start of day for consistency
        var calendar = Calendar.current
        calendar.timeZone = TimeZone(identifier: "UTC")!
        let startOfDay = calendar.startOfDay(for: now)
        return formatter.string(from: startOfDay)
    }
    
    // Helper to load habits
    private func loadHabits() -> [Habit]? {
        guard let userDefaults = UserDefaults(suiteName: appGroup),
              let habitsDataString = userDefaults.string(forKey: habitsKey),
              let data = habitsDataString.data(using: .utf8) else {
            intentLogger.error("Failed to load habits data string from UserDefaults")
            return nil
        }
        
        do {
            let habits = try JSONDecoder().decode([Habit].self, from: data)
            intentLogger.info("Successfully loaded \(habits.count) habits")
            return habits
        } catch {
            intentLogger.error("Failed to decode habits: \(error.localizedDescription)")
            return nil
        }
    }
    
    // Helper to save habits
    private func saveHabits(_ habits: [Habit]) -> Bool {
        guard let userDefaults = UserDefaults(suiteName: appGroup) else {
            intentLogger.error("Failed to access UserDefaults")
            return false
        }
        
        do {
            let data = try JSONEncoder().encode(habits)
            guard let jsonString = String(data: data, encoding: .utf8) else {
                intentLogger.error("Failed to encode habits to string")
                return false
            }
            
            userDefaults.set(jsonString, forKey: habitsKey)
            intentLogger.info("Successfully saved updated habits")
            return true
        } catch {
            intentLogger.error("Failed to encode habits: \(error.localizedDescription)")
            return false
        }
    }
    
    @MainActor
    func perform() async throws -> some IntentResult {
        intentLogger.info("Performing toggle for habit: \(self.habitId)")
        let todayKey = getTodayDateKey()
        intentLogger.info("Today's key: \(todayKey)")
        
        // Load current habits
        guard var habits = loadHabits(),
              let habitIndex = habits.firstIndex(where: { $0.id == self.habitId }) else {
            intentLogger.error("Failed to load habits or find habit with ID: \(self.habitId)")
            // Attempt to reload timelines even if loading failed, might fix display issues
            WidgetCenter.shared.reloadAllTimelines()
            return .result()
        }
        
        // Get current completion status
        let isCompleted = habits[habitIndex].weeklyStatus[todayKey] ?? false
        intentLogger.info("Current completion status: \(isCompleted)")
        
        // Toggle completion status
        let newCompletionStatus = !isCompleted
        intentLogger.info("New completion status: \(newCompletionStatus)")

        // Update the specific habit
        var updatedHabit = habits[habitIndex]
        var updatedWeeklyStatus = updatedHabit.weeklyStatus
        updatedWeeklyStatus[todayKey] = newCompletionStatus
        updatedHabit = Habit(
            id: updatedHabit.id,
            name: updatedHabit.name,
            icon: updatedHabit.icon,
            color: updatedHabit.color,
            weeklyStatus: updatedWeeklyStatus
        )

        // Update habits array
        habits[habitIndex] = updatedHabit

        // Save updated habits
        if saveHabits(habits) {
            intentLogger.info("Successfully updated and saved habit status")
            WidgetCenter.shared.reloadAllTimelines()
        } else {
            intentLogger.error("Failed to save updated habits")
            // Still reload timelines to potentially show old state if save failed
            WidgetCenter.shared.reloadAllTimelines()
        }
            
        return .result()
        
    }
} 
