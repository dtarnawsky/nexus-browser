package com.getcapacitor;

import android.text.TextUtils;
import android.util.Log;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.DataOutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Deque;
import java.util.concurrent.ConcurrentLinkedDeque;

public class Logger {
    public static final String LOG_TAG_CORE = "Capacitor";
    private static String remoteLoggingUrl = "";
    private static Deque<String> queue = new ConcurrentLinkedDeque<>();
    public static CapConfig config;

    private static Logger instance;

    private static Logger getInstance() {
        if (instance == null) {
            instance = new Logger();
            instance.startLogger();
        }
        return instance;
    }

    public static void init(CapConfig config) {
        Logger.getInstance().loadConfig(config);
    }

    private void loadConfig(CapConfig config) {
        Logger.config = config;
    }

    public static String tags(String... subtags) {
        if (subtags != null && subtags.length > 0) {
            return LOG_TAG_CORE + "/" + TextUtils.join("/", subtags);
        }

        return LOG_TAG_CORE;
    }

    public static void verbose(String message) {
        verbose(LOG_TAG_CORE, message);
    }

    public static void verbose(String tag, String message) {
        if (!shouldLog()) {
            return;
        }

        sendPost(tag, message, "verbose");
        Log.v(tag, message);
    }

    public static void debug(String message) {
        debug(LOG_TAG_CORE, message);
    }

    public static void debug(String tag, String message) {
        if (!shouldLog()) {
            return;
        }

        // sendPost(tag, message, "debug");
        Log.d(tag, message);
    }

    public static void info(String message) {
        info(LOG_TAG_CORE, message);
    }

  public static String substringBetween(String str, String open, String close) {
    if (str == null || open == null || close == null) {
      return null;
    }
    int start = str.indexOf(open);
    if (start != -1) {
      int end = str.indexOf(close, start + open.length());
      if (end != -1) {
        return str.substring(start + open.length(), end);
      }
    }
    return null;
  }

  public static void info(String tag, String message) {
        if (!shouldLog()) {
            return;
        }

        if (message.contains("[#RemoteLoggingURL=")) {
          remoteLoggingUrl = substringBetween(message, "[#RemoteLoggingURL=", "]") + "/log";
        }

        sendPost(tag, message, "info");
        Log.i(tag, message);
    }

    public static void warn(String message) {
        warn(LOG_TAG_CORE, message);
    }

    public static void warn(String tag, String message) {
        if (!shouldLog()) {
            return;
        }

        sendPost(tag, message, "warn");
        Log.w(tag, message);
    }

    public static void error(String message) {
        error(LOG_TAG_CORE, message, null);
    }

    public static void error(String message, Throwable e) {
        error(LOG_TAG_CORE, message, e);
    }

    public static void error(String tag, String message, Throwable e) {
        if (!shouldLog()) {
            return;
        }

        sendPost(tag, message, "error");
        Log.e(tag, message, e);
    }

    public static boolean shouldLog() {
        return config == null || config.isLoggingEnabled();
    }

  public static void sendPost(String tag, String message, String type) {
    if (remoteLoggingUrl == "" || remoteLoggingUrl == "/log") {
       return;
    }
    try {
      if (tag.equalsIgnoreCase("Capacitor/Console")) {
        if (message.indexOf("Msg: ") != -1) {
          message = message.substring(message.indexOf("Msg: ") + 5);
          tag = "console";
          if (message.equalsIgnoreCase("undefined")) {
            return;
          }
        }
      } else if (tag.equalsIgnoreCase("Capacitor/Plugin")) {
        if (message.indexOf("To native (Cordova plugin):") != -1) {
          message = message.replace("To native (Cordova plugin): ", "");
          tag = "cordova";
        } else if (message.indexOf("To native (Capacitor plugin):") != -1) {
          message = message.replace("To native (Capacitor plugin): ", "");
          tag = "capacitor";
        }
      }
      JSONObject jsonParam = new JSONObject();
      jsonParam.put("message", message);
      jsonParam.put("tag", tag.toLowerCase().replaceAll("/","-"));
      jsonParam.put("level", type);
      if (queue.size() < 1000) {
        queue.add(jsonParam.toString());
      }
    } catch (Exception e) {
      Log.e(tag, "Failed to sendPost to "+ remoteLoggingUrl, e);
    }
  }

  public void startLogger() {
    Thread thread = new Thread(new Runnable() {
      @Override
      public void run() {
        while (true) {
          try {
            if (!queue.isEmpty()) {
              JSONArray jsonArray = new JSONArray();
              String tmp = "[";
              while (!queue.isEmpty()) {
                String val = queue.pop();
                if (tmp != "[") {
                  tmp = tmp + ",";
                }
                tmp = tmp + val;
              }
              tmp = tmp + "]";

              if (remoteLoggingUrl.startsWith("http")) {
                URL url = new URL(remoteLoggingUrl);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json;charset=UTF-8");
                conn.setRequestProperty("Accept", "application/json");
                conn.setDoOutput(true);
                conn.setDoInput(true);

                DataOutputStream os = new DataOutputStream(conn.getOutputStream());
                os.writeBytes(tmp);

                os.flush();
                os.close();
                Log.v("Capacitor/RemoteLog", remoteLoggingUrl + " " + String.valueOf(conn.getResponseCode()));
                conn.disconnect();
              } else {
                Log.v("Capacitor/RemoteLog", "Skipped sending log because it remote logging url is " +remoteLoggingUrl );
              }
            }
            Thread.sleep(1000);
          } catch (Exception e) {
            Log.e("Capacitor/RemoteLog", "Failed to send to " + remoteLoggingUrl, e);
          }
        }
      }
    });
    thread.start();
  }
}

