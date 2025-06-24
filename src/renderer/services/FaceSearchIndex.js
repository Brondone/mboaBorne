import * as faceapi from 'face-api.js';

class FaceSearchIndex {
  constructor() {
    this.faceDatabase = new Map();
    this.initialized = false;
    this.config = {
      minQuality: 0.3,
      similarityThreshold: 0.4,
      maxResults: 50
    };
    this.lastUpdateTimestamp = Date.now();
  }

  // Vérifier si l'index doit être mis à jour
  needsUpdate(photos) {
    if (!this.initialized) return true;
    
    // Vérifier si de nouvelles photos ont été ajoutées
    const hasNewPhotos = photos.some(photo => {
      const entry = this.faceDatabase.get(photo.id);
      return !entry || entry.metadata.lastModified < photo.lastModified;
    });

    return hasNewPhotos;
  }

  // Initialisation avec les photos existantes
  async initialize(photos, progressCallback = null) {
    try {
      console.log('🚀 Initialisation de l\'index de recherche...');
      const totalPhotos = photos.length;
      
      // Charger l'index existant d'abord
      const loaded = await this.loadIndex();
      if (loaded) {
        console.log('📂 Index existant chargé');
        // Vérifier si des mises à jour sont nécessaires
        if (!this.needsUpdate(photos)) {
          console.log('✨ Index déjà à jour');
          return;
        }
      }

      // Traiter uniquement les nouvelles photos
      const photosToProcess = photos.filter(photo => {
        const entry = this.faceDatabase.get(photo.id);
        return !entry || entry.metadata.lastModified < photo.lastModified;
      });

      console.log(`📸 Traitement de ${photosToProcess.length} photos...`);
      
      for (let i = 0; i < photosToProcess.length; i++) {
        const photo = photosToProcess[i];
        if (progressCallback) {
          progressCallback((i + 1) / photosToProcess.length * 100);
        }

        try {
          const faces = await this.extractFaces(photo);
          if (faces && faces.length > 0) {
            this.faceDatabase.set(photo.id, {
              faces,
              metadata: {
                path: photo.path,
                url: photo.url,
                fileName: photo.fileName || 'Photo',
                lastModified: photo.lastModified || Date.now()
              }
            });
          }
        } catch (error) {
          console.warn(`⚠️ Erreur lors de l'analyse de ${photo.fileName}:`, error);
        }
      }

      this.initialized = true;
      this.lastUpdateTimestamp = Date.now();
      console.log(`✅ Index initialisé avec ${this.faceDatabase.size} photos`);
      await this.saveIndex();
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
      throw error;
    }
  }

  // Extraction des visages d'une photo
  async extractFaces(photo) {
    try {
      const img = await this.loadImage(photo);
      
      const detections = await faceapi
        .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions({
          inputSize: 416,
          scoreThreshold: 0.4
        }))
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (!detections || detections.length === 0) return [];

      return detections.map(detection => {
        const quality = this.calculateQuality(detection);
        if (quality < this.config.minQuality) return null;

        // Conversion manuelle de la box au lieu d'utiliser toJSON
        const box = detection.detection.box;
        const boxData = {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height
        };

        return {
          descriptor: Array.from(detection.descriptor),
          box: boxData,
          quality,
          landmarks: detection.landmarks.positions.map(p => ({ x: p.x, y: p.y }))
        };
      }).filter(face => face !== null);
    } catch (error) {
      console.error('❌ Erreur d\'extraction:', error);
      return [];
    }
  }

  // Chargement d'une image
  async loadImage(photo) {
    try {
      // Si c'est une URL directe
      if (typeof photo === 'string') {
        return await faceapi.fetchImage(photo);
      }

      // Si c'est un objet photo
      if (photo && (photo.url || photo.path)) {
        const url = photo.url || photo.path;
        if (!url) {
          throw new Error('URL d\'image manquante');
        }
        return await faceapi.fetchImage(url);
      }

      // Si c'est déjà un élément HTML Image
      if (photo instanceof HTMLImageElement) {
        return photo;
      }

      throw new Error('Format d\'image non supporté');
    } catch (error) {
      console.error('❌ Erreur de chargement d\'image:', error);
      throw new Error('Impossible de charger l\'image');
    }
  }

  // Recherche rapide
  async search(referencePhoto, options = {}) {
    try {
      if (!this.initialized) {
        throw new Error('Index non initialisé');
      }

      console.log('🔍 Début de la recherche rapide...');
      console.log('📸 Photo de référence:', typeof referencePhoto === 'string' ? referencePhoto : 'Objet photo');

      const referenceFaces = await this.extractFaces(referencePhoto);
      
      if (!referenceFaces || referenceFaces.length === 0) {
        console.warn('⚠️ Aucun visage détecté dans l\'image de référence');
        return [];
      }

      // Utiliser le plus grand/meilleur visage comme référence
      const referenceFace = referenceFaces.reduce(
        (best, current) => current.quality > best.quality ? current : best,
        referenceFaces[0]
      );

      console.log('✅ Visage de référence extrait:', {
        qualité: referenceFace.quality.toFixed(2),
        position: `${referenceFace.box.x},${referenceFace.box.y}`,
        taille: `${referenceFace.box.width}x${referenceFace.box.height}`
      });

      const results = [];
      
      // Comparaison rapide avec l'index
      for (const [photoId, data] of this.faceDatabase) {
        const bestMatch = this.findBestMatch(referenceFace, data.faces);
        if (bestMatch) {
          results.push({
            id: photoId,
            photo: {
              id: photoId,
              path: data.metadata.path,
              url: data.metadata.url,
              fileName: data.metadata.fileName,
              lastModified: data.metadata.lastModified
            },
            similarity: bestMatch.similarity,
            confidence: bestMatch.confidence,
            quality: bestMatch.quality,
            faceBox: bestMatch.faceBox,
            faceWidth: bestMatch.width,
            faceHeight: bestMatch.height,
            faceArea: bestMatch.area
          });
        }
      }

      // Trier par similarité
      results.sort((a, b) => b.similarity - a.similarity);
      
      console.log(`✅ Recherche terminée: ${results.length} résultats`);
      return results.slice(0, this.config.maxResults);
    } catch (error) {
      console.error('❌ Erreur de recherche:', error);
      return []; // Retourner un tableau vide au lieu de throw
    }
  }

  // Trouver la meilleure correspondance dans une photo
  findBestMatch(referenceFace, faces) {
    let bestMatch = null;
    let bestSimilarity = 0;

    for (const face of faces) {
      const similarity = this.calculateSimilarity(referenceFace.descriptor, face.descriptor);
      const adjustedSimilarity = similarity * (face.quality || 0.5);

      if (adjustedSimilarity > this.config.similarityThreshold && adjustedSimilarity > bestSimilarity) {
        bestSimilarity = adjustedSimilarity;
        bestMatch = {
          similarity: adjustedSimilarity,
          confidence: Math.max(0.4, adjustedSimilarity * 0.9),
          quality: face.quality,
          faceBox: face.box,
          width: face.box.width,
          height: face.box.height,
          area: face.box.width * face.box.height
        };
      }
    }

    return bestMatch;
  }

  // Calcul de similarité entre deux descripteurs
  calculateSimilarity(descriptor1, descriptor2) {
    return 1 - faceapi.euclideanDistance(descriptor1, descriptor2);
  }

  // Calcul de la qualité d'un visage
  calculateQuality(detection) {
    const { width, height } = detection.detection.box;
    const area = width * height;
    const score = detection.detection.score;
    return (score * 0.6) + (Math.min(1, area / 5000) * 0.4);
  }

  // Sauvegarde de l'index
  async saveIndex() {
    try {
      const data = {
        faces: Array.from(this.faceDatabase.entries()),
        timestamp: Date.now()
      };
      localStorage.setItem('faceSearchIndex', JSON.stringify(data));
      console.log('💾 Index sauvegardé');
    } catch (error) {
      console.error('❌ Erreur de sauvegarde:', error);
    }
  }

  // Chargement de l'index
  async loadIndex() {
    try {
      const saved = localStorage.getItem('faceSearchIndex');
      if (!saved) return false;

      const data = JSON.parse(saved);
      this.faceDatabase = new Map(data.faces);
      this.initialized = true;
      
      console.log(`📂 Index chargé (${this.faceDatabase.size} photos)`);
      return true;
    } catch (error) {
      console.error('❌ Erreur de chargement:', error);
      return false;
    }
  }

  // Mise à jour de l'index avec de nouvelles photos
  async updatePhotos(photos) {
    let updated = 0;
    
    for (const photo of photos) {
      try {
        const faces = await this.extractFaces(photo);
        if (faces && faces.length > 0) {
          this.faceDatabase.set(photo.id, {
            faces,
            metadata: {
              path: photo.path,
              url: photo.url,
              fileName: photo.fileName || 'Photo',
              lastModified: photo.lastModified || Date.now()
            }
          });
          updated++;
        }
      } catch (error) {
        console.warn(`⚠️ Erreur de mise à jour pour ${photo.fileName}:`, error);
      }
    }

    if (updated > 0) {
      await this.saveIndex();
      console.log(`✅ Index mis à jour (${updated} photos)`);
    }
  }

  // Suppression de photos de l'index
  removePhotos(photoIds) {
    let removed = 0;
    
    for (const id of photoIds) {
      if (this.faceDatabase.delete(id)) {
        removed++;
      }
    }

    if (removed > 0) {
      this.saveIndex();
      console.log(`🗑️ Photos supprimées de l'index (${removed})`);
    }
  }

  // Configuration de l'index
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  // État de l'index
  getStatus() {
    return {
      initialized: this.initialized,
      photoCount: this.faceDatabase.size,
      config: { ...this.config }
    };
  }
}

export default FaceSearchIndex; 