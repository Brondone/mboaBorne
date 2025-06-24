const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const isWin = process.platform === 'win32';
const os = require('os');
const nodemailer = require('nodemailer');
const faceVectorIndex = require('./FaceVectorIndex');

// Garder une référence globale de l'objet window
// Si vous ne le faites pas, la fenêtre sera fermée automatiquement
// quand l'objet JavaScript sera collecté par le garbage collector
let mainWindow;

// Configuration de l'application
const isDev = false; // Forcer le mode production pour tester
const isMac = process.platform === 'darwin';

// Désactiver les avertissements de sécurité uniquement en mode développement
if (isDev) {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
}

console.log('---');
console.log('--- LE BACKEND ELECTRON (main.js) EST EN COURS DE LECTURE ---');
console.log('--- Si tu vois ce message, tu regardes le bon terminal. ---');
console.log('---');

function createWindow() {
  console.log('Création de la fenêtre Electron...');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('isPackaged:', app.isPackaged);
  console.log('Mode développement:', isDev);
  
  // Créer la fenêtre du navigateur avec sécurité activée
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true, // Activer la sécurité web
      allowRunningInsecureContent: false, // Désactiver le contenu non sécurisé
      // Configuration sécurisée pour l'accès aux fichiers
      additionalArguments: [
        '--disable-features=VizDisplayCompositor'
      ]
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    show: false,
    backgroundColor: '#1a1a1a'
  });

  // Charger l'application React
  if (isDev) {
    console.log('Chargement depuis http://localhost:3000...');
    // En mode développement, charger depuis le serveur de développement React
    mainWindow.loadURL('http://localhost:3000');
    // Ouvrir les outils de développement
    mainWindow.webContents.openDevTools();
  } else {
    console.log('Chargement depuis le fichier build...');
    // En production, charger le fichier HTML construit
    const htmlPath = path.join(__dirname, '../../build/index.html');
    console.log('Chemin HTML:', htmlPath);
    
    // Vérifier que le fichier existe
    if (fs.existsSync(htmlPath)) {
      console.log('Fichier HTML trouvé, chargement...');
    mainWindow.loadFile(htmlPath);
    } else {
      console.error('Fichier HTML non trouvé:', htmlPath);
      // Essayer un chemin alternatif
      const altPath = path.join(process.cwd(), 'build/index.html');
      console.log('Essai avec le chemin alternatif:', altPath);
      if (fs.existsSync(altPath)) {
        mainWindow.loadFile(altPath);
      } else {
        console.error('Aucun fichier HTML trouvé. Vérifiez que le build a été effectué.');
        mainWindow.loadURL('data:text/html,<h1>Erreur: Fichier HTML non trouvé</h1><p>Veuillez exécuter "npm run build" avant de lancer l\'application.</p>');
      }
    }
  }

  // Afficher la fenêtre quand elle est prête
  mainWindow.once('ready-to-show', () => {
    console.log('Fenêtre prête, affichage...');
    mainWindow.show();
  });

  // Gérer la fermeture de la fenêtre
  mainWindow.on('closed', () => {
    console.log('Fenêtre fermée');
    mainWindow = null;
  });

  // Gérer les erreurs de chargement
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Erreur de chargement:', errorCode, errorDescription, validatedURL);
  });

  // Ajouter des logs pour le diagnostic
  mainWindow.webContents.on('did-start-loading', () => {
    console.log('Début du chargement de la page...');
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Chargement de la page terminé');
  });

  mainWindow.webContents.on('dom-ready', () => {
    console.log('DOM prêt');
  });

  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`Console [${level}]: ${message} (${sourceId}:${line})`);
  });

  // Empêcher la navigation vers des URLs externes
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.origin !== 'http://localhost:3000' && !isDev) {
      event.preventDefault();
    }
  });

  // Configurer les en-têtes de sécurité avec une CSP sécurisée
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    console.log('Configuration CSP pour:', details.url);
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
          "style-src 'self' 'unsafe-inline'; " +
          "font-src 'self' data:; " +
          "img-src 'self' data: blob: file:; " +
          "connect-src 'self' http://localhost:* http://127.0.0.1:* file: https://justadudewhohacks.github.io file://* models:; " +
          "media-src 'self' data: blob: file:; " +
          "object-src 'none'; " +
          "base-uri 'self'; " +
          "form-action 'self';"
        ]
      }
    });
  });

  // Configurer les permissions pour l'accès aux fichiers locaux
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowedPermissions = ['media', 'display-capture'];
    if (allowedPermissions.includes(permission)) {
      callback(true);
    } else {
      callback(false);
    }
  });

  // Protocole personnalisé pour les fichiers locaux
  mainWindow.webContents.session.protocol.registerFileProtocol('local-file', (request, callback) => {
    const filePath = request.url.replace('local-file://', '');
    callback({ path: filePath });
  });

  // Créer un serveur local temporaire pour servir les modèles face-api.js
  const http = require('http');
  const url = require('url');
  
  const modelsServer = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    // Construire le chemin vers les modèles
    let modelsPath;
    if (isDev) {
      modelsPath = path.join(__dirname, '../../public/models', pathname);
    } else {
      // Chemin absolu vers build/models (corrigé)
      const appPath = path.dirname(path.dirname(__dirname));
      modelsPath = path.join(appPath, 'build/models', pathname);
    }
    
    console.log(`📁 Demande modèle: ${pathname}`);
    console.log(`📁 Chemin complet: ${modelsPath}`);
    console.log(`📁 __dirname: ${__dirname}`);
    console.log(`📁 isDev: ${isDev}`);
    console.log(`📁 App path: ${path.dirname(path.dirname(__dirname))}`);
    
    // Vérifier que le fichier existe
    if (fs.existsSync(modelsPath)) {
      const stat = fs.statSync(modelsPath);
      const ext = path.extname(modelsPath).toLowerCase();
      
      // Définir le type MIME approprié
      let contentType = 'application/octet-stream';
      if (ext === '.json') contentType = 'application/json';
      else if (ext === '.txt') contentType = 'text/plain';
      else if (ext === '.pbtxt') contentType = 'text/plain';
      
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': stat.size,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      
      const stream = fs.createReadStream(modelsPath);
      stream.pipe(res);
      
      console.log(`✅ Modèle servi: ${pathname} (${stat.size} bytes)`);
    } else {
      console.error(`❌ Modèle non trouvé: ${modelsPath}`);
      console.error(`❌ Vérification du dossier parent: ${path.dirname(modelsPath)}`);
      try {
        const parentDir = path.dirname(modelsPath);
        if (fs.existsSync(parentDir)) {
          console.error(`❌ Dossier parent existe, contenu:`, fs.readdirSync(parentDir));
        } else {
          console.error(`❌ Dossier parent n'existe pas`);
        }
      } catch (err) {
        console.error(`❌ Erreur lors de la vérification:`, err.message);
      }
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Model not found');
    }
  });
  
  // Fonction pour démarrer le serveur sur un port disponible
  function startModelsServer(port) {
    modelsServer.listen(port, '127.0.0.1', () => {
      console.log(`🚀 Serveur de modèles démarré sur http://127.0.0.1:${port}`);
      console.log(`📁 Modèles disponibles dans: ${isDev ? path.join(__dirname, '../../public/models') : path.join(__dirname, '../../build/models')}`);
      
      // Exposer le port du serveur de modèles au renderer
      mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.executeJavaScript(`
          window.MODELS_SERVER_URL = 'http://127.0.0.1:${port}';
        `);
      });
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`⚠️ Port ${port} occupé, tentative sur le port ${port + 1}...`);
        startModelsServer(port + 1);
      } else {
        console.error('❌ Erreur lors du démarrage du serveur de modèles:', err);
      }
    });
  }
  
  // Démarrer le serveur sur un port disponible
  startModelsServer(3001);
}

// Créer la fenêtre quand l'app est prête
app.whenReady().then(createWindow);

// Quitter quand toutes les fenêtres sont fermées
app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Gestion des événements IPC pour la communication avec le renderer
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Sélectionner un dossier de photos'
  });
  
  if (!result.canceled) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('select-files', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff'] }
    ],
    title: 'Sélectionner des photos'
  });
  
  if (!result.canceled) {
    return result.filePaths;
  }
  return [];
});

ipcMain.handle('save-file', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: options.title || 'Sauvegarder',
    defaultPath: options.defaultPath,
    filters: options.filters || [
      { name: 'Images', extensions: ['jpg', 'png', 'webp'] }
    ]
  });
  
  if (!result.canceled) {
    return result.filePath;
  }
  return null;
});

ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url);
});

// Handler pour obtenir la taille d'un fichier
ipcMain.handle('get-file-size', async (event, filePath) => {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    console.error('Erreur lors de l\'obtention de la taille du fichier:', error);
    return 0;
  }
});

// Handler pour scanner un dossier et retourner tous les fichiers images
ipcMain.handle('scan-directory', async (event, directoryPath) => {
  try {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff'];
    const files = [];
    function scanRecursive(dir) {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          scanRecursive(fullPath);
        } else if (stat.isFile() && imageExtensions.includes(path.extname(fullPath).toLowerCase())) {
          files.push(fullPath);
        }
      }
    }
    scanRecursive(directoryPath);
    return files;
  } catch (error) {
    console.error('Erreur lors du scan du dossier:', error);
    return [];
  }
});

// Handler pour ouvrir le dossier contenant une photo
ipcMain.handle('open-photo-folder', async (event, filePath) => {
  try {
    const folder = path.dirname(filePath);
    await shell.openPath(folder);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'ouverture du dossier:', error);
    return false;
  }
});

// Handler pour copier le chemin d'une photo dans le presse-papiers
ipcMain.handle('copy-photo-path', async (event, filePath) => {
  try {
    require('electron').clipboard.writeText(filePath);
    return true;
  } catch (error) {
    console.error('Erreur lors de la copie du chemin:', error);
    return false;
  }
});

// Handler pour imprimer une photo
ipcMain.handle('print-photo', async (event, filePath) => {
  try {
    // Ouvre la photo dans une nouvelle fenêtre cachée et lance l'impression
    let printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });
    await printWindow.loadURL('file://' + filePath);
    printWindow.webContents.on('did-finish-load', () => {
      printWindow.webContents.print({}, (success, errorType) => {
        if (!success) console.error('Erreur impression:', errorType);
        printWindow.close();
      });
    });
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'impression:', error);
    return false;
  }
});

// Handler pour exporter des photos sélectionnées
ipcMain.handle('export-photos', async (event, filePaths) => {
  // Ouvre une fenêtre pour choisir le dossier de destination
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Choisir le dossier de destination pour l\'exportation'
  });

  if (result.canceled || !result.filePaths[0]) {
    return { success: false, message: 'Export annulé par l\'utilisateur.' };
  }

  const destDir = result.filePaths[0];
  let successCount = 0;
  let errorCount = 0;
  let errors = [];

  for (const filePath of filePaths) {
    try {
      const fileName = path.basename(filePath);
      const destPath = path.join(destDir, fileName);
      fs.copyFileSync(filePath, destPath);
      successCount++;
    } catch (err) {
      errorCount++;
      errors.push({ file: filePath, error: err.message });
    }
  }

  if (errorCount === 0) {
    return { success: true, message: `${successCount} photo(s) exportée(s) avec succès.` };
  } else {
    return { success: false, message: `${successCount} export(s) réussi(s), ${errorCount} échec(s).`, errors };
  }
});

ipcMain.handle('copy-files', async (event, filePaths, destinationDir) => {
  const path = require('path');
  const fs = require('fs');
  let errors = [];
  for (const file of filePaths) {
    try {
      const fileName = path.basename(file);
      const destPath = path.join(destinationDir, fileName);
      fs.copyFileSync(file, destPath);
    } catch (err) {
      errors.push({ file, error: err.message });
    }
  }
  return { success: errors.length === 0, errors };
});

// Handler pour imprimer plusieurs images d'un coup, en utilisant une fenêtre cachée qui affiche toutes les images et lance l'impression
ipcMain.handle('print-multiple-photos', async (event, filePaths) => {
  try {
    // Crée une fenêtre cachée
    let printWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });
    // Génère le HTML avec toutes les images
    const html = `
      <html>
        <head>
          <title>Impression des photos</title>
          <style>
            body { background: #fff; color: #000; margin: 0; padding: 0; font-family: sans-serif; }
            .gallery-print { display: flex; flex-wrap: wrap; gap: 24px; justify-content: center; padding: 32px; }
            .gallery-print img { max-width: 350px; max-height: 500px; border: 2px solid #333; border-radius: 8px; box-shadow: 0 2px 8px #0002; margin-bottom: 16px; }
          </style>
        </head>
        <body>
          <h1 style='text-align:center; margin-bottom: 24px;'>Aperçu avant impression</h1>
          <div class='gallery-print'>
            ${filePaths.map(file => `<img src='file://${file}' alt='photo' />`).join('')}
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;
    // Charge le HTML dans la fenêtre
    await printWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
    // Ferme la fenêtre après impression
    printWindow.webContents.on('did-finish-load', () => {
      printWindow.webContents.print({}, (success, errorType) => {
        if (!success) console.error('Erreur impression multiple:', errorType);
        printWindow.close();
      });
    });
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'impression multiple:', error);
    return false;
  }
});

// Handler pour imprimer chaque image séparément
ipcMain.handle('print-photos-separately', async (event, filePaths) => {
  try {
    for (const filePath of filePaths) {
      let printWindow = new BrowserWindow({
        show: false,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });
      await printWindow.loadURL('file://' + filePath);
      printWindow.webContents.on('did-finish-load', () => {
        printWindow.webContents.print({}, (success, errorType) => {
          if (!success) console.error('Erreur impression:', errorType);
          printWindow.close();
        });
      });
    }
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'impression séparée:', error);
    return false;
  }
});

// Handler pour imprimer native Windows
ipcMain.handle('print-native-windows', async (event, filePaths) => {
  console.log('[PRINT] Handler aperçu avant impression appelé !');
  console.log('[PRINT] Fichiers à imprimer:', filePaths);

  try {
    let printWindow = new BrowserWindow({
      width: 900,
      height: 700,
      show: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: false // Permet l'accès aux fichiers locaux
      }
    });

    const html = `
      <html>
        <head>
          <title>Impression des photos</title>
          <style>
            body { background: #fff; color: #000; margin: 0; padding: 0; font-family: sans-serif; }
            .gallery-print { display: flex; flex-wrap: wrap; gap: 24px; justify-content: center; padding: 32px; }
            .gallery-print img { max-width: 350px; max-height: 500px; border: 2px solid #333; border-radius: 8px; box-shadow: 0 2px 8px #0002; margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <h1 style="text-align:center; margin-bottom: 24px;">Aperçu avant impression</h1>
          <div class="gallery-print">
            ${filePaths.map(photo => {
              const normalized = photo.replace(/\\/g, '/');
              const parts = normalized.split('/');
              const fileName = encodeURIComponent(parts.pop());
              const dir = parts.join('/');
              const src = `file:///${dir}/${fileName}`;
              return `<div style="text-align:center"><img src="${src}" alt="photo" /><div style="font-size:10px;color:#888">${src}</div></div>`;
            }).join('')}
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    await printWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
    return { success: true };
  } catch (error) {
    console.error('[PRINT] Exception:', error);
    return { success: false, message: error.message };
  }
});

// Handler pour envoyer un email avec des photos
ipcMain.handle('send-email-with-photos', async (event, filePaths) => {
  const { shell } = require('electron');
  const destinataire = 'exemple@email.com'; // Mets ici l'adresse souhaitée
  const sujet = encodeURIComponent('Photos à partager');
  const corps = encodeURIComponent(`Bonjour,\n\nVeuillez trouver ci-joint les photos sélectionnées.\n\n(N'oubliez pas de glisser-déposer les fichiers joints dans votre email)`);
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${destinataire}&su=${sujet}&body=${corps}`;
  shell.openExternal(gmailUrl);

  // Ouvre une fenêtre listant les fichiers à joindre
  let infoWindow = new BrowserWindow({
    width: 600,
    height: 400,
    show: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  const html = `
    <html>
      <head>
        <title>Fichiers à joindre</title>
        <style>
          body { font-family: sans-serif; background: #fff; color: #222; margin: 0; padding: 24px; }
          h2 { text-align: center; }
          ul { margin-top: 24px; }
          li { margin-bottom: 10px; font-size: 1.1em; }
          code { background: #eee; padding: 2px 6px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <h2>Fichiers à joindre à votre email</h2>
        <ul>
          ${filePaths.map(photo => `<li><code>${photo}</code></li>`).join('')}
        </ul>
        <p style="margin-top:32px; color:#888; text-align:center;">Ouvrez votre email, puis glissez-déposez ces fichiers dans le message.</p>
      </body>
    </html>
  `;
  await infoWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
  return { success: true };
});

// Handler pour envoyer un email avec pièces jointes via Gmail (SMTP)
ipcMain.handle('send-email-smtp', async (event, { to, subject, body, filePaths }) => {
  try {
    // Configure le transporteur SMTP pour Gmail
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'ton.email@gmail.com', // <-- Mets ici ton adresse Gmail
        pass: 'mot_de_passe_application' // <-- Mets ici ton mot de passe d'application Gmail
      }
    });

    // Prépare les pièces jointes
    const attachments = filePaths.map(file => ({
      filename: require('path').basename(file),
      path: file
    }));

    // Envoie l'email
    let info = await transporter.sendMail({
      from: 'Borne Galerie Photo <ton.email@gmail.com>', // <-- Mets ici ton adresse Gmail
      to,
      subject,
      text: body,
      attachments
    });

    console.log('Email envoyé :', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Erreur envoi email :', error);
    return { success: false, message: error.message };
  }
});

// Handler pour demander l'adresse email du destinataire et envoyer l'email via SMTP
ipcMain.handle('ask-email-and-send', async (event, { subject, body, filePaths }) => {
  return new Promise((resolve) => {
    let inputWindow = new BrowserWindow({
      width: 400,
      height: 220,
      resizable: false,
      modal: true,
      show: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    const html = `
      <html>
        <body style="font-family:sans-serif;padding:24px;">
          <h3>Adresse email du destinataire</h3>
          <input id="email" type="email" style="width:95%;font-size:1.1em;padding:6px;" placeholder="destinataire@email.com" autofocus />
          <button id="send" style="margin-top:18px;font-size:1.1em;padding:6px 18px;">Envoyer</button>
          <script>
            const { ipcRenderer } = require('electron');
            document.getElementById('send').onclick = function() {
              const email = document.getElementById('email').value;
              if(email) {
                ipcRenderer.invoke('send-email-smtp', {
                  to: email,
                  subject: ${JSON.stringify(subject)},
                  body: ${JSON.stringify(body)},
                  filePaths: ${JSON.stringify(filePaths)}
                }).then(() => window.close());
              } else {
                alert('Merci de saisir une adresse email.');
              }
            }
          </script>
        </body>
      </html>
    `;
    inputWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(html));
    inputWindow.on('closed', () => resolve());
  });
});

// Handler pour sélectionner un dossier (pour compatibilité avec select-folder)
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Sélectionner un dossier'
  });
  if (!result.canceled) {
    return result.filePaths[0];
  }
  return null;
});

// Handler pour obtenir les fichiers d'un dossier
ipcMain.handle('get-files-from-folder', async (event, folderPath) => {
  try {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff'];
    const files = [];
    
    function scanRecursive(dir) {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          scanRecursive(fullPath);
        } else if (stat.isFile() && imageExtensions.includes(path.extname(fullPath).toLowerCase())) {
          files.push({
            path: fullPath,
            name: item,
            size: stat.size,
            modified: stat.mtime
          });
        }
      }
    }
    
    scanRecursive(folderPath);
    return files;
  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers du dossier:', error);
    return [];
  }
});

// Handler pour obtenir le chemin des modèles face-api.js
ipcMain.handle('get-models-path', async () => {
  try {
    // Déterminer le chemin des modèles selon le mode (dev/prod)
    let modelsPath;
    
    if (isDev) {
      // En mode développement, utiliser le dossier public
      modelsPath = path.join(__dirname, '../../public/models');
    } else {
      // En mode production, utiliser le dossier build
      modelsPath = path.join(__dirname, '../../build/models');
    }
    
    // Vérifier que le dossier existe
    if (fs.existsSync(modelsPath)) {
      console.log('📁 Chemin des modèles trouvé:', modelsPath);
      return modelsPath;
    } else {
      console.error('❌ Dossier des modèles non trouvé:', modelsPath);
      throw new Error('Dossier des modèles non trouvé');
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du chemin des modèles:', error);
    throw error;
  }
});

// IPC pour ajouter un descripteur facial
ipcMain.handle('face-index:add', async (event, descriptor, file, meta) => {
  faceVectorIndex.addDescriptor(descriptor, file, meta);
  faceVectorIndex.saveIndex();
  return true;
});

// IPC pour rechercher dans l'index
ipcMain.handle('face-index:search', async (event, descriptor, topN = 5) => {
  const results = faceVectorIndex.search(descriptor, topN);
  return results;
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('Erreur non capturée:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesse rejetée non gérée:', reason);
}); 

// Lancer le serveur local pour les modèles face-api.js
require('./modelsServer'); 