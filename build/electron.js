const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

// Désactiver les avertissements de sécurité
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // En production, on charge directement le fichier HTML construit
  const startUrl = `file://${path.join(__dirname, '../build/index.html')}`;
  console.log('Loading URL:', startUrl);
  mainWindow.loadURL(startUrl);

  // Ouvrir les DevTools en mode dev
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

// Handlers pour les sélecteurs de fichiers/dossiers
app.whenReady().then(() => {
  ipcMain.handle('select-files', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] });
    return result.filePaths;
  });
  ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    return result.filePaths[0];
  });
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
}); 