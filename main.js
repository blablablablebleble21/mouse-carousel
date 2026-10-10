const { app, BrowserWindow, globalShortcut, ipcMain, Menu, nativeImage, screen, shell, Tray } = require('electron');
const { execFile } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const HOTKEY = 'Control+Alt+J';
const RING_SIZE = 250;
const RING_RADIUS = RING_SIZE / 2;
const ACTIONS = new Set(['screenshot', 'spotify', 'paste', 'copy', 'gear', 'last-window']);

let ringWindow;
let tray;
let isQuitting = false;

// Electron normally exits when its windows are closed. This app deliberately
// owns a hidden window and a tray icon so the global hotkey remains available.
if (!app.requestSingleInstanceLock()) {
    app.quit();
} else {
    app.on('second-instance', () => {
        showRing();
    });

    app.whenReady().then(() => {
        app.setAppUserModelId('com.user.mousecarousel');
        configureLoginLaunch();
        createRingWindow();
        createTray();
        registerHotkey();
    });
}

function createRingWindow() {
    ringWindow = new BrowserWindow({
        width: RING_SIZE,
        height: RING_SIZE,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        show: false,
        focusable: false,
        hasShadow: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true
        }
    });

    ringWindow.loadFile('index.html');
    ringWindow.setMenuBarVisibility(false);

    // A close request should never take down the background hotkey service.
    ringWindow.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault();
            ringWindow.hide();
        }
    });
}

function showRing() {
    if (!ringWindow || ringWindow.isDestroyed()) return;

    if (ringWindow.isVisible()) {
        hideRing();
        return;
    }

    const cursor = screen.getCursorScreenPoint();
    const workArea = screen.getDisplayNearestPoint(cursor).workArea;
    const x = clamp(cursor.x - RING_RADIUS, workArea.x, workArea.x + workArea.width - RING_SIZE);
    const y = clamp(cursor.y - RING_RADIUS, workArea.y, workArea.y + workArea.height - RING_SIZE);

    ringWindow.setPosition(x, y, false);
    // Do not steal focus: copy/paste actions must target the app that was
    // active before the ring was opened.
    ringWindow.showInactive();
    ringWindow.webContents.send('ring-shown');
    registerEscapeShortcut();
}

function hideRing() {
    unregisterEscapeShortcut();
    if (ringWindow && !ringWindow.isDestroyed()) {
        ringWindow.webContents.send('ring-hidden');
        ringWindow.hide();
    }
}

function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(value, maximum));
}

function registerHotkey() {
    const registered = globalShortcut.register(HOTKEY, showRing);
    if (!registered) {
        console.error(`Could not register ${HOTKEY}; another application is using it.`);
        tray?.displayBalloon({
            iconType: 'warning',
            title: 'Mouse Carousel',
            content: `${HOTKEY} is already being used by another application.`
        });
    }
}

function registerEscapeShortcut() {
    const registered = globalShortcut.register('Escape', hideRing);
    if (!registered) {
        console.error('Could not register Escape while the actions ring is open.');
    }
}

function unregisterEscapeShortcut() {
    globalShortcut.unregister('Escape');
}

function createTray() {
    tray = new Tray(createTrayIcon());
    tray.setToolTip(`Mouse Carousel (${HOTKEY})`);
    tray.setContextMenu(buildTrayMenu());
    tray.on('click', showRing);
}

function buildTrayMenu() {
    const launchAtLogin = readPreferences().launchAtLogin;

    return Menu.buildFromTemplate([
        { label: 'Show actions ring', click: showRing },
        { type: 'separator' },
        {
            label: 'Start with Windows',
            type: 'checkbox',
            checked: launchAtLogin,
            click: (item) => {
                savePreferences({ launchAtLogin: item.checked });
                applyLoginLaunch(item.checked);
                tray.setContextMenu(buildTrayMenu());
            }
        },
        { label: 'Quit Mouse Carousel', click: () => app.quit() }
    ]);
}

function createTrayIcon() {
    // An embedded PNG keeps the tray usable in both development and the
    // portable build without depending on an external icon file.
    return nativeImage.createFromDataURL(
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAACTSURBVHgBpZKBCYAgEEV/TeAIjuIIbdQIuUGt0CS1gW1iZ2jIVaTnhw+Cvs8/OYDJA4Y8kR3ZR2/kmazxJbpUEfQ/Dm/UG7wVwHkjlQdMFfDdJMFaACebnjJGyDWgcnZu1/lrCrl6NCoEHJBrDwEr5NrT6ko/UV8xdLAC2N49mlc5CylpYh8wCwqrvbBGLoKGvz8Bfq0QPWEUo/EAAAAASUVORK5CYII='
    );
}

function preferencesPath() {
    return path.join(app.getPath('userData'), 'settings.json');
}

function readPreferences() {
    try {
        return { launchAtLogin: true, ...JSON.parse(fs.readFileSync(preferencesPath(), 'utf8')) };
    } catch {
        return { launchAtLogin: true };
    }
}

function savePreferences(preferences) {
    fs.mkdirSync(path.dirname(preferencesPath()), { recursive: true });
    fs.writeFileSync(preferencesPath(), JSON.stringify(preferences, null, 2));
}

function configureLoginLaunch() {
    const preferences = readPreferences();
    // Persist the default the first time so unchecking the tray option remains
    // respected on later launches.
    if (!fs.existsSync(preferencesPath())) savePreferences(preferences);
    applyLoginLaunch(preferences.launchAtLogin);
}

function applyLoginLaunch(enabled) {
    if (process.platform !== 'win32') return;

    app.setLoginItemSettings({
        openAtLogin: enabled,
        path: process.execPath,
        args: app.isPackaged ? [] : [path.join(__dirname, 'main.js')],
        enabled,
        name: 'MouseCarousel'
    });
}

ipcMain.on('execute-action', (event, action) => {
    if (event.sender !== ringWindow?.webContents || !ACTIONS.has(action)) return;
    executeAction(action);
});

ipcMain.on('hide-ring', (event) => {
    if (event.sender === ringWindow?.webContents) hideRing();
});

function executeAction(action) {
    hideRing();

    // Let the transparent window disappear before sending keys to the app that
    // remains focused beneath it.
    setTimeout(() => {
        try {
            switch (action) {
                case 'screenshot':
                    openExternal('ms-screenclip:');
                    break;
                case 'spotify':
                    openExternal('spotify:');
                    break;
                case 'paste':
                    sendKeys('^v');
                    break;
                case 'copy':
                    sendKeys('^c');
                    break;
                case 'gear':
                    openExternal('ms-settings:');
                    break;
                case 'last-window':
                    sendKeys('%{TAB}');
                    break;
            }
        } catch (error) {
            console.error(`Could not run ${action}:`, error);
        }
    }, 75);
}

function sendKeys(keys) {
    // WScript.Shell is available on supported Windows versions and does not
    // require a native Node module or a locally installed C++ toolchain.
    const script = `$shell = New-Object -ComObject WScript.Shell; $shell.SendKeys('${keys}')`;
    execFile(
        'powershell.exe',
        ['-NoProfile', '-NonInteractive', '-WindowStyle', 'Hidden', '-Command', script],
        { windowsHide: true },
        (error) => {
            if (error) console.error(`Could not send keys ${keys}:`, error);
        }
    );
}

function openExternal(url) {
    shell.openExternal(url).catch((error) => {
        console.error(`Could not open ${url}:`, error);
    });
}

app.on('window-all-closed', () => {
    // This handler suppresses Electron's default Windows quit behavior. If a
    // renderer ever closes unexpectedly, rebuild the hidden service window.
    if (!isQuitting) createRingWindow();
});

app.on('before-quit', () => {
    isQuitting = true;
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});
