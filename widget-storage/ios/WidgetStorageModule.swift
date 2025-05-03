import ExpoModulesCore
import WidgetKit // Import WidgetKit

public class WidgetStorageModule: Module {
  // Define the app group identifier
  private let appGroup = "group.com.vdl.habitapp.widget"

  // Get UserDefaults instance for the app group
  private func getUserDefaults() -> UserDefaults? {
      return UserDefaults(suiteName: appGroup)
  }

  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module.
    Name("WidgetStorage")

    // Defines an async function `setItem`.
    AsyncFunction("setItem") { (key: String, value: String) in
      guard let userDefaults = getUserDefaults() else {
        throw Exceptions.WriteError(message: "Failed to get UserDefaults for app group \(appGroup)")
      }
      userDefaults.set(value, forKey: key)
    }.runOnQueue(.main)

    // Defines an async function `getItem`.
    AsyncFunction("getItem") { (key: String) -> String? in
      guard let userDefaults = getUserDefaults() else {
        throw Exceptions.ReadError(message: "Failed to get UserDefaults for app group \(appGroup)")
      }
      return userDefaults.string(forKey: key)
    }.runOnQueue(.main)

    // Defines an async function `removeItem`.
    AsyncFunction("removeItem") { (key: String) in
       guard let userDefaults = getUserDefaults() else {
        throw Exceptions.DeleteError(message: "Failed to get UserDefaults for app group \(appGroup)")
      }
      userDefaults.removeObject(forKey: key)
    }.runOnQueue(.main)


    // Defines a synchronous function `reloadAllTimelines`.
    Function("reloadAllTimelines") {
      if #available(iOS 14.0, *) {
          WidgetCenter.shared.reloadAllTimelines()
      } else {
          // Fallback on earlier versions
          print("WidgetCenter is not available before iOS 14.0")
      }
    }.runOnQueue(.main) // Ensure UI-related tasks run on the main queue
  }
} 