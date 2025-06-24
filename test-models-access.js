// Script de test pour vérifier l'accessibilité des modèles
const http = require('http');

async function testModelsAccess() {
  console.log('🔍 Test d\'accessibilité des modèles...');
  
  const ports = [3001, 3002, 3003];
  
  for (const port of ports) {
    try {
      console.log(`\n📡 Test du port ${port}...`);
      
      const testUrl = `http://127.0.0.1:${port}/tiny_face_detector/tiny_face_detector_model-weights_manifest.json`;
      console.log(`🔗 URL de test: ${testUrl}`);
      
      const response = await new Promise((resolve, reject) => {
        http.get(testUrl, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => resolve({ statusCode: res.statusCode, data }));
        }).on('error', reject);
      });
      
      if (response.statusCode === 200) {
        console.log(`✅ Port ${port} fonctionne!`);
        console.log(`📄 Contenu du fichier manifest: ${response.data.substring(0, 200)}...`);
        console.log(`📊 Taille de la réponse: ${response.data.length} caractères`);
        return port;
      } else {
        console.log(`❌ Port ${port} répond mais avec erreur: ${response.statusCode}`);
      }
    } catch (error) {
      console.log(`❌ Port ${port} non accessible: ${error.message}`);
    }
  }
  
  console.log('\n❌ Aucun port accessible');
  return null;
}

// Test des modèles disponibles
async function testAvailableModels(port) {
  if (!port) return;
  
  console.log(`\n🔍 Test des modèles disponibles sur le port ${port}...`);
  
  const models = [
    'tiny_face_detector/tiny_face_detector_model-weights_manifest.json',
    'face_landmark_68/face_landmark_68_model-weights_manifest.json',
    'face_recognition/face_recognition_model-weights_manifest.json',
    'age_gender_model/age_gender_model-weights_manifest.json',
    'face_expression/face_expression_model-weights_manifest.json'
  ];
  
  for (const model of models) {
    try {
      const url = `http://127.0.0.1:${port}/${model}`;
      const response = await new Promise((resolve, reject) => {
        http.get(url, (res) => {
          let data = '';
          res.on('data', (chunk) => data += chunk);
          res.on('end', () => resolve({ statusCode: res.statusCode, data }));
        }).on('error', reject);
      });
      
      if (response.statusCode === 200) {
        console.log(`✅ ${model} - Accessible`);
      } else {
        console.log(`❌ ${model} - Erreur ${response.statusCode}`);
      }
    } catch (error) {
      console.log(`❌ ${model} - Erreur: ${error.message}`);
    }
  }
}

// Exécuter les tests
async function runTests() {
  console.log('🚀 Démarrage des tests d\'accessibilité des modèles...\n');
  
  const workingPort = await testModelsAccess();
  await testAvailableModels(workingPort);
  
  console.log('\n✅ Tests terminés');
}

runTests().catch(console.error); 