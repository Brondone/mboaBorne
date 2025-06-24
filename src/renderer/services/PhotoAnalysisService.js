// 📸 SERVICE D'ANALYSE DE PHOTOS ULTRA-PERFORMANT
// Gestion complète de l'analyse et du traitement des photos

import faceRecognitionEngine from './FaceRecognitionEngine';
import fileService from './fileService';
import * as faceapi from 'face-api.js';
import FaceSearchIndex from './FaceSearchIndex';
// import faceVectorIndex from './FaceVectorIndex'; // Ne pas utiliser côté renderer

class PhotoAnalysisService {
  constructor() {
    this.isInitialized = false;
    this.isProcessing = false;
    this.processingQueue = [];
    
    // Cache permanent des descripteurs de visages
    this.faceDescriptorsCache = new Map();
    
    // Configuration
    this.config = {
      // Cache
      cacheEnabled: true,
      cacheVersion: '1.0',
      
      // Qualité
      minImageSize: 100,
      maxImageSize: 4096,
      
      // Détection
      minConfidence: 0.4,
      maxResults: 100,
      minQuality: 0.3
    };

    this.searchIndex = new FaceSearchIndex();

    // Charger le cache au démarrage
    if (this.config.cacheEnabled) {
      this.loadCacheFromStorage();
    }
    
    console.log('📸 Service d\'analyse de photos initialisé');
  }

  // Méthode d'initialisation
  async initialize() {
    try {
      if (this.isInitialized) {
        console.log('✅ Service déjà initialisé');
        return true;
      }

      console.log('🚀 Initialisation du service d\'analyse...');
      
      // Initialiser le moteur de reconnaissance faciale
        await faceRecognitionEngine.initialize();
      
        // Charger l'index existant
        const indexLoaded = await this.searchIndex.loadIndex();
        if (indexLoaded) {
          console.log('📂 Index de recherche chargé');
        }
      
        this.isInitialized = true;
      console.log('✅ Service initialisé avec succès');
        return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
      throw error;
    }
  }

  // Méthode pour sauvegarder le cache
  async saveCacheToStorage() {
    try {
      const cacheData = {
        version: this.config.cacheVersion,
        timestamp: Date.now(),
        entries: Array.from(this.faceDescriptorsCache.entries()).map(([key, value]) => ({
          imageId: key,
          faces: value.faces,
          metadata: {
            lastModified: value.lastModified,
            fileName: value.fileName,
            size: value.size
          }
        }))
      };
      
      localStorage.setItem('faceDescriptorsCache', JSON.stringify(cacheData));
      console.log(`💾 Cache sauvegardé (${this.faceDescriptorsCache.size} images)`);
    } catch (error) {
      console.warn('⚠️ Erreur lors de la sauvegarde du cache:', error);
    }
  }

  // Méthode pour charger le cache
  async loadCacheFromStorage() {
    try {
      const cachedData = localStorage.getItem('faceDescriptorsCache');
      if (cachedData) {
        const { version, entries } = JSON.parse(cachedData);
        
        // Vérifier la version du cache
        if (version !== this.config.cacheVersion) {
          console.log('📦 Nouvelle version du cache détectée, réinitialisation...');
          return;
        }

        // Restaurer le cache
        this.faceDescriptorsCache.clear();
        entries.forEach(entry => {
          this.faceDescriptorsCache.set(entry.imageId, {
            faces: entry.faces,
            ...entry.metadata
          });
        });

        console.log(`📂 Cache chargé (${this.faceDescriptorsCache.size} images)`);
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors du chargement du cache:', error);
    }
  }

  // Fonction utilitaire pour garantir un HTMLImageElement
  async ensureHtmlImageElement(image) {
    try {
      // Si c'est déjà un HTMLImageElement
      if (image instanceof HTMLImageElement) {
        return image;
      }

      // Si c'est un objet avec une propriété url ou path
      if (image && (image.url || image.path)) {
        const imagePath = image.url || image.path;
        if (!imagePath || imagePath === 'unknown') {
          throw new Error('Chemin d\'image invalide');
        }
        return await this.loadImage(imagePath);
      }

      // Si c'est une URL ou un chemin
      if (typeof image === 'string') {
        if (!image || image === 'unknown') {
          throw new Error('Chemin d\'image invalide');
        }
        return await this.loadImage(image);
      }

      throw new Error('Format d\'image non supporté');
          } catch (error) {
      console.error('❌ Erreur lors du chargement de l\'image:', error);
      throw error;
    }
  }

  // Méthode pour charger une image de manière sécurisée
  async loadImage(url) {
    if (!url || url === 'unknown') {
      throw new Error('URL d\'image invalide');
    }

    try {
      // Essayer d'abord avec faceapi.fetchImage
      return await faceapi.fetchImage(url);
    } catch (error) {
      // Si ça échoue, essayer avec une nouvelle Image()
      return await new Promise((resolve, reject) => {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Impossible de charger l\'image: ' + url));
        img.src = url;
      });
    }
  }

  // Méthode pour extraire les descripteurs avec cache
  async extractFaceDescriptors(image) {
    try {
      if (!image) {
        console.warn('❌ Image non définie');
        return [];
      }

      // Récupérer les métadonnées de l'image
      const imageMetadata = {
        lastModified: image.lastModified || Date.now(),
        fileName: image.name || image.fileName || (typeof image === 'string' ? image : 'unknown'),
        size: image.size || 0
      };

      // Log pour le debug
      console.log('📸 Traitement de l\'image:', imageMetadata.fileName);

      // S'assurer d'avoir un HTMLImageElement
      const htmlImage = await this.ensureHtmlImageElement(image);
      const imageId = htmlImage.src || htmlImage.path || (typeof image === 'string' ? image : null);

      if (!imageId) {
        console.warn('❌ Impossible d\'identifier l\'image de manière unique');
        return [];
      }

      // Vérifier le cache
      const cachedResult = this.faceDescriptorsCache.get(imageId);
      if (cachedResult) {
        // Vérifier si l'image a été modifiée
        if (cachedResult.lastModified === imageMetadata.lastModified) {
          console.log('✨ Utilisation du cache pour:', imageMetadata.fileName);
          return cachedResult.faces;
        }
      }

      console.log('🔍 Analyse de:', imageMetadata.fileName);

      // Vérifier la taille de l'image
      if (htmlImage.width < 20 || htmlImage.height < 20) {
        console.warn('❌ Image trop petite:', imageMetadata.fileName);
        return [];
      }

      // Détection des visages avec TinyFaceDetector
      const detections = await faceapi
        .detectAllFaces(htmlImage, new faceapi.TinyFaceDetectorOptions({
          inputSize: 416,
          scoreThreshold: this.config.minConfidence
        }))
        .withFaceLandmarks()
        .withFaceDescriptors()
        .withFaceExpressions()
        .withAgeAndGender();

      if (!detections || detections.length === 0) {
        console.log('ℹ️ Aucun visage détecté dans:', imageMetadata.fileName);
        return [];
      }

      // Traitement des résultats
      const faces = detections.map(detection => {
        const box = detection.detection.box;
        const quality = this.calculateFaceQuality(detection);

        // Ne garder que les visages de bonne qualité
        if (quality < this.config.minQuality) {
          console.log('ℹ️ Visage ignoré (qualité insuffisante):', quality.toFixed(2));
          return null;
        }

        return {
          descriptor: Array.from(detection.descriptor),
          box: {
            x: box.x,
            y: box.y,
            width: box.width,
            height: box.height
          },
          landmarks: detection.landmarks.positions.map(pos => ({ x: pos.x, y: pos.y })),
          expressions: detection.expressions,
          age: detection.age,
          gender: detection.gender,
          genderProbability: detection.genderProbability,
          quality: quality,
          area: box.width * box.height,
          width: box.width,
          height: box.height
        };
      }).filter(face => face !== null);

      // Mettre en cache
      if (faces.length > 0) {
        this.faceDescriptorsCache.set(imageId, {
          faces,
          ...imageMetadata
        });

        // Sauvegarder périodiquement
        if (this.faceDescriptorsCache.size % 10 === 0) {
          this.saveCacheToStorage();
        }
      }

      return faces;
    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction des descripteurs:', error);
      return [];
    }
  }

  // Méthode pour la recherche de visages similaires
  async findSimilarFaces(referenceImageUrl, photos, progressCallback = null) {
    try {
      if (!this.isInitialized) {
        console.log('🚀 Service non initialisé, tentative d\'initialisation...');
        await this.initialize();
      }

      console.log('🔍 Début de la recherche de visages similaires...');

      // Vérifier si l'index doit être mis à jour
      const needsUpdate = this.searchIndex.needsUpdate(photos);
      
      if (needsUpdate) {
        if (!this.searchIndex.initialized) {
          console.log('📦 Première analyse : création de l\'index...');
          await this.searchIndex.initialize(photos, progressCallback);
        } else {
          // Mettre à jour uniquement les nouvelles photos
          const newPhotos = photos.filter(photo => {
            const entry = this.searchIndex.faceDatabase.get(photo.id);
            return !entry || entry.metadata.lastModified < photo.lastModified;
          });
          
          if (newPhotos.length > 0) {
            console.log(`📦 Mise à jour de l'index avec ${newPhotos.length} nouvelles photos...`);
            await this.searchIndex.updatePhotos(newPhotos);
          } else {
            console.log('✨ Toutes les photos sont déjà indexées');
          }
        }
      } else {
        console.log('✨ Index à jour, utilisation du cache...');
      }

      // Utiliser l'index pour la recherche rapide
      console.log('🔍 Recherche rapide dans l\'index...');
      const results = await this.searchIndex.search(referenceImageUrl, {
        similarityThreshold: 0.4 // Utiliser un seuil moins strict
      });

      console.log(`✅ Recherche terminée: ${results.length} résultats`);
      return results;

    } catch (error) {
      console.error('❌ Erreur lors de la recherche:', error);
      throw error;
    }
  }

  // Méthode utilitaire pour calculer la similarité
  calculateSimilarity(descriptor1, descriptor2) {
    return 1 - faceapi.euclideanDistance(descriptor1, descriptor2);
  }

  // Méthode pour calculer la qualité d'un visage
  calculateFaceQuality(detection) {
    const { width, height } = detection.detection.box;
    const area = width * height;
    const score = detection.detection.score;
    return (score * 0.6) + (Math.min(1, area / 5000) * 0.4);
  }

  // Méthode pour vider le cache
  clearCache() {
    const size = this.faceDescriptorsCache.size;
    this.faceDescriptorsCache.clear();
    localStorage.removeItem('faceDescriptorsCache');
    console.log(`🧹 Cache vidé (${size} images)`);
  }
}

// Instance singleton
const photoAnalysisService = new PhotoAnalysisService();
export default photoAnalysisService;
export { PhotoAnalysisService }; 