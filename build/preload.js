const { contextBridge, ipcRenderer } = require('electron');
const util = require('util');

// Polyfills
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = util.TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = util.TextDecoder;
}

// Expose any needed APIs to the renderer process
contextBridge.exposeInMainWorld('electron', {
  isElectron: true,
  selectFiles: async () => ipcRenderer.invoke('select-files'),
  selectFolder: async () => ipcRenderer.invoke('select-folder')
}); 