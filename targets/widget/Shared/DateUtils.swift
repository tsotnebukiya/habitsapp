import Foundation

struct DateUtils {
    
    // Get short weekday symbols for the current week starting from the week of the given date
    static func weekDays(for date: Date) -> [String] {
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: date)
        // Use yearForWeekOfYear and weekOfYear to reliably get the start of the week
        let weekStart = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: today))!
        
        return (0...6).map { dayOffset in
            let currentDay = calendar.date(byAdding: .day, value: dayOffset, to: weekStart)!
            // Get the weekday index (1 for Sunday, 7 for Saturday) and adjust for zero-based array index
            let weekdayIndex = calendar.component(.weekday, from: currentDay) - 1
            return calendar.shortWeekdaySymbols[weekdayIndex]
        }
    }
    
    // Get the date range string for the week containing the given date
    static func weekRangeText(for date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d" // Format as 'Jan 1'
        
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: date)
        let weekStart = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: today))!
        let weekEnd = calendar.date(byAdding: .day, value: 6, to: weekStart)! // End of the week (6 days after start)
        
        return "\(formatter.string(from: weekStart)) - \(formatter.string(from: weekEnd))"
    }
    
    // Get an array of Date objects representing each day of the week for the given date
    static func datesOfWeek(for date: Date, calendarIdentifier: Calendar.Identifier = .iso8601, timeZoneIdentifier: String = "UTC") -> [Date] {
        var calendar = Calendar(identifier: calendarIdentifier)
        // Ensure consistent timezone, UTC is often best for date calculations
        calendar.timeZone = TimeZone(identifier: timeZoneIdentifier) ?? TimeZone.current 

        let today = calendar.startOfDay(for: date)
        let weekStart = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: today))!

        return (0...6).map { dayOffset in
            calendar.date(byAdding: .day, value: dayOffset, to: weekStart)!
        }
    }
} 
