const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = 3002;
const HOST = '127.0.0.1';

// Chemin des modèles
const modelsBasePath = path.join(__dirname, 'public/models');

console.log(`📁 Chemin des modèles: ${modelsBasePath}`);

// Vérifier que le dossier existe
if (!fs.existsSync(modelsBasePath)) {
  console.error(`❌ Dossier des modèles non trouvé: ${modelsBasePath}`);
  process.exit(1);
}

// Créer le serveur
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // Construire le chemin complet vers le fichier modèle
  const filePath = path.join(modelsBasePath, pathname);
  
  console.log(`📁 Demande: ${pathname} -> ${filePath}`);
  
  // Vérifier que le fichier existe
  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    // Définir le type MIME approprié
    let contentType = 'application/octet-stream';
    if (ext === '.json') contentType = 'application/json';
    else if (ext === '.txt') contentType = 'text/plain';
    else if (ext === '.pbtxt') contentType = 'text/plain';
    
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stat.size,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    
    console.log(`✅ Fichier servi: ${pathname} (${stat.size} bytes)`);
  } else {
    console.error(`❌ Fichier non trouvé: ${filePath}`);
    res.writeHead(404, { 
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*'
    });
    res.end('File not found');
  }
});

// Gérer les erreurs
server.on('error', (error) => {
  console.error('❌ Erreur du serveur:', error);
});

// Démarrer le serveur
server.listen(PORT, HOST, () => {
  console.log(`🚀 Serveur de modèles démarré sur http://${HOST}:${PORT}`);
  console.log(`📁 Modèles disponibles dans: ${modelsBasePath}`);
  
  // Lister les modèles disponibles
  console.log('\n📋 Modèles disponibles:');
  try {
    const models = fs.readdirSync(modelsBasePath);
    models.forEach(model => {
      const modelPath = path.join(modelsBasePath, model);
      const stat = fs.statSync(modelPath);
      if (stat.isDirectory()) {
        console.log(`  📁 ${model}/`);
        try {
          const files = fs.readdirSync(modelPath);
          files.forEach(file => {
            const filePath = path.join(modelPath, file);
            const fileStat = fs.statSync(filePath);
            console.log(`    📄 ${file} (${fileStat.size} bytes)`);
          });
        } catch (err) {
          console.log(`    ❌ Erreur lecture: ${err.message}`);
        }
      }
    });
  } catch (err) {
    console.error('❌ Erreur lors de la lecture des modèles:', err.message);
  }
});

// Gestion de l'arrêt propre
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté');
    process.exit(0);
  });
}); 