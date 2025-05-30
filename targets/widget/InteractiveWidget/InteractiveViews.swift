import SwiftUI
import WidgetKit
import AppIntents
import os

private let viewLogger = Logger(subsystem: "com.vdl.habitapp.widget", category: "InteractiveViews")

// Helper function to determine icon tint based on background color brightness
func getIconTint(hex: String, opacity: Double = 1.0) -> Color {
    // Remove # if present
    let cleanHex = hex.hasPrefix("#") ? String(hex.dropFirst()) : hex
    
    // Convert hex to RGB
    guard cleanHex.count == 6,
          let r = Int(cleanHex.prefix(2), radix: 16),
          let g = Int(cleanHex.dropFirst(2).prefix(2), radix: 16),
          let b = Int(cleanHex.suffix(2), radix: 16) else {
        return .primary // Fallback to primary color
    }
    
    // Apply opacity by blending with white background (255, 255, 255)
    let adjustedR = Int(Double(r) * opacity + 255.0 * (1.0 - opacity))
    let adjustedG = Int(Double(g) * opacity + 255.0 * (1.0 - opacity))
    let adjustedB = Int(Double(b) * opacity + 255.0 * (1.0 - opacity))
    
    // Calculate YIQ brightness with opacity-adjusted values
    let yiq = (adjustedR * 299 + adjustedG * 587 + adjustedB * 114) / 1000
    
    // Return dark color for light backgrounds, white for dark backgrounds
    return yiq > 150 ? .primary : .white
}

struct InteractiveWidgetEntryView: View {
    var entry: ConfigurableEntry
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

    // Use displayHabits from ConfigurableEntry and limit by widget size (same as Calendar Widget)
    private var displayHabits: [Habit] {
        Array(entry.displayHabits.prefix(maxHabits))
    }
  
    var body: some View {
        // Main container with no padding (following CalendarWidget pattern)
        VStack(alignment: .leading, spacing: 0) {
            switch family {
            case .systemSmall:
                // Small widget: 1 column, 2 rows with padding
                VStack(spacing: 10) {
                    ForEach(displayHabits, id: \.id) { habit in
                        HabitCard(habit: habit)
                    }
                    
                    // Fill remaining space if fewer habits
                    if displayHabits.count < maxHabits {
                        Spacer()
                    }
                }
                .padding(.vertical, 16)  // 16px vertical padding
                

                
            case .systemMedium, .systemLarge:
                // Medium/Large widget: 2 columns grid with edge-to-edge layout
                let columns: [GridItem] = Array(repeating: .init(.flexible()), count: 2)
                LazyVGrid(columns: columns, spacing: 10) {
                    ForEach(displayHabits, id: \.id) { habit in
                        HabitCard(habit: habit)
                    }
                }
                
            @unknown default:
                // Fallback to small layout
                VStack(spacing: 10) {
                    ForEach(displayHabits, id: \.id) { habit in
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
  private var iconColor: Color {
      if habit.icon.isEmoji {
          return .clear // Not used for emojis
      }
      
    return getIconTint(hex: habit.color)
  }
    var body: some View {
        Group {
            if isCompletedToday {
                // Use Link to open the app for completed habits (Apple's recommended approach)
                Link(destination: URL(string: "habitapp://")!) {
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
        .opacity(isCompletedToday ? 1 : 0.62)
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
                            .foregroundColor(Color(iconColor))
                    }
                }
                .frame(width: 22, height: 22)
                
                // Habit info
                VStack(alignment: .leading, spacing: 2) {
                    Text(habit.name)
                    .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(.primary)
//                        .lineLimit(1)
                    
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

