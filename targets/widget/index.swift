import WidgetKit
import SwiftUI

// Use a more conventional name like MainWidgetBundle or AppWidgetBundle
@main
struct MainWidgetBundle: WidgetBundle {
    var body: some Widget {
        // Register the Calendar Widget
        WeeklyHabitsWidget()
        
        // Register the Interactive Widget
        InteractiveHabitWidget()
    }
}
