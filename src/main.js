const { app, BrowserWindow, screen, globalShortcut, ipcMain } = require('electron');
const { exec } = require('child_process');
const robot = require('robotjs');
const fs = require('fs');
const path = require('path');

let carouselWin;
let settingsWin;
let config;

// Use userData directory for writable config (works in packaged app)
const userDataPath = app.getPath('userData');
const configPath = path.join(userDataPath, 'config.json');
const defaultConfigPath = path.join(__dirname, '..', 'config.json');

console.log('Config path:', configPath);
console.log('User data path:', userDataPath);

// Load configuration
function loadConfig() {
    try {
        // If config doesn't exist in userData, copy from default
        if (!fs.existsSync(configPath)) {
            console.log('Config not found in userData, creating from defaults...');
            
            // Try to copy from packaged default config
            if (fs.existsSync(defaultConfigPath)) {
                fs.copyFileSync(defaultConfigPath, configPath);
                console.log('Copied default config to userData');
            } else {
                // Create from hardcoded defaults
                const defaultConfig = getDefaultConfig();
                fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
                console.log('Created config from hardcoded defaults');
            }
        }
        
        const data = fs.readFileSync(configPath, 'utf8');
        config = JSON.parse(data);
        console.log('Config loaded successfully');
        return config;
    } catch (error) {
        console.error('Error loading config:', error);
        const defaultConfig = getDefaultConfig();
        config = defaultConfig;
        // Try to save it
        try {
            fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
        } catch (saveError) {
            console.error('Error saving default config:', saveError);
        }
        return config;
    }
}

function getDefaultConfig() {
    return {
        hotkey: 'CommandOrControl+Alt+Space',
        settingsHotkey: 'Shift+Alt+Space',
        theme: 'dark',
        ringSize: 300,
        animationSpeed: 200,
        actions: [
            {
                name: "Spotify",
                icon: "spotify",
                type: "exec",
                command: "start spotify:",
                enabled: true
            },
            {
                name: "Copy",
                icon: "clipboard",
                type: "keyboard",
                keys: ["c", "control"],
                enabled: true
            },
            {
                name: "Paste",
                icon: "clipboard-check",
                type: "keyboard",
                keys: ["v", "control"],
                enabled: true
            },
            {
                name: "Screenshot",
                icon: "crop",
                type: "exec",
                command: "explorer ms-screenclip:",
                enabled: true
            },
            {
                name: "Settings",
                icon: "gear",
                type: "exec",
                command: "start ms-settings:",
                enabled: true
            },
            {
                name: "Last Window",
                icon: "window-stack",
                type: "keyboard",
                keys: ["tab", "alt"],
                enabled: true
            }
        ],
        themes: {
            dark: {
                bgColor: 'rgba(25, 25, 25, 0.9)',
                accentColor: '#9333ea',
                iconColor: '#9333ea',
                hoverIconColor: '#ffffff'
            }
        }
    };
}

// Save configuration
function saveConfig() {
    try {
        console.log('Saving config to:', configPath);
        
        // Ensure directory exists
        const dir = path.dirname(configPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log('Created config directory:', dir);
        }
        
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log('Config saved successfully');
        return true;
    } catch (error) {
        console.error('Error saving config to', configPath, ':', error);
        console.error('Error details:', error.message);
        return false;
    }
}

function createCarouselWindow() {
    // Calculate dynamic ring size based on action count
    const totalActions = config.actions.filter(a => a.enabled).length;
    const baseSize = 280;
    const sizePerAction = 25;
    const dynamicSize = Math.max(baseSize, baseSize + (totalActions - 6) * sizePerAction);
    
    carouselWin = new BrowserWindow({
        width: dynamicSize,
        height: dynamicSize,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        show: false,
        focusable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false
        }
    });

    carouselWin.loadFile(path.join(__dirname, 'index.html'));
    carouselWin.setMenuBarVisibility(false);
    
    carouselWin.webContents.on('did-finish-load', () => {
        carouselWin.webContents.send('config-update', config);
    });
}

function createSettingsWindow() {
    if (settingsWin && !settingsWin.isDestroyed()) {
        settingsWin.focus();
        return;
    }
    
    settingsWin = new BrowserWindow({
        width: 1000,
        height: 750,
        resizable: true,
        frame: true,
        alwaysOnTop: false,
        skipTaskbar: false,
        minimizable: true,
        maximizable: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false
        }
    });

    settingsWin.loadFile(path.join(__dirname, 'settings.html'));
    settingsWin.setMenuBarVisibility(false);
    
    settingsWin.webContents.on('did-finish-load', () => {
        settingsWin.webContents.send('config-update', config);
    });
}

// Execute keyboard action
function executeKeyboard(keys) {
    try {
        // Handle both string and array format
        let parts;
        if (Array.isArray(keys)) {
            parts = keys.map(k => String(k).trim().toLowerCase());
        } else {
            parts = String(keys).split('+').map(k => k.trim().toLowerCase());
        }
        
        const modifiers = [];
        let mainKey = '';
        
        parts.forEach(part => {
            if (part === 'ctrl' || part === 'control' || part === 'commandorcontrol') {
                modifiers.push('control');
            } else if (part === 'shift') {
                modifiers.push('shift');
            } else if (part === 'alt') {
                modifiers.push('alt');
            } else if (part === 'super' || part === 'command' || part === 'meta') {
                modifiers.push('command');
            } else {
                mainKey = part;
            }
        });
        
        if (!mainKey) {
            console.error('No main key found in:', keys);
            return false;
        }
        
        console.log('Executing key tap:', mainKey, 'with modifiers:', modifiers);
        robot.keyTap(mainKey, modifiers);
        return true;
    } catch (error) {
        console.error('Keyboard execution error:', error);
        return false;
    }
}

// Execute command action
function executeExec(command, args = []) {
    try {
        const fullCommand = args.length > 0 ? `${command} ${args.join(' ')}` : command;
        exec(fullCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('Exec error:', error);
            } else if (stderr) {
                console.error('Exec stderr:', stderr);
            }
        });
        return true;
    } catch (error) {
        console.error('Exec action error:', error);
        return false;
    }
}

// Register global hotkeys
function registerHotkeys() {
    try {
        globalShortcut.unregisterAll();
        
        // Validate hotkeys before attempting to register
        const validateHotkey = (hotkey) => {
            if (!hotkey || typeof hotkey !== 'string') return false;
            if (hotkey.includes('++')) return false; // Double ++ is invalid
            if (!hotkey.includes('+')) return false; // Must have modifier
            const parts = hotkey.split('+');
            if (parts.some(part => !part.trim())) return false; // No empty parts
            return true;
        };
        
        if (!validateHotkey(config.hotkey)) {
            console.error('Invalid carousel hotkey format:', config.hotkey);
            console.error('Resetting to default: CommandOrControl+Alt+Space');
            config.hotkey = 'CommandOrControl+Alt+Space';
            saveConfig();
        }
        
        if (!validateHotkey(config.settingsHotkey)) {
            console.error('Invalid settings hotkey format:', config.settingsHotkey);
            console.error('Resetting to default: Shift+Alt+Space');
            config.settingsHotkey = 'Shift+Alt+Space';
            saveConfig();
        }
        
        // Carousel hotkey
        const carouselSuccess = globalShortcut.register(config.hotkey, () => {
            if (carouselWin.isVisible()) {
                carouselWin.hide();
            } else {
                const { x, y } = screen.getCursorScreenPoint();
                const halfSize = config.ringSize / 2;
                carouselWin.setPosition(x - halfSize, y - halfSize);
                carouselWin.show();
            }
        });
        
        // Settings hotkey
        const settingsSuccess = globalShortcut.register(config.settingsHotkey, () => {
            createSettingsWindow();
        });
        
        if (!carouselSuccess) {
            console.error('Failed to register carousel hotkey:', config.hotkey);
        }
        if (!settingsSuccess) {
            console.error('Failed to register settings hotkey:', config.settingsHotkey);
        }
        
        return carouselSuccess && settingsSuccess;
    } catch (error) {
        console.error('Hotkey registration error:', error);
        return false;
    }
}

// IPC Handlers
ipcMain.on('execute-action', (event, action) => {
    if (!action) {
        console.error('No action provided');
        carouselWin.hide();
        return;
    }
    
    let success = false;
    
    switch (action.type) {
        case 'keyboard':
            success = executeKeyboard(action.keys);
            break;
        case 'exec':
            success = executeExec(action.command, action.args);
            break;
        default:
            console.warn('Unknown action type:', action.type);
    }
    
    carouselWin.hide();
});

ipcMain.on('open-settings', () => {
    createSettingsWindow();
});

ipcMain.handle('get-config', () => {
    return config;
});

ipcMain.handle('save-config', async (event, newConfig) => {
    config = { ...config, ...newConfig };
    const saved = saveConfig();
    
    if (saved) {
        // Update carousel window
        if (carouselWin && !carouselWin.isDestroyed()) {
            carouselWin.webContents.send('config-update', config);
            
            // Calculate dynamic size based on action count
            const totalActions = config.actions.filter(a => a.enabled).length;
            const baseSize = 280;
            const sizePerAction = 25;
            const dynamicSize = Math.max(baseSize, baseSize + (totalActions - 6) * sizePerAction);
            
            carouselWin.setSize(dynamicSize, dynamicSize);
        }
        
        // Update settings window
        if (settingsWin && !settingsWin.isDestroyed()) {
            settingsWin.webContents.send('config-update', config);
        }
        
        // Re-register hotkeys
        registerHotkeys();
        return config;
    }
    
    throw new Error('Failed to save configuration');
});

ipcMain.handle('add-action', async (event, action) => {
    // Ensure action has enabled property
    action.enabled = action.enabled !== false;
    
    config.actions.push(action);
    const saved = saveConfig();
    
    if (!saved) {
        throw new Error('Failed to save action');
    }
    
    // Always broadcast config update
    if (carouselWin && !carouselWin.isDestroyed()) {
        carouselWin.webContents.send('config-update', config);
        console.log('Sent config update to carousel after adding action');
    }
    
    return config;
});

ipcMain.handle('update-action', async (event, index, updatedAction) => {
    if (index < 0 || index >= config.actions.length) {
        throw new Error('Invalid action index');
    }
    
    config.actions[index] = { ...config.actions[index], ...updatedAction };
    const saved = saveConfig();
    
    if (saved && carouselWin && !carouselWin.isDestroyed()) {
        carouselWin.webContents.send('config-update', config);
    }
    
    if (!saved) {
        throw new Error('Failed to update action');
    }
    
    return config;
});

ipcMain.handle('delete-action', async (event, index) => {
    if (index < 0 || index >= config.actions.length) {
        throw new Error('Invalid action index');
    }
    
    config.actions.splice(index, 1);
    const saved = saveConfig();
    
    if (saved && carouselWin && !carouselWin.isDestroyed()) {
        carouselWin.webContents.send('config-update', config);
    }
    
    if (!saved) {
        throw new Error('Failed to delete action');
    }
    
    return config;
});

ipcMain.handle('test-action', async (event, index) => {
    const action = config.actions[index];
    
    if (!action) {
        throw new Error('Action not found');
    }
    
    let success = false;
    
    switch (action.type) {
        case 'keyboard':
            success = executeKeyboard(action.keys);
            break;
        case 'exec':
            success = executeExec(action.command, action.args);
            break;
    }
    
    if (!success) {
        throw new Error('Failed to execute action');
    }
    
    return { success: true };
});

// App lifecycle
app.whenReady().then(() => {
    config = loadConfig();
    createCarouselWindow();
    registerHotkeys();
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createCarouselWindow();
    }
});
