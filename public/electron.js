const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const isDev = require('electron-is-dev');

// Configuration de la sécurité
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
app.commandLine.appendSwitch('enable-features', 'SharedArrayBuffer');
app.commandLine.appendSwitch('disable-features', 'CrossOriginOpenerPolicy');

// État global de l'application
let mainWindow = null;
let isAppQuitting = false;

// Configuration de la fenêtre principale
const windowConfig = {
  width: 1200,
  height: 800,
  minWidth: 800,
  minHeight: 600,
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: true,
    webSecurity: true,
    preload: path.join(__dirname, 'preload.js'),
    additionalArguments: ['--enable-features=SharedArrayBuffer']
  },
  show: false, // Ne pas montrer la fenêtre jusqu'à ce qu'elle soit prête
  backgroundColor: '#1a1a1a'
};

// Création de la fenêtre principale
function createWindow() {
  if (mainWindow) return;

  mainWindow = new BrowserWindow(windowConfig);

  // Chargement de l'application
  const startURL = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startURL);

  // Gestion des erreurs de chargement
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Erreur de chargement:', errorCode, errorDescription);
    
    // Tentative de rechargement après un délai
    setTimeout(() => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        console.log('Tentative de rechargement...');
        mainWindow.loadURL(startURL);
      }
    }, 1000);
  });

  // Afficher la fenêtre quand elle est prête
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Gestion de la fermeture
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Configuration des gestionnaires IPC
function setupIpcHandlers() {
  // Sélection de fichiers
  ipcMain.handle('select-files', async () => {
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'multiSelections'],
        filters: [
          { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif'] }
        ]
      });
      return result.filePaths;
    } catch (error) {
      console.error('Erreur lors de la sélection des fichiers:', error);
      throw error;
    }
  });

  // Sélection de dossier
  ipcMain.handle('select-folder', async () => {
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
      });
      return result.filePaths[0];
    } catch (error) {
      console.error('Erreur lors de la sélection du dossier:', error);
      throw error;
    }
  });

  // Lecture des fichiers d'un dossier
  ipcMain.handle('get-files-from-folder', async (event, folderPath) => {
    try {
      const files = await fs.readdir(folderPath);
      const validFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
      });

      const fullPaths = await Promise.all(
        validFiles.map(async (file) => {
          const fullPath = path.join(folderPath, file);
          try {
            await fs.access(fullPath, fs.constants.R_OK);
            return fullPath;
          } catch {
            console.warn(`Fichier inaccessible: ${fullPath}`);
            return null;
          }
        })
      );

      return fullPaths.filter(Boolean);
    } catch (error) {
      console.error('Erreur lors de la lecture du dossier:', error);
      throw error;
    }
  });
}

// Initialisation de l'application
app.whenReady().then(() => {
  createWindow();
  setupIpcHandlers();

  // Gestion du comportement sur macOS
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Gestion de la fermeture de l'application
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    isAppQuitting = true;
    app.quit();
  }
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('Erreur non gérée:', error);
  
  // Afficher une boîte de dialogue d'erreur si la fenêtre principale existe
  if (mainWindow && !mainWindow.isDestroyed()) {
    dialog.showErrorBox(
      'Erreur inattendue',
      `Une erreur inattendue s'est produite:\n${error.message}\n\nL'application va redémarrer.`
    );
  }
  
  // Redémarrer l'application
  if (!isAppQuitting) {
    app.relaunch();
    app.exit(0);
  }
}); 