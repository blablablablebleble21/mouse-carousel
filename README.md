# Mouse Carousel

A Windows background utility for any mouse button or keyboard macro. Press **Ctrl + Alt + J** (the default), and a six-action radial menu opens at the cursor.

The app runs continuously in the notification area instead of keeping a normal window open. It starts with Windows by default, keeps one process even if launched twice, and does not take focus from the active app when the ring appears. The pointer is locked to the ring while it is open; press **Esc** or click the center to close it. Copy and Paste therefore apply to the app that was active before opening the ring.

## Actions

1. Open Spotify
2. Paste
3. Copy
4. Switch to the previous window
5. Start Windows screen clipping
6. Open Windows Settings

## Install and run

Run `installation.bat` to install dependencies. No Visual Studio or native-module build step is required.

Run `launch.vbs` to start Mouse Carousel silently. A Mouse Carousel icon will appear in the system tray. Left-click it to open the ring; right-click it to toggle **Start with Windows** or quit the app.

Map a spare mouse button in your mouse software to **Ctrl + Alt + J**. If the shortcut does not open the ring, another app has claimed it; pick a different mapping and update `HOTKEY` in `main.js`.

## Development

Run `npm start` from this folder. The development process is also background-resident and can be stopped through the tray menu. Build the portable Windows app with `npm run dist`.
