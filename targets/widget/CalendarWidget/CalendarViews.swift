import SwiftUI
import WidgetKit // For containerBackground

struct WeekHeaderView: View {
    let currentDate: Date
    
    // Use shared utility for week range text
    private var weekRangeText: String {
        DateUtils.weekRangeText(for: currentDate)
    }
    
    var body: some View {
        HStack {
            Text(weekRangeText)
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(.primary)
        }
        .padding(.horizontal, 20)
        .padding(.top, 20)
        .padding(.bottom, 12)
    }
}

struct DayHeadersView: View {
    // Day abbreviations matching Figma
    private let dayAbbreviations = ["M", "T", "W", "T", "E", "S", "S"]
    
    var body: some View {
        HStack(spacing: 0) {
            ForEach(dayAbbreviations, id: \.self) { day in
                Text(day)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity)
            }
        }
    }
}

struct HabitRowView: View {
    let habit: Habit
    let currentDate: Date
    
    // Use shared utility to get dates of the week
    private var weekDates: [Date] {
        DateUtils.datesOfWeek(for: currentDate)
    }
    
    // Check completion status for a given date
    private func isCompleted(for date: Date) -> Bool {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds] 
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        let dateString = formatter.string(from: date)
        return habit.weeklyStatus[dateString] ?? false
    }
    
    // Circle view matching Figma design
    private func circleView(for date: Date) -> some View {
        let completed = isCompleted(for: date)
        
        return Circle()
            .stroke(completed ? Color.clear : Color.orange, lineWidth: 2)
            .background(
                Circle()
                    .fill(completed ? Color.green : Color.clear)
            )
            .overlay(
                completed ? 
                Image(systemName: "checkmark")
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(.white)
                : nil
            )
            .frame(width: 18, height: 18)
    }
    
    var body: some View {
        HStack(spacing: 16) {
            // Left Column: Habit Info (Icon + Name stacked)
            VStack(spacing: 4) {
                Text(habit.icon)
                    .font(.system(size: 20))
                Text(habit.name)
                    .font(.system(size: 12, weight: .medium))
                    .lineLimit(2)
                    .multilineTextAlignment(.center)
                    .minimumScaleFactor(0.8)
            }
            .frame(width: 80)
            
            // Right Column: Completion circles grid
            HStack(spacing: 0) {
                ForEach(weekDates, id: \.timeIntervalSince1970) { date in
                    circleView(for: date)
                        .frame(maxWidth: .infinity)
                }
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 8)
    }
}

struct WeeklyHabitsWidgetEntryView: View {
    var entry: SimpleEntry 
    @Environment(\.widgetFamily) var family
    
    // WIDGET SIZING: Determines how many habits to show based on widget size
    // Medium widget (329x155px): 3 habits fit comfortably
    // Large widget: 5 habits with good readability
    private var maxHabits: Int {
        switch family {
        case .systemMedium:
            return 3  // Matches Figma design exactly
        case .systemLarge:
            return 10  // Good balance for readability
        default:
            return 2  // Small widget fallback
        }
    }
    
    // DATE FORMATTING: Uses shared utility to format week range (e.g., "May 26 - Jun 1")
    private var weekRangeText: String {
        DateUtils.weekRangeText(for: entry.date)
    }
    
    // DAY HEADERS: Single letter abbreviations for days of the week
    // Matches Figma design: M T W T E S S (Monday through Sunday)
    private let dayAbbreviations = ["M", "T", "W", "T", "E", "S", "S"]
    
    // DATE CALCULATION: Gets array of 7 dates for the current week
    private var weekDates: [Date] {
        DateUtils.datesOfWeek(for: entry.date)
    }
    
    // COMPLETION STATUS: Checks if a habit is completed on a specific date
    // Uses ISO8601 format with fractional seconds and UTC timezone for consistency
    private func isCompleted(habit: Habit, for date: Date) -> Bool {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds] 
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        let dateString = formatter.string(from: date)
        
        return habit.weeklyStatus[dateString] ?? false
    }
    
    // CIRCLE DESIGN: Visual indicator for habit completion status
    // Gray circle = incomplete
    // Green filled circle with white checkmark = complete
    private func circleView(habit: Habit, for date: Date) -> some View {
        let completed = isCompleted(habit: habit, for: date)
        
        return Circle()
            .fill(completed ? Color.green : Color.gray.opacity(0.3))
            .overlay(
                // CHECKMARK: White checkmark icon for completed habits
                completed ? 
                Image(systemName: "checkmark")
                    .font(.system(size: 8, weight: .bold)) // Small, bold checkmark
                    .foregroundColor(.white)
                : nil
            )
            // SIZE: 18x18px circles as per Figma specifications
            .frame(width: 18, height: 18)
    }
    
    var body: some View {
        // MAIN CONTAINER: Flex column with space distribution
      VStack() {
            
            // DATE HEADER SECTION
            HStack {
                Text(weekRangeText)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(.black)
                Spacer()
            }

            // CONTENT SECTION: Day headers + habits table
            VStack(alignment: .trailing, spacing: 12) {
                
                // DAY HEADERS: Aligned to the right (flex-end)
                HStack(spacing: 8) {
                    ForEach(dayAbbreviations, id: \.self) { day in
                        Text(day)
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.secondary)
                            .frame(width: 18) // Fixed width for alignment
                    }
                }
                
                // HABITS TABLE: Flex column with gap
                VStack(spacing: 10) {
                    ForEach(Array(entry.habits.prefix(maxHabits).enumerated()), id: \.element.id) { index, habit in
                        
                        // HABIT ROW: Flex row with space-between
                        HStack {
                            // HABIT NAME SECTION: Flex row with items center
                            HStack(spacing: 6) {
                                // Habit icon
                              
                              ZStack {
                                  Color.clear

                                  if habit.icon.isEmoji {
                                      Text(habit.icon)
                                          .font(.system(size: 16))
                                          .frame(width: 24, height: 20, alignment: .center)
                                  } else {
                                      Image(systemName: habit.icon)
                                          .resizable()
                                          .scaledToFit()
                                          .foregroundColor(Color(hex: habit.color) ?? .gray)
                                          .frame(width: 24, height: 20, alignment: .center)
                                  }
                              }
                              .frame(width: 24, height: 20, alignment: .center) // Fixed icon container size

                                Text(habit.name)
                                .font(.system(size: 12, weight: .regular))
                                    .foregroundColor(Color(hex: "#293447"))
                                    .lineLimit(1)
                                    .frame(maxWidth: .infinity, alignment: .leading)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading) // flex: 1 equivalent
                            
                            // HABIT CIRCLES: Flex row with gap
                            HStack(spacing: 8) {
                                ForEach(weekDates, id: \.timeIntervalSince1970) { date in
                                    circleView(habit: habit, for: date)
                                }
                            }
                        }
                        .frame(height: 20) // Fixed row height
                    }
                }
                .frame(maxWidth: .infinity, alignment: .trailing) // Align table to right
            }
            
            
        }
      .background(Color.white) // White background for the content box

        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .containerBackground(.clear, for: .widget)
    }
}


