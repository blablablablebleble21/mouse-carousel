const { app, BrowserWindow, screen, globalShortcut, ipcMain } = require('electron');
const { exec } = require('child_process');

let win;

function createWindow() {
    win = new BrowserWindow({
        width: 400,
        height: 400,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        show: false,
        focusable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile('index.html');
    win.setMenuBarVisibility(false);
}

/**
 * Define actions for screenshot.
 */
function screenshot() {
    win.hide();
    exec('explorer ms-screenclip:');
}

/**
 * Define actions for Spotify.
 */
function spotify() {
    win.hide();
    exec('start spotify:');
}

/**
 * Define actions for paste.
 */
function paste() {
    win.hide();
    exec('powershell -command "$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys(\'^v\')"');
}

/**
 * Define actions for copy.
 */
function copy() {   
        win.hide();
        exec('powershell -command "$wshell = New-Object -ComObject wscript.shell; $wshell.SendKeys(\'^c\')"');
}

/**
 * Define actions for settings.
 */
function settings() {
    win.hide();
    exec('start ms-settings:');
}

app.whenReady().then(() => {
    createWindow();

    // Trigger for ghost button (Mapped to ctrl + ; in G HUB). Chnge the mapping here if needed.
    globalShortcut.register('CommandOrControl+;', () => {
        if (win.isVisible()) {
            win.hide();
        } else {
            const { x, y } = screen.getCursorScreenPoint();
            win.setPosition(x - 200, y - 200);
            win.show();
        }
    });
});

// Listen for clicks from the carousel and execute corresponding actions.
ipcMain.on('execute-action', (event, action) => {
    //DEBUG console.log("Executing:", action);
    if (action === 'screenshot') {
        screenshot();
    }
    else if (action === 'spotify') {
        spotify();
    }
    else if (action === 'paste') {
        paste();
    }
    else if (action === 'copy') {
        copy();
    }
    else if (action === 'gear') {
    settings();
    }
    win.hide(); // Hide after selection
});


app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});