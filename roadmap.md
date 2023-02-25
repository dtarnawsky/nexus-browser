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

### Images
- download favico.ico
cap http will return:
{"status":200,"url":"https://www.google.com/favicon.ico","headers":{"cross-origin-resource-policy":"cross-origin","cross-origin-opener-policy-report-only":"same-origin; report-to=\"static-on-bigtable\"","x-xss-protection":"0","Age":"14724","Alt-Svc":"h3=\":443\"; ma=2592000,h3-29=\":443\"; ma=2592000","Content-Length":"1494","Content-Type":"image/x-icon","x-content-type-options":"nosniff","Cache-Control":"public, max-age=691200","Date":"Fri, 24 Feb 2023 20:52:39 GMT","Vary":"Accept-Encoding","Accept-Ranges":"bytes","Server":"sffe","Content-Encoding":"gzip","Expires":"Sat, 04 Mar 2023 20:52:39 GMT","report-to":"{\"group\":\"static-on-bigtable\",\"max_age\":2592000,\"endpoints\":[{\"url\":\"https://csp.withgoogle.com/csp/report-to/static-on-bigtable\"}]}","Last-Modified":"Tue, 22 Oct 2019 18:30:00 GMT"}}


## UDP Discovery
Old plugin at:
https://github.com/ionic-team/cordova-plugin-ionic-discover

For Node:
https://github.com/ionic-team/ionic-discover

## ZeroConf
Use this for Node: https://github.com/watson/bonjour
Use this for Capacitor: https://github.com/trik/capacitor-zeroconf


## Issues

