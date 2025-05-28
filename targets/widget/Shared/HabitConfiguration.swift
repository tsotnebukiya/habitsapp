import AppIntents
import WidgetKit
import Foundation
import os

private let habitConfigLogger = Logger(subsystem: "com.vdl.habitapp.widget", category: "HabitConfiguration")

// MARK: - Shared Configuration Entry
struct ConfigurableEntry: TimelineEntry {
    let date: Date
    let habits: [Habit]
    let selectedHabitIds: [String]
    
    // Computed property to get the habits to display based on configuration
    var displayHabits: [Habit] {
        if selectedHabitIds.isEmpty {
            // If no habits selected, return first habits (default behavior)
            return Array(habits.prefix(10)) // Max 10 for large widget
        } else {
            // Return selected habits in the order they appear in the main habits array
            return habits.filter { selectedHabitIds.contains($0.id) }
        }
    }
}

// MARK: - Habit Entity for Configuration
struct HabitEntity: AppEntity {
    static var typeDisplayRepresentation: TypeDisplayRepresentation = "Habit"
    static var defaultQuery = HabitEntityQuery()
    
    var id: String
    var displayRepresentation: DisplayRepresentation {
        // Show only the habit name, no icons or technical details
        DisplayRepresentation(
            title: "\(name)",
            subtitle: "Tap to toggle selection"
        )
    }
    
    let name: String
    let icon: String
    let color: String
    
    init(from habit: Habit) {
        self.id = habit.id
        self.name = habit.name
        self.icon = habit.icon
        self.color = habit.color
    }
}

// MARK: - Habit Entity Query
struct HabitEntityQuery: EntityQuery {
    func entities(for identifiers: [String]) async throws -> [HabitEntity] {
        let habitStore = HabitStore()
        let habits = habitStore.loadHabits()
        
        let entities: [HabitEntity] = habits.compactMap { habit in
            guard identifiers.contains(habit.id) else { return nil }
            return HabitEntity(from: habit)
        }
        
        habitConfigLogger.debug("Found \(entities.count) entities for identifiers: \(identifiers)")
        return entities
    }
    
    func suggestedEntities() async throws -> [HabitEntity] {
        let habitStore = HabitStore()
        let habits = habitStore.loadHabits()
        
        let entities: [HabitEntity] = habits.map { HabitEntity(from: $0) }
        habitConfigLogger.info("Suggesting \(entities.count) entities for configuration")
        
        return entities
    }
    
    func defaultResult() async -> HabitEntity? {
        let habitStore = HabitStore()
        let habits = habitStore.loadHabits()
        
        let defaultEntity = habits.first.map { HabitEntity(from: $0) }
        if let entity = defaultEntity {
            habitConfigLogger.debug("Default entity: \(entity.name)")
        } else {
            habitConfigLogger.warning("No default entity available")
        }
        
        return defaultEntity
    }
}

// MARK: - Shared Configuration Intent
struct HabitConfigurationIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Configure Habits"
    static var description = IntentDescription("Choose which habits to display in your widget.")
    
    // Parameter for selected habits - MUST be optional for WidgetConfigurationIntent
    @Parameter(title: "Habits to Display", description: "Select which habits you want to see in your widget")
    var selectedHabits: [HabitEntity]?
    
    // Custom parameter summary to show count instead of habit names
    static var parameterSummary: some ParameterSummary {
        When(\.$selectedHabits, .hasAnyValue) {
            Summary("Display selected habits") {
                \.$selectedHabits
            }
        } otherwise: {
            Summary("Display all habits")
        }
    }
    
    init() {
        self.selectedHabits = nil
    }
    
    init(selectedHabits: [HabitEntity]?) {
        self.selectedHabits = selectedHabits
    }
}

// MARK: - Shared Configuration Provider
struct SharedHabitConfigurationProvider: AppIntentTimelineProvider {
    typealias Entry = ConfigurableEntry
    typealias Intent = HabitConfigurationIntent
    
    private let logger = Logger(subsystem: "com.vdl.habitapp.widget", category: "SharedConfigProvider")
    
    func placeholder(in context: Context) -> ConfigurableEntry {
        logger.info("Generating placeholder entry")
        let habitStore = HabitStore()
        let habits = habitStore.loadHabits() // This will return mock data if no real data
        logger.info("Placeholder: Loaded \(habits.count) habits")
        
        return ConfigurableEntry(
            date: Date(),
            habits: habits,
            selectedHabitIds: [] // Show first habits by default
        )
    }
    
    func snapshot(for configuration: HabitConfigurationIntent, in context: Context) async -> ConfigurableEntry {
        logger.info("Generating snapshot for configuration")
        
        let habitStore = HabitStore()
        let allHabits = habitStore.loadHabits()
        logger.info("Snapshot: Loaded \(allHabits.count) habits")
        
        // Convert selected HabitEntity array to habit IDs
        let selectedHabitIds: [String]
        if let selectedHabits = configuration.selectedHabits {
            selectedHabitIds = selectedHabits.map { $0.id }
            logger.info("Snapshot: Using \(selectedHabitIds.count) selected habits")
        } else {
            selectedHabitIds = []
            logger.info("Snapshot: No habits selected, using default")
        }
        
        let entry = ConfigurableEntry(
            date: Date(),
            habits: allHabits,
            selectedHabitIds: selectedHabitIds
        )
        
        logger.info("Snapshot: Entry will display \(entry.displayHabits.count) habits")
        return entry
    }
    
    func timeline(for configuration: HabitConfigurationIntent, in context: Context) async -> Timeline<ConfigurableEntry> {
        logger.info("Generating timeline for configuration")
        
        let habitStore = HabitStore()
        let allHabits = habitStore.loadHabits()
        logger.info("Timeline: Loaded \(allHabits.count) habits")
        
        // Convert selected HabitEntity array to habit IDs
        let selectedHabitIds: [String]
        if let selectedHabits = configuration.selectedHabits {
            selectedHabitIds = selectedHabits.map { $0.id }
            logger.info("Timeline: Using \(selectedHabitIds.count) selected habits: \(selectedHabitIds)")
        } else {
            selectedHabitIds = []
            logger.info("Timeline: No habits selected, using default behavior")
        }
        
        let entry = ConfigurableEntry(
            date: Date(),
            habits: allHabits,
            selectedHabitIds: selectedHabitIds
        )
        
        logger.info("Timeline: Entry will display \(entry.displayHabits.count) habits")
        
        // Update timeline every 15 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date()) ?? Date()
        return Timeline(entries: [entry], policy: .after(nextUpdate))
    }
} 