# Mouse Carousel V2 - Changes & Improvements

## Overview
Complete rebuild of Mouse Carousel with modern architecture, enhanced security, and comprehensive customization UI.

## Key Changes from V1

### 🔐 Security Improvements
- **Context Isolation**: Enabled for renderer process security
- **Secure IPC**: All communication through controlled preload bridge
- **No Vulnerable Dependencies**: Removed deprecated `@tkomde/iohook`
- **Modern Electron**: Using stable v33.2.0 (previously v39.2.7)

### ⌨️ New Hotkeys
- **Carousel**: `Ctrl+Alt+Space` (previously Ctrl+;)
- **Settings**: `Shift+Alt+Space` (new feature)
- Both are customizable through the settings UI

### 🎨 Settings UI
Complete visual customization interface with:

#### Actions Tab
- Add up to 12 custom actions
- Each action has:
  - Icon (from Bootstrap Icons library - 1,800+ options)
  - Name
  - Type: Keyboard shortcut OR Execute command
  - Test button to try before saving
- Edit/delete existing actions
- Live counter showing X/12 actions used

#### Appearance Tab
- **Color Pickers** with opacity control:
  - Background color
  - Accent color
  - Icon color
  - Hover icon color
- **Ring Size Slider**: 200-500px
- **Animation Speed Slider**: 50-500ms
- Real-time preview updates

#### Hotkeys Tab
- Customize carousel hotkey
- Customize settings hotkey
- Record mode: Click "Record" and press key combination
- Validation to prevent duplicate hotkeys

#### About Tab
- Version information
- Feature list
- Usage tips
- Keyboard shortcuts reference

### 🏗️ Architecture Improvements

#### Dual Window System
- **Carousel Window**: Transparent overlay at cursor position
- **Settings Window**: Full-featured configuration interface
- Both windows communicate with main process via IPC

#### Configuration System
- External `config.json` for easy backup/sharing
- Live reload when settings change
- Automatic fallback to defaults if config missing
- Validation: Maximum 12 actions enforced

#### Code Structure
```
src/
├── main.js          - Main process (windows, hotkeys, IPC)
├── preload.js       - Secure IPC bridge
├── renderer.js      - Carousel UI logic
├── settings.js      - Settings UI logic (NEW)
├── index.html       - Carousel interface
├── settings.html    - Settings interface (NEW)
├── style.css        - Carousel styling
└── settings.css     - Settings styling (NEW)
```

## How to Use

### First Time Setup
1. Run the application
2. Press `Shift+Alt+Space` to open settings
3. Go to Actions tab and add your first action:
   - Click "Add New Action"
   - Enter name (e.g., "Copy")
   - Choose icon (e.g., "clipboard")
   - Select type: Keyboard
   - Enter keys (e.g., "Ctrl+C")
   - Click "Test" to verify
   - Click "Save"
4. Customize appearance with color pickers
5. Adjust ring size and animation speed to your liking

### Daily Usage
1. Press `Ctrl+Alt+Space` to open carousel at cursor
2. Click an action icon to execute it
3. Carousel automatically closes after selection
4. Press `Shift+Alt+Space` anytime to modify settings

### Action Types

#### Keyboard Shortcut
Simulates pressing key combinations:
- Format: `Ctrl+C`, `Alt+Tab`, `Ctrl+Shift+T`
- Use cases: Copy, paste, browser shortcuts, IDE commands

#### Execute Command
Runs system commands or programs:
- Command: `notepad.exe`, `explorer.exe`, `calc.exe`
- Args (optional): Space-separated arguments
- Use cases: Open apps, run scripts, system commands

## Building EXE

### Development
```bash
npm start
```

### Build Portable EXE
```bash
npm run build
```

Output: `dist\MouseCarousel 2.0.0.exe` (portable, no installation required)

## Technical Details

### Dependencies
- **electron** v33.2.0 - Desktop app framework
- **robotjs** v0.6.0 - Keyboard/mouse automation
- **electron-builder** v25.1.8 - Packaging tool
- **@electron/rebuild** v3.7.2 - Native module compiler

### Configuration File
Located at project root: `config.json`

```json
{
  "hotkey": "CommandOrControl+Alt+Space",
  "settingsHotkey": "Shift+Alt+Space",
  "ringSize": 300,
  "animationSpeed": 200,
  "maxActions": 12,
  "theme": {
    "bgColor": "rgba(25, 25, 25, 0.9)",
    "accentColor": "#9333ea",
    "iconColor": "#9333ea",
    "hoverIconColor": "#ffffff"
  },
  "actions": [
    {
      "name": "Copy",
      "icon": "clipboard",
      "type": "keyboard",
      "keys": "Ctrl+C"
    }
  ]
}
```

### Icon Reference
Browse icons at: https://icons.getbootstrap.com/
Format: `icon-name` (without `bi-` prefix)
Examples: `clipboard`, `gear`, `search`, `heart`, `star`

## Troubleshooting

### Hotkeys Not Working
- Check no other app is using the same combination
- Try different modifiers (Ctrl, Alt, Shift)
- Restart app after changing hotkeys

### Action Not Executing
- Use Test button in settings to debug
- For keyboard actions: Check key format (e.g., `Ctrl+C` not `ctrl+c`)
- For exec actions: Use full path (e.g., `C:\Windows\System32\notepad.exe`)

### Build Issues
- Ensure Visual Studio 2022 Build Tools installed (not 2025/2026)
- Delete `node_modules` and run `npm install` again
- Check Electron cache: `%LOCALAPPDATA%\electron\Cache`

## Tips & Tricks

1. **Quick Access**: Position carousel near where you work most
2. **Muscle Memory**: Keep actions in same positions
3. **Color Coding**: Use different accent colors for different workflows
4. **Backup Config**: Copy `config.json` to preserve your setup
5. **Portable**: Copy entire app folder to USB for use on any PC

## Version History

### V2.0.0 (Current)
- Complete rewrite with security improvements
- Settings UI with visual customization
- Dual hotkey system
- Up to 12 actions (previously 6-8)
- Modern Electron architecture

### V1.0.0 (Original)
- Basic carousel functionality
- Fixed hotkey (Ctrl+;)
- Manual JSON editing required
- Limited to ~6 actions
- Security concerns with context isolation disabled

## Credits
- **Electron**: Cross-platform desktop apps
- **RobotJS**: Native automation
- **Bootstrap Icons**: Icon library
- Built with ❤️ for productivity enthusiasts
