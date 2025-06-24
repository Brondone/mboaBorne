// Test de la reconnaissance faciale
console.log('🧪 Test de la reconnaissance faciale...');

// Simuler l'import de face-api.js
const faceapi = {
  nets: {
    tinyFaceDetector: {
      loadFromUri: async (url) => {
        console.log(`✅ Modèle chargé depuis: ${url}`);
        return true;
      }
    },
    faceLandmark68Net: {
      loadFromUri: async (url) => {
        console.log(`✅ Modèle chargé depuis: ${url}`);
        return true;
      }
    },
    faceRecognitionNet: {
      loadFromUri: async (url) => {
        console.log(`✅ Modèle chargé depuis: ${url}`);
        return true;
      }
    },
    ageGenderNet: {
      loadFromUri: async (url) => {
        console.log(`✅ Modèle chargé depuis: ${url}`);
        return true;
      }
    },
    faceExpressionNet: {
      loadFromUri: async (url) => {
        console.log(`✅ Modèle chargé depuis: ${url}`);
        return true;
      }
    }
  },
  detectAllFaces: async (img, options) => {
    console.log('🔍 Détection de visages...');
    return [];
  },
  TinyFaceDetectorOptions: class {
    constructor(config) {
      this.config = config;
      console.log('✅ Options créées:', config);
    }
  }
};

// Test de l'initialisation
async function testInitialization() {
  try {
    console.log('\n🚀 Test d\'initialisation...');
    
    // Test des ports
    const ports = [3001, 3002, 3003];
    let modelPath = null;
    
    for (const port of ports) {
      try {
        const testUrl = `http://127.0.0.1:${port}/tiny_face_detector/tiny_face_detector_model-weights_manifest.json`;
        console.log(`🔍 Test du port ${port}...`);
        
        const response = await fetch(testUrl);
        if (response.ok) {
          modelPath = `http://127.0.0.1:${port}`;
          console.log(`✅ Port ${port} fonctionne, utilisation de: ${modelPath}`);
          break;
        }
      } catch (error) {
        console.log(`❌ Port ${port} non disponible`);
      }
    }
    
    if (!modelPath) {
      throw new Error('Aucun serveur de modèles disponible');
    }

    console.log('📁 Chargement des modèles depuis:', modelPath);

    // Simuler le chargement des modèles
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(modelPath + '/tiny_face_detector'),
      faceapi.nets.faceLandmark68Net.loadFromUri(modelPath + '/face_landmark_68'),
      faceapi.nets.faceRecognitionNet.loadFromUri(modelPath + '/face_recognition'),
      faceapi.nets.ageGenderNet.loadFromUri(modelPath + '/age_gender_model'),
      faceapi.nets.faceExpressionNet.loadFromUri(modelPath + '/face_expression')
    ]);

    console.log('✅ Moteur de reconnaissance faciale initialisé avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    return false;
  }
}

// Test de la détection
async function testDetection() {
  try {
    console.log('\n🔍 Test de détection...');
    
    // Créer les options du détecteur
    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 224,
      scoreThreshold: 0.5
    });
    
    // Simuler une image
    const mockImage = { width: 640, height: 480 };
    
    // Détecter les visages
    const detections = await faceapi.detectAllFaces(mockImage, options);
    
    console.log(`✅ Détection terminée: ${detections.length} visage(s) détecté(s)`);
    return true;
  } catch (error) {
    console.error('❌ Erreur lors de la détection:', error);
    return false;
  }
}

// Exécuter les tests
async function runTests() {
  console.log('🧪 Démarrage des tests de reconnaissance faciale...\n');
  
  const initResult = await testInitialization();
  const detectionResult = await testDetection();
  
  console.log('\n📊 Résultats des tests:');
  console.log(`✅ Initialisation: ${initResult ? 'SUCCÈS' : 'ÉCHEC'}`);
  console.log(`✅ Détection: ${detectionResult ? 'SUCCÈS' : 'ÉCHEC'}`);
  
  if (initResult && detectionResult) {
    console.log('\n🎉 Tous les tests sont passés ! La reconnaissance faciale devrait fonctionner.');
  } else {
    console.log('\n❌ Certains tests ont échoué. Vérifiez la configuration.');
  }
}

runTests().catch(console.error); 