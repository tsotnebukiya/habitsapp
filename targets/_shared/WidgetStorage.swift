import Foundation

@objc(WidgetStorage)
class WidgetStorage: NSObject {
    
    @objc(setItem:value:withResolver:withRejecter:)
    func setItem(key: String, value: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        if let userDefaults = UserDefaults(suiteName: "group.com.vdl.habitapp.widget") {
            userDefaults.set(value, forKey: key)
            resolve(true)
        } else {
            reject("ERROR", "Failed to access UserDefaults", nil)
        }
    }
    
    @objc(getItem:withResolver:withRejecter:)
    func getItem(key: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        if let userDefaults = UserDefaults(suiteName: "group.com.vdl.habitapp.widget") {
            if let value = userDefaults.string(forKey: key) {
                resolve(value)
            } else {
                resolve(nil)
            }
        } else {
            reject("ERROR", "Failed to access UserDefaults", nil)
        }
    }
    
    @objc(removeItem:withResolver:withRejecter:)
    func removeItem(key: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        if let userDefaults = UserDefaults(suiteName: "group.com.vdl.habitapp.widget") {
            userDefaults.removeObject(forKey: key)
            resolve(true)
        } else {
            reject("ERROR", "Failed to access UserDefaults", nil)
        }
    }
} 