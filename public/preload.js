// Configuration sécurisée pour l'objet global
const safeGlobal = {
  // Propriétés nécessaires pour face-api.js
  fetch: window.fetch.bind(window),
  requestAnimationFrame: window.requestAnimationFrame.bind(window),
  cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
  ImageData: window.ImageData,
  HTMLImageElement: window.HTMLImageElement,
  HTMLCanvasElement: window.HTMLCanvasElement,
  HTMLVideoElement: window.HTMLVideoElement,
  Image: window.Image,
  createImageBitmap: window.createImageBitmap?.bind(window),
  // Polyfills pour tfjs
  TextDecoder: window.TextDecoder,
  TextEncoder: window.TextEncoder
};

// Assigner l'objet global de manière sécurisée
window.global = safeGlobal;

const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');

// Fonction utilitaire pour wrapper les appels IPC avec gestion d'erreur
const wrapIpcCall = async (channel, ...args) => {
  try {
    const result = await ipcRenderer.invoke(channel, ...args);
    return { success: true, data: result };
  } catch (error) {
    console.error(`Erreur lors de l'appel IPC ${channel}:`, error);
    return { success: false, error: error.message };
  }
};

// Polyfill sécurisé pour l'objet global
if (window) {
  window.global = window;
  window.process = {
    ...process,
    // Ajouter des propriétés process nécessaires
    browser: true,
    versions: process.versions
  };
}

// Configuration de l'API exposée au processus de rendu
contextBridge.exposeInMainWorld('electronAPI', {
  // Sélection de fichiers
  selectFiles: async () => {
    try {
      return await ipcRenderer.invoke('select-files');
    } catch (error) {
      console.error('Erreur lors de la sélection des fichiers:', error);
      throw error;
    }
  },

  // Sélection de dossier
  selectFolder: async () => {
    try {
      return await ipcRenderer.invoke('select-folder');
    } catch (error) {
      console.error('Erreur lors de la sélection du dossier:', error);
      throw error;
    }
  },

  // Lecture des fichiers d'un dossier
  getFilesFromFolder: async (folderPath) => {
    try {
      return await ipcRenderer.invoke('get-files-from-folder', folderPath);
    } catch (error) {
      console.error('Erreur lors de la lecture du dossier:', error);
      throw error;
    }
  },

  // Vérification de l'état de l'application
  checkAppStatus: async () => {
    try {
      const status = {
        isElectron: true,
        nodeVersion: process.versions.node,
        chromeVersion: process.versions.chrome,
        electronVersion: process.versions.electron,
        platform: process.platform,
        arch: process.arch
      };
      return { success: true, data: status };
    } catch (error) {
      console.error('Erreur lors de la vérification du statut:', error);
      return { success: false, error: error.message };
    }
  }
}); 