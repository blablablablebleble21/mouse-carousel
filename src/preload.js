const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    executeAction: (action) => ipcRenderer.send('execute-action', action),
    openSettings: () => ipcRenderer.send('open-settings'),
    getConfig: () => ipcRenderer.invoke('get-config'),
    saveConfig: (config) => ipcRenderer.invoke('save-config', config),
    addAction: (action) => ipcRenderer.invoke('add-action', action),
    updateAction: (index, action) => ipcRenderer.invoke('update-action', index, action),
    deleteAction: (index) => ipcRenderer.invoke('delete-action', index),
    testAction: (index) => ipcRenderer.invoke('test-action', index),
    onConfigUpdate: (callback) => {
        ipcRenderer.on('config-update', (event, config) => callback(config));
    },
    removeConfigUpdateListener: () => {
        ipcRenderer.removeAllListeners('config-update');
    }
});
