# Mouse Carousel V2 - Development

## Architecture

### File Structure
```
mouse-carousel-v2/
├── src/
│   ├── main.js          # Electron main process
│   ├── preload.js       # Secure IPC bridge
│   ├── renderer.js      # UI logic
│   ├── index.html       # Main window
│   └── style.css        # Styles
├── assets/              # Icons and resources
├── config.json          # User configuration
├── package.json         # Dependencies
└── README.md           # Documentation
```

### Security Model

**Context Isolation:** Enabled  
**Node Integration:** Disabled  
**IPC:** Via secure preload script only

### Key Improvements

1. **Secure by Default**
   - Context isolation prevents renderer from accessing Node APIs
   - Controlled IPC through preload script
   - CSP headers to prevent XSS

2. **Configuration System**
   - External JSON config (no code changes needed)
   - Hot-reload support
   - Validation and defaults

3. **Modern Electron**
   - Latest stable version
   - No deprecated APIs
   - Proper lifecycle management

4. **Error Handling**
   - Try-catch blocks throughout
   - Graceful fallbacks
   - Console logging for debugging

## Development Commands

```bash
# Install
npm install

# Run with dev mode
npm run dev

# Build production
npm run build

# Rebuild native modules
npm run rebuild
```

## Adding New Actions

1. Edit `config.json`
2. Add action object:
```json
{
  "id": "unique-id",
  "name": "Display Name",
  "icon": "bi-icon-name",
  "type": "keyboard|exec",
  "keys": ["key", "modifier"],  // for keyboard
  "command": "command",          // for exec
  "enabled": true
}
```

3. Restart app or reload config

## Creating Themes

Themes use CSS custom properties:

```json
"yourtheme": {
  "bgColor": "rgba(r, g, b, a)",
  "accentColor": "#hexcolor",
  "iconColor": "#hexcolor",
  "hoverIconColor": "#hexcolor"
}
```

## Performance Tips

- Keep action count under 8 for best UX
- Use keyboard actions when possible (faster than exec)
- Optimize animation speed for your system
- Disable unused actions instead of removing

## Testing

1. Test each action individually
2. Verify hotkey doesn't conflict
3. Check theme switching
4. Test config reload
5. Verify error handling

## Building for Distribution

```bash
npm run build
```

Creates both:
- Portable EXE (single file)
- NSIS installer (traditional)

## Known Limitations

- RobotJS requires native build (VS Build Tools needed)
- Windows only (Electron supports all, but actions are Windows-specific)
- Hotkey must be globally available

## Future Enhancements

- Settings UI (instead of editing JSON)
- Action recorder/macro support
- Multiple ring profiles
- Custom icon support
- Sound effects
- Mouse gesture trigger
- Multi-monitor improvements
