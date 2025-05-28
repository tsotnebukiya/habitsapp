import WidgetKit
import SwiftUI

// Use a more conventional name like MainWidgetBundle or AppWidgetBundle
@main
struct MainWidgetBundle: WidgetBundle {
    var body: some Widget {
      
      // Register the Interactive Widget
      InteractiveHabitWidget()
      
        // Register the Calendar Widget
        WeeklyHabitsWidget()
        

    }
}
