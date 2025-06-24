const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createTestWindow() {
  console.log('Création de la fenêtre de test...');
  
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    },
    show: false
  });

  // Page de test simple
  const testHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Test Borne</title>
      <style>
        body {
          background: #1a1a1a;
          color: white;
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
        }
        .test-content {
          text-align: center;
          padding: 20px;
        }
        .logo {
          font-size: 3rem;
          color: #007AFF;
          margin-bottom: 20px;
        }
        .status {
          color: #34C759;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="test-content">
        <div class="logo">Borne</div>
        <h2>Test de l'Application</h2>
        <p>Si vous voyez cette page, Electron fonctionne correctement.</p>
        <div class="status">✅ Application prête</div>
      </div>
    </body>
    </html>
  `;

  mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(testHTML));

  mainWindow.once('ready-to-show', () => {
    console.log('Fenêtre de test prête');
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  console.log('Application Electron prête');
  createTestWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createTestWindow();
  }
}); 