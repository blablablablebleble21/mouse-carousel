# Mouse Carousel V2 🎡

A powerful, modern radial action menu for Windows that appears at your cursor with a customizable hotkey. Built with Electron, RobotJS, and modern web technologies.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-ISC-green)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey)

## 🌟 Overview

Mouse Carousel V2 is a productivity tool that provides quick access to frequently used actions through an elegant radial menu. Simply press a hotkey, and a circular action wheel appears at your cursor location, allowing you to execute keyboard shortcuts, launch applications, or run commands with a single click.

### Why Use Mouse Carousel?

- **⚡ Speed**: Access any action in under a second
- **🎯 Contextual**: Appears exactly where your cursor is
- **♾️ Unlimited Actions**: Add as many actions as you need
- **🎨 Beautiful UI**: Smooth animations, dynamic sizing, and modern design
- **🔧 Fully Customizable**: Configure everything through a comprehensive settings UI
- **🔒 Secure**: Built with modern Electron security practices

---

## ✨ Features

### Core Functionality
- **Dynamic Radial Menu**: Automatically adjusts size based on number of actions
- **Unlimited Actions**: No artificial limits - add as many actions as you need
- **Two Action Types**:
  - **Keyboard Shortcuts**: Execute any key combination (copy, paste, screenshot, etc.)
  - **Execute Commands**: Launch applications or run shell commands
- **Smart Positioning**: Menu appears centered at cursor location
- **Hover Effects**: Icons rotate 360° and scale on hover with smooth animations

### Settings Interface
- **📋 Actions Manager**: Add, edit, delete, and test actions with intuitive UI
- **🎨 Appearance Customizer**: Adjust colors, sizes, and animation speeds
- **⌨️ Hotkey Editor**: Configure custom hotkeys with visual recording
- **🔄 Reset Functions**: Restore defaults for actions, appearance, or hotkeys independently
- **🎭 Icon Picker**: Choose from 1,800+ Bootstrap Icons or use custom icon names
- **✅ Real-time Preview**: Changes apply immediately to the carousel

### Technical Features
- **Writable Config**: Settings stored in user data directory (works in packaged app)
- **Context Isolation**: Modern Electron security with IPC bridge
- **No Vulnerabilities**: Uses up-to-date, secure packages
- **Native Performance**: RobotJS for reliable keyboard/mouse automation
- **Auto-sizing**: Window and UI adapt dynamically to action count

---

## 🚀 Quick Start

### For Users (Download Release)

1. **Download** the latest `MouseCarousel 2.0.0.exe` from [Releases](../../releases)
2. **Run** the portable executable (no installation needed)
3. **Press `Ctrl+Alt+Space`** to open the carousel (default hotkey)
4. **Press `Shift+Alt+Space`** to open Settings

### For Developers (Build from Source)

#### Prerequisites
- **Node.js** 16+ ([Download](https://nodejs.org/))
- **Visual Studio Build Tools** (for RobotJS compilation)
  - Install via: [Visual Studio Installer](https://visualstudio.microsoft.com/downloads/)
  - Select "Desktop development with C++"

#### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/mouse-carousel-v2.git
cd mouse-carousel-v2

# Install dependencies
npm install

# Rebuild native modules (if needed)
npm run rebuild

# Run in development mode
npm start
```

#### Building Executable

```bash
# Build Windows EXE (portable + installer)
npm run build

# Output: dist/MouseCarousel 2.0.0.exe (~71 MB)
```

---

## 📖 How to Use

### Basic Usage

1. **Open Carousel**: Press `Ctrl+Alt+Space` (or your custom hotkey)
2. **Select Action**: Click any icon in the radial menu
3. **Action Executes**: The carousel closes and your action runs
4. **Close Without Action**: Press `Esc` or click outside the menu

### Managing Actions

#### Via Settings UI (Recommended)

1. **Open Settings**: Press `Shift+Alt+Space`
2. **Go to Actions Tab**: Click "Actions" at the top
3. **Add New Action**:
   - Click "Add New Action" button
   - Enter action name
   - Choose icon (quick picker or Bootstrap icon name)
   - Select type (Keyboard or Execute)
   - Configure keys/command
   - Click "Save Action"
4. **Edit Existing**: Click pencil icon on any action
5. **Delete Action**: Click trash icon
6. **Test Action**: Click play icon to test without closing settings

#### Default Actions Included

| Icon | Name | Type | Function |
|------|------|------|----------|
| 🎵 | Spotify | Execute | Opens Spotify app |
| 📋 | Copy | Keyboard | Ctrl+C |
| ✅ | Paste | Keyboard | Ctrl+V |
| ✂️ | Screenshot | Execute | Opens Windows Snipping Tool |
| ⚙️ | Settings | Execute | Opens Windows Settings |
| 🪟 | Last Window | Keyboard | Alt+Tab |

### Customizing Appearance

1. **Open Settings** → **Appearance Tab**
2. **Adjust Colors**:
   - Background Color (with opacity)
   - Accent Color (hover effect)
   - Icon Color (default state)
   - Hover Icon Color
3. **Adjust Sizes**:
   - Ring Size: Base size (auto-adjusts with actions)
   - Animation Speed: How fast the menu appears
4. **Click "Save Appearance"**

### Changing Hotkeys

1. **Open Settings** → **Hotkeys Tab**
2. **Two Methods**:
   - **Type Manually**: Enter format like `CommandOrControl+Shift+A`
   - **Record**: Click "Record New Hotkey", press keys, done
3. **Modifiers Supported**:
   - `CommandOrControl` (Ctrl on Windows)
   - `Shift`
   - `Alt`
   - Individual keys: `A-Z`, `0-9`, `;`, `Space`, etc.
4. **Click "Save Hotkeys"**

---

## ⚙️ Configuration

### Config File Location

**Development**: `mouse-carousel-v2/config.json`
**Packaged App**: `%APPDATA%/MouseCarousel/config.json`

### Configuration Structure

```json
{
  "hotkey": "CommandOrControl+Alt+Space",
  "settingsHotkey": "Shift+Alt+Space",
  "theme": "dark",
  "ringSize": 300,
  "animationSpeed": 200,
  "actions": [
    {
      "name": "Action Name",
      "icon": "bootstrap-icon-name",
      "type": "keyboard|exec",
      "keys": ["key", "modifier"] // for keyboard type
      "command": "cmd.exe"         // for exec type
      "enabled": true
    }
  ],
  "themes": {
    "dark": {
      "bgColor": "rgba(25, 25, 25, 0.9)",
      "accentColor": "#9333ea",
      "iconColor": "#9333ea",
      "hoverIconColor": "#ffffff"
    }
  }
}
```

### Action Configuration Examples

#### Keyboard Shortcut Action
```json
{
  "name": "Select All",
  "icon": "cursor-text",
  "type": "keyboard",
  "keys": ["a", "control"],
  "enabled": true
}
```

#### Execute Command Action
```json
{
  "name": "Notepad",
  "icon": "journal-text",
  "type": "exec",
  "command": "notepad.exe",
  "enabled": true
}
```

#### Windows Settings/Apps (ms-settings:)
```json
{
  "name": "Wi-Fi Settings",
  "icon": "wifi",
  "type": "exec",
  "command": "start ms-settings:network-wifi",
  "enabled": true
}
```

### Icon Names

Use any [Bootstrap Icons](https://icons.getbootstrap.com/) name:
- `spotify`, `clipboard`, `clipboard-check`, `crop`, `gear`
- `calculator`, `calendar`, `camera`, `folder`, `terminal`
- `wifi`, `battery`, `volume-up`, `brightness-high`
- 1,800+ more available!

---

## 🎯 Dynamic Sizing

The carousel automatically adjusts its size based on the number of actions:

- **1-6 actions**: Base size (280px)
- **7+ actions**: Grows by 25px per additional action
- **Spacing**: Automatically calculates perfect angles for even distribution
- **No Overlap**: Sectors dynamically sized to prevent icon collisions

---

## 🔧 Troubleshooting

### Carousel doesn't appear
- Check if hotkey conflicts with other apps
- Try changing hotkey in Settings
- Ensure app is running (check system tray)

### Actions don't execute
- **First time after install**: Open and close carousel once to initialize
- Verify action configuration in Settings
- Test action using play button in Settings
- Check if target app is installed (for exec actions)

### Settings don't save
- Check if app has write permissions
- Look for config file in `%APPDATA%/MouseCarousel/`
- Try running as administrator

### Icons not showing
- Use exact Bootstrap Icons names (without `bi-` prefix)
- Check icon exists at: https://icons.getbootstrap.com/
- Try using quick icon picker in Settings

### RobotJS errors during build
- Install Visual Studio Build Tools
- Run `npm run rebuild`
- Ensure Node.js version matches Electron version

---

## 🛠️ Development

### Project Structure
```
mouse-carousel-v2/
├── src/
│   ├── main.js         # Electron main process
│   ├── preload.js      # IPC bridge (secure)
│   ├── renderer.js     # Carousel logic
│   ├── settings.js     # Settings UI logic
│   ├── index.html      # Carousel window
│   ├── settings.html   # Settings window
│   ├── style.css       # Carousel styles
│   └── settings.css    # Settings styles
├── config.json         # Default configuration
├── package.json        # Dependencies & build config
└── README.md          # This file
```

### Key Technologies
- **Electron 33.2.0**: Desktop application framework
- **RobotJS 0.6.0**: Native keyboard/mouse control
- **Bootstrap Icons 1.11.3**: Icon library
- **electron-builder 25.1.8**: Packaging tool

### npm Scripts
```bash
npm start         # Run in development
npm run dev       # Run with dev tools
npm run build     # Build Windows executable
npm run rebuild   # Rebuild native modules
```

---

## 📝 License

ISC License - See LICENSE file for details

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 🐛 Issues & Feedback

Found a bug or have a suggestion? [Open an issue](../../issues)

---

## 📜 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history

---

**Made with ❤️ for productivity enthusiasts**

### Available Icons

Use any [Bootstrap Icons](https://icons.getbootstrap.com/):
- `bi-spotify` - Spotify
- `bi-clipboard` - Clipboard
- `bi-copy` - Copy
- `bi-scissors` - Cut
- `bi-window-stack` - Windows
- `bi-gear` - Settings
- `bi-calculator` - Calculator
- `bi-folder` - Folder
- `bi-terminal` - Terminal
- `bi-code-square` - Code
- And 1,800+ more...

## 📦 Build Executable

Create a portable EXE:

```bash
npm run build
```

Your EXE will be in `dist/MouseCarousel.exe`

## ⌨️ Keyboard Shortcuts

- `Ctrl + ;` - Open/Close carousel (configurable)
- `ESC` - Close carousel
- `C` - Open config file (when carousel is open)

## 🎨 Themes

### Dark (Default)
Purple accents on dark background

### Light
Blue accents on light background

### Blue
Tech-inspired blue theme

### Green
Nature-inspired green theme

**Create Custom Theme:**
Add to `config.json`:
```json
"themes": {
  "custom": {
    "bgColor": "rgba(30, 30, 30, 0.95)",
    "accentColor": "#ff6b6b",
    "iconColor": "#ff6b6b",
    "hoverIconColor": "#ffffff"
  }
}
```

Then set: `"theme": "custom"`

## 🔧 Troubleshooting

### Hotkey not working
- Check if another app is using the same hotkey
- Try a different combination in `config.json`
- Restart the app after changing config

### Actions not executing
- Ensure `"enabled": true` in config
- Check command syntax for exec actions
- For keyboard actions, verify key names

### Build fails
- Run `npm run rebuild` first
- Ensure Visual Studio Build Tools are installed
- Check Node.js version (recommend v18+)

## 📋 System Requirements

- Windows 10/11
- Node.js 18+ (for development)
- Visual Studio Build Tools (for building)

## 🤝 Contributing

Feel free to fork and improve! Submit pull requests for:
- New action types
- Additional themes
- Bug fixes
- Performance improvements

## 📄 License

ISC

## 🆚 V1 vs V2 Comparison

| Feature | V1 | V2 |
|---------|----|----|
| Security | ❌ Context isolation OFF | ✅ Context isolation ON |
| Packages | ⚠️ Deprecated packages | ✅ Modern, secure packages |
| Configuration | ❌ Hard-coded in JS | ✅ JSON config file |
| Themes | ❌ One theme only | ✅ 4 themes + custom |
| Hotkey | ❌ Hard-coded | ✅ Configurable |
| Actions | ❌ 6 fixed actions | ✅ Unlimited custom actions |
| UI | ✅ Basic | ✅ Enhanced with tooltips |
| Animation | ✅ Good | ✅ Better |
| Error Handling | ❌ Minimal | ✅ Comprehensive |

---

**Made with ❤️ for productivity enthusiasts**
