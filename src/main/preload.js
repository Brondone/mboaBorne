const { contextBridge, ipcRenderer } = require('electron');

// Exposer les API sécurisées au processus de rendu
contextBridge.exposeInMainWorld('electronAPI', {
  // Sélection de fichiers et dossiers
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  selectFiles: () => ipcRenderer.invoke('select-files'),
  saveFile: (options) => ipcRenderer.invoke('save-file', options),
  
  // Ouverture de liens externes
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  
  // Nouvelle fonction : obtenir la taille d'un fichier
  getFileSize: (filePath) => ipcRenderer.invoke('get-file-size', filePath),
  
  // Nouvelle fonction : scanner un dossier
  scanDirectory: (directoryPath) => ipcRenderer.invoke('scan-directory', directoryPath),
  
  // Nouvelle fonction : obtenir les fichiers d'un dossier
  getFilesFromFolder: (folderPath) => ipcRenderer.invoke('get-files-from-folder', folderPath),
  
  // Ouvrir le dossier contenant une photo
  openPhotoFolder: (filePath) => ipcRenderer.invoke('open-photo-folder', filePath),
  // Copier le chemin d'une photo
  copyPhotoPath: (filePath) => ipcRenderer.invoke('copy-photo-path', filePath),
  // Imprimer une photo
  printPhoto: (filePath) => ipcRenderer.invoke('print-photo', filePath),
  
  // Exporter des photos sélectionnées
  exportPhotos: (filePaths) => ipcRenderer.invoke('export-photos', filePaths),
  
  // Imprimer plusieurs photos
  printMultiplePhotos: (filePaths) => ipcRenderer.invoke('print-multiple-photos', filePaths),
  
  // Impression native Windows
  printNativeWindows: (filePaths) => ipcRenderer.invoke('print-native-windows', filePaths),
  
  // Envoyer les photos par email
  sendEmailWithPhotos: (filePaths) => ipcRenderer.invoke('send-email-with-photos', filePaths),
  
  // Envoi d'email SMTP avec pièces jointes
  sendEmailSMTP: (params) => ipcRenderer.invoke('send-email-smtp', params),
  
  // Demander l'email et envoyer via SMTP
  askEmailAndSend: (params) => ipcRenderer.invoke('ask-email-and-send', params),
  
  // Gestion des événements
  on: (channel, callback) => {
    // Whitelist des canaux autorisés
    const validChannels = ['file-added', 'file-removed', 'processing-complete'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, callback);
    }
  },
  
  // Suppression des listeners
  removeAllListeners: (channel) => {
    const validChannels = ['file-added', 'file-removed', 'processing-complete'];
    if (validChannels.includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
    }
  },
  
  // Nouvelle fonction : ouvrir un dossier
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  
  // Nouvelle fonction : copier des fichiers
  copyFiles: (filePaths, destinationDir) => ipcRenderer.invoke('copy-files', filePaths, destinationDir),
  
  // Nouvelle fonction : obtenir le chemin des modèles face-api.js
  getModelsPath: () => ipcRenderer.invoke('get-models-path'),
  
  // --- Fonctions d'index facial ---
  addFaceDescriptor: (descriptor, file, meta) => ipcRenderer.invoke('face-index:add', descriptor, file, meta),
  searchFaceIndex: (descriptor, topN = 5) => ipcRenderer.invoke('face-index:search', descriptor, topN)
});

// Empêcher l'accès direct aux modules Node.js
window.require = undefined;
window.module = undefined;
window.process = undefined; 