public class CAPLog {
    private static var rAddress: String = ""
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
        var tag = "capacitor"
        var level = "info"
        var msg = message
        if (msg.starts(with: "⚡️  [log] - ")) {
            level = "info"
            tag = "console"
            msg = msg.replacingOccurrences(of: "⚡️  [log] - ", with: "")
            if (msg.contains("[#RemoteLoggingURL=")) {
                rAddress = msg.replacingOccurrences(of: "[#RemoteLoggingURL=", with: "").replacingOccurrences(of: "]", with: "")
            }
        } else if (msg.starts(with: "⚡️  To Native ->  ")) {
            level = "verbose"
            msg = msg.replacingOccurrences(of: "⚡️  To Native ->  ", with: "")
        } else if (msg.starts(with: "⚡️  TO JS ")) {
            level = "verbose"
            msg = msg.replacingOccurrences(of: "⚡️  TO JS ", with: "")
        } else if (msg.starts(with: "⚡️  [error] - ")) {
            tag = "console"
            level = "error"
            msg = msg.replacingOccurrences(of: "⚡️  [error] - ", with: "")
        } else if (msg.starts(with: "To Native Cordova ->  ")) {
            tag = "cordova"
            level = "verbose"
            msg = msg.replacingOccurrences(of: "To Native Cordova ->  ", with: "")
        } else if (msg.starts(with: "Error: ")) {
            level = "error"
            tag = "capacitor"
            msg = msg.replacingOccurrences(of: "Error: ", with: "")
        } else if (msg.starts(with: "⚡️  [warn] - ")) {
            level = "warn"
            tag = "console"
            msg = msg.replacingOccurrences(of: "⚡️  [warn] - ", with: "")
        } else if (msg.starts(with: "⚡️  ")) {
            msg = msg.replacingOccurrences(of: "⚡️  ", with: "")
        }
        
        if (rAddress == "") {
            return
        }
        
        let url = URL(string: rAddress + "/log")!
        let jsonObject: [String: Any] = [
            "message": msg,
            "level": level,
            "tag": tag
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
}
