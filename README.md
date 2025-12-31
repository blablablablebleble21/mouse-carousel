
# 🟣Mouse quick pannel carousel

This carousel is for any mouse with a spare key button, or a combination of keboard presses(see below).

# 🚀 Key Features

Radial Navigation: 6-sector interactive ring that includes:

1. Setting opener.
2. Spotify opener.
3. Paste the lest copied item(s).
4. Copy the marked item(s).
5. Switch to last opened tab.
6. Snapshot the screen.  
  
  
Hardware Macro Ready: Optimized to be triggered via a set of keys (using the Control + ; hotkey by default).

Invisible Interaction: The system cursor is hidden while the ring is active, focusing the user's attention entirely on the action slices.

Smart Focus Hand-off: Automatically restores focus to the underlying application before executing simulated keystrokes like Copy or Paste.

# 🛠 Developer Setup (JS Version)
For those wanting to run the js code code:

Install Node.js: Ensure you have the runtime installed.

Dependencies: Run npm install to get electron and robotjs.

Native Rebuild: Because RobotJS is a native module, you must run ./node_modules/.bin/electron-rebuild so it matches your Electron version.

Start: Run npm start to initialize the listener.
