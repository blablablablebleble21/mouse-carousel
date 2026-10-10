const { contextBridge, ipcRenderer } = require('electron');

const actions = new Set(['screenshot', 'spotify', 'paste', 'copy', 'gear', 'last-window']);

contextBridge.exposeInMainWorld('carousel', {
    executeAction(action) {
        if (actions.has(action)) ipcRenderer.send('execute-action', action);
    },
    hide() {
        ipcRenderer.send('hide-ring');
    },
    onRingShown(callback) {
        ipcRenderer.on('ring-shown', () => callback());
    },
    onRingHidden(callback) {
        ipcRenderer.on('ring-hidden', () => callback());
    }
});
