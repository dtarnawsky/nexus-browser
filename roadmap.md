# Roadmap

## Features

- If a call fails, report the wifi network the user is on and ask them to make sure their Mac/PC is on the same network
- Check if the address is localhost, if it is then ask the user to host their app on an external address
- Send console/native logs back to dev server and report in vscode output window
- VS Code Ext creates ionic-debug.json with:
```
{
    logServer: {
       url: "http://192.168.0.1:4216"
    },
    plugins: {
        "@capacitor/splashscreen": "1.0.0"
    }
}
```
- Send to the debug log if Capacitor Preview signals the app to do so

## UDP Discovery
Old plugin at:
https://github.com/ionic-team/cordova-plugin-ionic-discover

For Node:
https://github.com/ionic-team/ionic-discover

## ZeroConf
Use this for Node: https://github.com/watson/bonjour
Use this for Capacitor: https://github.com/trik/capacitor-zeroconf


## Issues

