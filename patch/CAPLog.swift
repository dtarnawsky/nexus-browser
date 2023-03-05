public class CAPLog {
    public static var enableLogging: Bool = true

    public static func print(_ items: Any..., separator: String = " ", terminator: String = "\n") {
        if enableLogging {
            var msg = ""
            for (itemIndex, item) in items.enumerated() {
                Swift.print("\(item)".prefix(4068), terminator: itemIndex == items.count - 1 ? terminator : separator)
                msg = msg + "\(item)"
                if (itemIndex != items.count - 1) {
                    msg = msg + separator
                }
            }
            post(message: msg)
        }
    }
    
    private static func post(message: String) {
        let rAddress = getRemoteAddress()
        // "http://192.168.0.125:8942/log"
        if (rAddress == nil) {
            return
        }
        let url = URL(string: rAddress! + "/log")!
        var level = "ios"
        var msg = message
        if (msg.starts(with: "⚡️  [log] - ")) {
            level = "info"
            msg = msg.replacingOccurrences(of: "⚡️  [log] - ", with: "")
        }
        if (msg.starts(with: "⚡️  [error] - ")) {
            level = "error"
            msg = msg.replacingOccurrences(of: "⚡️  [error] - ", with: "")
        }
        if (msg.starts(with: "⚡️  [warn] - ")) {
            level = "warn"
            msg = msg.replacingOccurrences(of: "⚡️  [warn] - ", with: "")
        }
        
        let jsonObject: [String: Any] = [
            "message": msg,
            "level": level
        ]
        let ob = [ jsonObject ]
        let jsonData = try? JSONSerialization.data(withJSONObject: ob)
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.httpBody = jsonData
        
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.addValue("application/json", forHTTPHeaderField: "Accept")
        
        let task = URLSession.shared.dataTask(with: request) { data, response, error in
        }
        task.resume()
    }
    
    // Get from preferences
    private static func getRemoteAddress() -> String? {
        let preferences = Preferences(with: PreferencesConfiguration())
        let key = "RemoteLoggingURL"
        let value = preferences.get(by: key)
        return value
    }
}

public class Preferences {
    private let configuration: PreferencesConfiguration

    private var defaults: UserDefaults {
        return UserDefaults.standard
    }

    private var prefix: String {
        switch configuration.group {
        case .cordovaNativeStorage:
            return ""
        case let .named(group):
            return group + "."
        }
    }

    private var rawKeys: [String] {
        return defaults.dictionaryRepresentation().keys.filter { $0.hasPrefix(prefix) }
    }

    public init(with configuration: PreferencesConfiguration) {
        self.configuration = configuration
    }

    public func get(by key: String) -> String? {
        return defaults.string(forKey: applyPrefix(to: key))
    }

    public func set(_ value: String, for key: String) {
        defaults.set(value, forKey: applyPrefix(to: key))
    }

    public func remove(by key: String) {
        defaults.removeObject(forKey: applyPrefix(to: key))
    }

    public func removeAll() {
        for key in rawKeys {
            defaults.removeObject(forKey: key)
        }
    }

    public func keys() -> [String] {
        return rawKeys.map { String($0.dropFirst(prefix.count)) }
    }

    private func applyPrefix(to key: String) -> String {
        return prefix + key
    }
}

public struct PreferencesConfiguration {
    public enum Group {
        case named(String), cordovaNativeStorage
    }

    let group: Group

    public init(for group: Group = .named("CapacitorStorage")) {
        self.group = group
    }
}
