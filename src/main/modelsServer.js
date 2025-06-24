const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = 3001;
const HOST = '127.0.0.1';

// Déterminer le chemin des modèles selon l'environnement
const isDev = process.env.NODE_ENV === 'development';
const modelsBasePath = isDev 
  ? path.join(__dirname, '../public/models')
  : path.join(__dirname, '../build/models');

console.log(`📁 Chemin des modèles: ${modelsBasePath}`);

// Créer le serveur
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // Construire le chemin complet vers le fichier modèle
  const filePath = path.join(modelsBasePath, pathname);
  
  console.log(`📁 Demande modèle: ${pathname} -> ${filePath}`);
  
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
    
    console.log(`✅ Modèle servi: ${pathname} (${stat.size} bytes)`);
  } else {
    console.error(`❌ Modèle non trouvé: ${filePath}`);
    res.writeHead(404, { 
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*'
    });
    res.end('Model not found');
  }
});

// Gérer les erreurs
server.on('error', (error) => {
  console.error('❌ Erreur du serveur de modèles:', error);
});

// Démarrer le serveur
server.listen(PORT, HOST, () => {
  console.log(`🚀 Serveur de modèles démarré sur http://${HOST}:${PORT}`);
  console.log(`📁 Modèles disponibles dans: ${modelsBasePath}`);
});

module.exports = { server, PORT, HOST }; 