# Roadmap

## Features

- Try the input down the bottom and have it work a little more like safari
- Pop sound and animation on seeing an app appear (but only if >30 seconds after launched app)
- Add a "Share" link (eg for developers to share a link to the app - generate `https://nexusbrowser.com/[ip:port]` for Capacitor links)
- Clear history should clear local-storage, cookies, index-db, preferences
- Show accessory bar to get autocomplete working
- Make the barcode reader plugin background color #333

## Plugin Requests
- @capacitor/geolocation
- @capacitor-community/bluetooth-le

## Remote Logging Features
- Add `DisableRemoteLogging` to UDP broadcast to prevent logging back to VS Code
- Log with device ID and generate/save device ID
- Capture fetch calls and log them (method, url, content size, latency)
- Capture line number and source file for console logs
- Remote logging features with Android

## CLI
- Ionic CLI should get feature UDP broadcast back
- New CLI `npx nexus` which is equivalent to `ionic serve` but runs external and broadcasts

## Advanced Logging
- Show log by device in its own tab
- Filter by type (checkbox). Eg info, warning, error
- Add network latency color
- Add request size color
- Show app startup summary (total time, number of calls, size)
- Web core vitals
- Show duplicate API calls (eg identify pages where caching would help)

## Testing
- Execute JS defined in VS Code
- API to simplify interactions, model on Cypress?
- VS Code feature to run tests and show pass/fails
- Capture DOM replay or video
- Emulate Identity Vault
- Automate ionic components
- Option to autostart based on app detection

## Bugs
- Some urls have errors: Disneyland, Mixcloud, Macdonalds, Ubereats, Phanpy.social
- Make sure stopping dev web server stops the icon from appearing in the app

