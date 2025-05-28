import SwiftUI
import WidgetKit
import AppIntents
import os

private let viewLogger = Logger(subsystem: "com.vdl.habitapp.widget", category: "InteractiveViews")

struct InteractiveWidgetEntryView: View {
    var entry: InteractiveProvider.Entry
    @Environment(\.widgetFamily) var family

    // Determine max habits based on widget size
    private var maxHabits: Int {
        switch family {
        case .systemSmall:
            return 2  // 1 column, 2 rows
        case .systemMedium:
            return 4  // 2 columns, 2 rows
        case .systemLarge:
            return 10  // 2 columns, 4 rows
        @unknown default:
            return 2
        }
    }

    var body: some View {
        // Main container with no padding (following CalendarWidget pattern)
        VStack(alignment: .leading, spacing: 0) {
            switch family {
            case .systemSmall:
                // Small widget: 1 column, 2 rows with padding
                VStack(spacing: 10) {
                    ForEach(entry.habits.prefix(maxHabits), id: \.id) { habit in
                        HabitCard(habit: habit)
                    }
                    
                    // Fill remaining space if fewer habits
                    if entry.habits.count < maxHabits {
                        Spacer()
                    }
                }
                .padding(.vertical, 16)  // 16px vertical padding
                

                
            case .systemMedium, .systemLarge:
                // Medium/Large widget: 2 columns grid with edge-to-edge layout
                let columns: [GridItem] = Array(repeating: .init(.flexible()), count: 2)
                LazyVGrid(columns: columns, spacing: 10) {
                    ForEach(entry.habits.prefix(maxHabits), id: \.id) { habit in
                        HabitCard(habit: habit)
                    }
                }
                
            @unknown default:
                // Fallback to small layout
                VStack(spacing: 10) {
                    ForEach(entry.habits.prefix(maxHabits), id: \.id) { habit in
                        HabitCard(habit: habit)
                    }
                }
                .padding(.vertical, 16)  // 16px vertical padding
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        .containerBackground(.clear, for: .widget)
    }
}

struct HabitCard: View {
    let habit: Habit
    
    // Get today's date string key
    private var todayDateKey: String {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        let now = Date()
        var calendar = Calendar.current
        calendar.timeZone = TimeZone(secondsFromGMT: 0)!
        let startOfDay = calendar.startOfDay(for: now)
        return formatter.string(from: startOfDay)
    }
    
    // Determine completion status
    private var isCompletedToday: Bool {
        habit.weeklyStatus[todayDateKey] ?? false
    }
    
    private var isSkipped: Bool {
        // For now, we'll assume no skip functionality in widget
        // This can be extended later if needed
        false
    }
    
    // Calculate progress (0.0 to 1.0)
    private var progress: Double {
        isCompletedToday ? 1.0 : 0.0
    }
    
    // Get habit color
    private var habitColor: Color {
        Color(hex: habit.color) ?? .blue
    }
    
    var body: some View {
        Group {
            if isCompletedToday {
                // If completed, open app instead of toggling
                Button(intent: OpenAppIntent(habitID: habit.id)) {
                    habitCardContent
                }
            } else {
                // If not completed, allow toggling
                Button(intent: ToggleHabitIntent(habitID: habit.id)) {
                    habitCardContent
                }
            }
        }
        .buttonStyle(.plain)
        .opacity(isSkipped ? 0.7 : 1.0)
    }
    
    // Extract the card content to avoid duplication
    private var habitCardContent: some View {
        ZStack {
            // Base background (habit color with reduced opacity)
            RoundedRectangle(cornerRadius: 16)
                .fill(habitColor.opacity(0.38))
            
            // Progress overlay (full habit color)
            GeometryReader { geometry in
                HStack {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(habitColor)
                        .frame(width: geometry.size.width * progress)
                    Spacer(minLength: 0)
                }
            }
            
            // Content layer
            HStack() {
                // Habit icon
                ZStack {
                    if habit.icon.isEmoji {
                        Text(habit.icon)
                            .font(.system(size: 20))
                    } else {
                        Image(systemName: habit.icon)
                            .font(.system(size: 20))
                            .foregroundColor(Color.white)
                    }
                }
                .frame(width: 22, height: 22)
                
                // Habit info
                VStack(alignment: .leading, spacing: 2) {
                    Text(habit.name)
                        .font(.system(size: 8, weight: .bold))
                        .foregroundColor(.primary)
                        .lineLimit(1)
                    
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                
                // Action button
                ZStack {
                    // Button background
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color.black.opacity(0.4))
                        .frame(width: 30, height: 30)
                    
                    // Button icon
                    actionIcon
                        .foregroundColor(.white)
                }
            }
            .padding(.horizontal, 9)
            .padding(.vertical, 14)
        }
    }

    
    // Action icon based on completion status
    private var actionIcon: some View {
        Group {
            if isCompletedToday {
                Image(systemName: "checkmark")
                    .font(.system(size: 16))
            } else {
                Image(systemName: "plus")
                    .font(.system(size: 16))
            }
        }
    }
}

