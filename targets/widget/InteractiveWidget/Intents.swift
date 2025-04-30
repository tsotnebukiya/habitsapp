import AppIntents
import SwiftUI // For @EnvironmentObject if needed, maybe not here
import os
import WidgetKit

// Logger specific to intents
private let intentLogger = Logger(subsystem: "com.vdl.habitapp.widget", category: "Intents")

// Define custom errors for the intent
enum IntentError: Swift.Error, CustomLocalizedStringResourceConvertible {
    case habitNotFound
    // case saveDataFailed // Add this if HabitStore.saveHabits is updated to throw errors

    var localizedStringResource: LocalizedStringResource {
        switch self {
        case .habitNotFound:
            return "Habit not found. It might have been deleted."
        // case .saveDataFailed:
        //     return "Failed to save habit changes."
        }
    }
}

struct ToggleHabitIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Toggle Habit Completion"
    static var description = IntentDescription("Marks a habit as completed or not completed for today.")
    // Allows the intent to run without opening the app
    static var openAppWhenRun: Bool = false 

    // Parameter: The ID of the habit to toggle
    @Parameter(title: "Habit ID")
    var habitID: String? // Parameter must be optional

    // Initializer required for AppIntents with parameters
    init(habitID: String?) { // Updated to accept optional String
        self.habitID = habitID
    }

    // Default initializer for intent configuration
    init() {
        // Default to nil when no specific habit is provided
        self.habitID = nil
    }

    

    // The core logic when the intent is performed
    @MainActor // Ensure UI-related updates (if any indirectly caused) are on main thread
    func perform() async throws -> some IntentResult {
        // Ensure we have a valid habit ID
        guard let targetHabitID = self.habitID, !targetHabitID.isEmpty else {
            throw IntentError.habitNotFound // Throw error if ID is missing
        }
        
        let habitStore = HabitStore()
        var currentHabits = habitStore.loadHabits()

        // Get today's date key using the same logic as the view
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds] // Match view/store
        formatter.timeZone = TimeZone(secondsFromGMT: 0) // Consistent UTC
        
        // --- Normalize date to start of day (UTC) ---
        let now = Date()
        var calendar = Calendar.current
        calendar.timeZone = TimeZone(secondsFromGMT: 0)! // Ensure UTC
        let startOfDay = calendar.startOfDay(for: now)
        let todayKey = formatter.string(from: startOfDay) 
        // --- End normalization ---

        // Find the index of the habit to modify
        guard let habitIndex = currentHabits.firstIndex(where: { $0.id == targetHabitID }) else {
            throw IntentError.habitNotFound // Throw error if habit not found
        }

        // Toggle the completion status for today
        let currentState = currentHabits[habitIndex].weeklyStatus[todayKey] ?? false
        currentHabits[habitIndex].weeklyStatus[todayKey] = !currentState
intentLogger.info("Toggled habit '\(currentHabits[habitIndex].name, privacy: .public)' '\(String(describing: currentHabits[habitIndex].weeklyStatus), privacy: .public)' (\(targetHabitID, privacy: .public)) for date key \(todayKey, privacy: .public) to \(!currentState, privacy: .public)")        // Save the updated habits list
        // Note: HabitStore.saveHabits currently logs errors but doesn't throw.
        // Consider updating HabitStore to throw errors for better handling here.
        habitStore.saveHabits(currentHabits)

        // Explicitly reload all widget timelines after saving data
        WidgetCenter.shared.reloadAllTimelines()
        // Indicate success
        // You can return values or confirmation dialogs if needed
        // return .result(value: "Toggled \(currentHabits[habitIndex].name)")
        return .result()
        // No need for the 'else' block anymore due to the guard statements above
    }
}
