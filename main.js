const { app, BrowserWindow, screen, globalShortcut, ipcMain } = require('electron');

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
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile('index.html');
    win.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
    createWindow();

    // Trigger for G502 X Button (Mapped to Shift+F12+H in G HUB)
    globalShortcut.register('Shift+F12+H', () => {
        if (win.isVisible()) {
            win.hide();
        } else {
            const { x, y } = screen.getCursorScreenPoint();
            win.setPosition(x - 200, y - 200);
            win.show();
        }
    });
});

// Listen for clicks from the carousel
ipcMain.on('execute-action', (event, action) => {
    console.log("Executing:", action);
    // Add logic here to control Windows
    win.hide(); // Hide after selection
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});