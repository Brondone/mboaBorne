// 🚀 MOTEUR DE RECONNAISSANCE FACIALE ULTRA-PERFORMANT
// Système complet et fonctionnel pour la détection et reconnaissance de visages

import * as faceapi from 'face-api.js';
// import faceVectorIndex from './FaceVectorIndex'; // Ne pas utiliser côté renderer

class FaceRecognitionEngine {
  constructor() {
    this.isInitialized = false;
    this.modelsLoaded = false;
    this.detectionNet = null;
    this.recognitionNet = null;
    this.landmarkNet = null;
    this.ageGenderNet = null;
    this.expressionNet = null;
    
    // Configuration optimisée pour recherche ultra-précise
    this.config = {
      // Détection standard
      detectionThreshold: 0.3,
      minFaceSize: 15,
      scaleFactor: 0.8,
      
      // Reconnaissance équilibrée
      similarityThreshold: 0.4,
      maxResults: 100,
      
      // Performance standard
      inputSize: 416,
      scoreThreshold: 0.3,
      
      // Qualité standard
      minDescriptorQuality: 0.2,
      confidenceThreshold: 0.4,
      
      // Paramètres pour petits visages
      enableMultiScaleDetection: true,
      maxScales: 4,
      scaleStep: 0.75,
      
      // Paramètres pour visages de faible qualité
      enableBlurDetection: true,
      enablePartialFaceDetection: true,
      enableOccludedFaceDetection: true,
      
      // Paramètres de recherche standard
      enableDescriptorAugmentation: true,
      
      // Paramètres de base
      minLandmarkConfidence: 0.5,
      minFaceArea: 800,
      maxBlurScore: 0.8,
      minVisibleLandmarks: 0.6
    };
    
    // Cache pour optimiser les performances
    this.descriptorCache = new Map();
    this.analysisCache = new Map();
    
    console.log('🎯 Moteur de reconnaissance faciale initialisé');
  }

  // 🚀 INITIALISATION DES MODÈLES
  async initialize() {
    try {
      console.log('🚀 Initialisation du moteur de reconnaissance faciale...');

      // Essayer plusieurs ports pour le serveur de modèles
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

      // Charger les modèles dans l'ordre
      console.log('📦 Chargement du détecteur de visages...');
      await faceapi.nets.tinyFaceDetector.loadFromUri(modelPath + '/tiny_face_detector');
      
      console.log('📦 Chargement du modèle de landmarks...');
      await faceapi.nets.faceLandmark68Net.loadFromUri(modelPath + '/face_landmark_68');
      
      console.log('📦 Chargement du modèle de reconnaissance...');
      await faceapi.nets.faceRecognitionNet.loadFromUri(modelPath + '/face_recognition');
      
      console.log('📦 Chargement du modèle d\'expressions...');
      await faceapi.nets.faceExpressionNet.loadFromUri(modelPath + '/face_expression');
      
      console.log('📦 Chargement du modèle âge/genre...');
      await faceapi.nets.ageGenderNet.loadFromUri(modelPath + '/age_gender_model');

      this.isInitialized = true;
      this.modelsLoaded = true;

      console.log('✅ Moteur de reconnaissance faciale initialisé avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
      throw new Error(`Échec de l'initialisation: ${error.message}`);
    }
  }

  // 🔍 DÉTECTION ULTRA-SENSIBLE DE VISAGES
  async detectFaces(imageElement, options = {}) {
    if (!this.isInitialized) {
      throw new Error('Moteur non initialisé');
    }

    try {
      const config = { ...this.config, ...options };
      console.log('🔍 Début de la détection des visages...');
      
      let allDetections = [];
      
      // Détection multi-échelle si activée
      if (config.enableMultiScaleDetection) {
        console.log('📏 Détection multi-échelle activée');
        
        const scales = [];
        let currentScale = 1.0;
        for (let i = 0; i < config.maxScales; i++) {
          scales.push(currentScale);
          currentScale *= config.scaleStep;
        }
        
        for (const scale of scales) {
          const scaledSize = {
            width: Math.round(imageElement.width * scale),
            height: Math.round(imageElement.height * scale)
          };
          
          console.log(`🔍 Analyse à l'échelle ${scale.toFixed(2)} (${scaledSize.width}x${scaledSize.height})`);
          
            const detectorOptions = new faceapi.TinyFaceDetectorOptions({
            inputSize: config.inputSize,
            scoreThreshold: config.scoreThreshold
            });
            
          const detections = await faceapi.detectAllFaces(imageElement, detectorOptions)
            .withFaceLandmarks(true) // Force l'utilisation du modèle complet
              .withFaceDescriptors()
              .withAgeAndGender()
              .withFaceExpressions();
            
          if (detections && detections.length > 0) {
            // Ajouter l'échelle aux détections
            detections.forEach(d => {
              d.scale = scale;
            // Ajuster les coordonnées selon l'échelle
              if (scale !== 1.0) {
                d.box = new faceapi.Box({
                  x: d.box.x / scale,
                  y: d.box.y / scale,
                  width: d.box.width / scale,
                  height: d.box.height / scale
                });
                // Ajuster les positions des landmarks
                d.landmarks.positions = d.landmarks.positions.map(p => ({
                  x: p.x / scale,
                  y: p.y / scale
            }));
              }
            });
            allDetections.push(...detections);
          }
        }
      } else {
        console.log('📏 Détection standard');
        const detectorOptions = new faceapi.TinyFaceDetectorOptions({
          inputSize: config.inputSize,
          scoreThreshold: config.scoreThreshold
        });
        
        allDetections = await faceapi.detectAllFaces(imageElement, detectorOptions)
          .withFaceLandmarks(true) // Force l'utilisation du modèle complet
          .withFaceDescriptors()
          .withAgeAndGender()
          .withFaceExpressions();
      }
      
      // Supprimer les doublons et filtrer par qualité
      const uniqueDetections = this.removeDuplicateDetections(allDetections);
      console.log(`📊 ${uniqueDetections.length} visage(s) unique(s) après suppression des doublons`);
      
      const analyzedFaces = [];
      
      for (let i = 0; i < uniqueDetections.length; i++) {
        const detection = uniqueDetections[i];
        
        console.log(`🔍 Analyse du visage ${i + 1}/${uniqueDetections.length}...`);
        
        // Vérifier la taille minimale du visage
        const faceArea = detection.box.width * detection.box.height;
        if (faceArea < config.minFaceArea) {
          console.log(`⚠️ Visage ${i + 1} ignoré - Trop petit: ${faceArea}px²`);
          continue;
        }
        
        // Vérifier la qualité des landmarks
        const landmarkQuality = this.assessLandmarkQuality(detection.landmarks);
        if (landmarkQuality < config.minLandmarkConfidence) {
          console.log(`⚠️ Visage ${i + 1} ignoré - Qualité landmarks insuffisante: ${(landmarkQuality * 100).toFixed(1)}%`);
          continue;
        }
        
        // Calculer la qualité du descripteur avec des critères adaptatifs
        const quality = this.calculateAdaptiveQuality(detection.descriptor, detection, imageElement);
        
        // Vérifier le score de flou
        if (quality.blurQuality < (1 - config.maxBlurScore)) {
          console.log(`⚠️ Visage ${i + 1} ignoré - Trop flou: ${(quality.blurQuality * 100).toFixed(1)}%`);
          continue;
        }
        
        // Vérifier si le visage est suffisamment bon pour être inclus
        if (quality.overallQuality >= config.minDescriptorQuality || 
            (config.enablePartialFaceDetection && quality.partialFaceQuality >= config.minVisibleLandmarks)) {
          
          const analyzedFace = {
            id: `face_${Date.now()}_${i}`,
            detection: {
              box: {
                x: detection.box.x,
                y: detection.box.y,
                width: detection.box.width,
                height: detection.box.height
              },
              score: detection.score,
              scale: detection.scale || 1.0
            },
            landmarks: {
              positions: detection.landmarks.positions.map(point => ({
              x: point.x,
              y: point.y
            })),
              quality: landmarkQuality
            },
            descriptor: Array.from(detection.descriptor),
            age: detection.age,
            gender: detection.gender,
            genderProbability: detection.genderProbability,
            expressions: detection.expressions || {},
            quality: {
              ...quality,
              landmarkQuality
            },
            metadata: {
              detectedAt: new Date(),
              processingTime: Date.now(),
              modelVersion: 'face-api.js',
              detectionMethod: detection.scale ? 'multi-scale' : 'standard',
              scale: detection.scale || 1.0
            }
          };
          
          analyzedFaces.push(analyzedFace);
          
          console.log(`✅ Visage ${i + 1} analysé - Qualité: ${(quality.overallQuality * 100).toFixed(1)}%, Landmarks: ${(landmarkQuality * 100).toFixed(1)}%, Taille: ${detection.box.width}x${detection.box.height}`);
        } else {
          console.log(`⚠️ Visage ${i + 1} ignoré - Qualité trop faible: ${(quality.overallQuality * 100).toFixed(1)}%`);
        }
      }
      
      console.log(`🎯 Détection terminée: ${analyzedFaces.length} visage(s) analysé(s) sur ${uniqueDetections.length} détecté(s)`);
      
      return analyzedFaces;
    } catch (error) {
      console.error('❌ Erreur lors de la détection:', error);
      throw new Error(`Échec de la détection: ${error.message}`);
    }
  }

  // 🎯 RECONNAISSANCE ULTRA-PRÉCISE DE VISAGES
  async recognizeFaces(referenceDescriptor, targetFaces, options = {}) {
    if (!this.isInitialized) {
      throw new Error('Moteur non initialisé');
    }

    try {
      const config = { ...this.config, ...options };
      
      console.log('🎯 Début de la reconnaissance faciale ultra-précise...');
      console.log(`📊 Comparaison avec ${targetFaces.length} visage(s)`);
      
      const results = [];
      
      for (const targetFace of targetFaces) {
        if (!targetFace.descriptor || targetFace.descriptor.length === 0) {
          console.warn('⚠️ Visage sans descripteur, ignoré');
          continue;
        }
        
        // Vérifier la présence des landmarks
        if (!targetFace.landmarks || !targetFace.landmarks.positions) {
          console.warn('⚠️ Visage sans landmarks, utilisant uniquement le descripteur');
          // Utiliser la méthode de base si pas de landmarks
        const similarity = this.calculateSimilarity(referenceDescriptor, targetFace.descriptor);
          
          if (similarity >= config.similarityThreshold) {
            results.push({
              faceId: targetFace.id,
              similarity: similarity,
              confidence: similarity * 0.8, // Confiance réduite sans landmarks
              quality: targetFace.quality,
              metadata: {
                processingTime: Date.now(),
                method: 'descriptor_only',
                thresholds: { similarity: config.similarityThreshold }
              }
            });
          }
          continue;
        }

        // Créer un objet face avec le descripteur de référence
        const referenceFace = {
          descriptor: referenceDescriptor,
          landmarks: targetFace.landmarks // Utiliser les landmarks de la cible pour la normalisation
        };
        
        // Calculer la similarité complète avec landmarks
        const similarity = this.calculateSimilarityWithLandmarks(referenceFace, targetFace);
        
        // Calculer la confiance avec des seuils adaptatifs
        const confidence = this.calculateAdaptiveConfidence(similarity, targetFace.quality, config);
        
        // Vérifier la qualité des landmarks
        const landmarkQuality = this.assessLandmarkQuality(targetFace.landmarks);
        
        // Seuils adaptatifs selon la qualité
        const adaptiveThresholds = this.calculateAdaptiveThresholds(targetFace.quality, config);
        
        // Vérifier si la correspondance est valide avec les seuils adaptatifs
        const isValidMatch = (
          similarity >= adaptiveThresholds.similarity &&
          confidence >= adaptiveThresholds.confidence &&
          targetFace.quality.overallQuality >= adaptiveThresholds.quality &&
          landmarkQuality >= config.minLandmarkConfidence
        );
        
        if (isValidMatch) {
          const result = {
            faceId: targetFace.id,
            similarity: similarity,
            confidence: confidence,
            quality: {
              ...targetFace.quality,
              landmarkQuality: landmarkQuality
            },
            metadata: {
              processingTime: Date.now(),
              method: 'full_analysis',
              thresholds: adaptiveThresholds,
              detectionMethod: targetFace.metadata?.detectionMethod || 'standard',
              scale: targetFace.metadata?.scale || 1.0
            }
          };
          
          results.push(result);
          
          console.log(`✅ Match trouvé - Similarité: ${(similarity * 100).toFixed(1)}%, Confiance: ${(confidence * 100).toFixed(1)}%, Qualité landmarks: ${(landmarkQuality * 100).toFixed(1)}%`);
        } else {
          console.log(`❌ Pas de match - Similarité: ${(similarity * 100).toFixed(1)}%, Confiance: ${(confidence * 100).toFixed(1)}%, Qualité landmarks: ${(landmarkQuality * 100).toFixed(1)}%`);
        }
      }
      
      // Trier par similarité décroissante
      results.sort((a, b) => b.similarity - a.similarity);
      
      // Limiter le nombre de résultats
      const finalResults = results.slice(0, config.maxResults);
      
      console.log(`📊 ${finalResults.length} correspondance(s) trouvée(s) sur ${results.length} comparaisons`);
      
      return finalResults;
    } catch (error) {
      console.error('❌ Erreur lors de la reconnaissance:', error);
      throw new Error(`Échec de la reconnaissance: ${error.message}`);
    }
  }

  // 🎯 CALCUL DE CONFIANCE ADAPTATIVE
  calculateAdaptiveConfidence(similarity, quality, config) {
    // Poids adaptatifs selon la qualité du visage
    const similarityWeight = 0.6;
    const qualityWeight = 0.4;
    
    // Ajuster les poids selon la qualité
    let adjustedSimilarityWeight = similarityWeight;
    let adjustedQualityWeight = qualityWeight;
    
    if (quality.overallQuality < 0.3) {
      // Pour les visages de faible qualité, donner plus de poids à la similarité
      adjustedSimilarityWeight = 0.8;
      adjustedQualityWeight = 0.2;
    } else if (quality.overallQuality > 0.8) {
      // Pour les visages de haute qualité, équilibrer les poids
      adjustedSimilarityWeight = 0.5;
      adjustedQualityWeight = 0.5;
    }
    
    // Calculer la confiance de base
    const baseConfidence = (similarity * adjustedSimilarityWeight) + (quality.overallQuality * adjustedQualityWeight);
    
    // Bonus pour les petits visages bien détectés
    let sizeBonus = 0;
    if (quality.faceRatio < 0.01 && quality.sizeQuality > 0.5) {
      sizeBonus = 0.1; // Bonus de 10% pour les petits visages de bonne qualité
    }
    
    // Bonus pour les visages partiels bien reconnus
    let partialBonus = 0;
    if (quality.partialFaceQuality < 0.8 && similarity > 0.7) {
      partialBonus = 0.05; // Bonus de 5% pour les visages partiels bien reconnus
    }
    
    return Math.min(1, baseConfidence + sizeBonus + partialBonus);
  }
  
  // 🎯 CALCUL DE SEUILS ADAPTATIFS
  calculateAdaptiveThresholds(quality, config) {
    let similarityThreshold = config.similarityThreshold;
    let confidenceThreshold = config.confidenceThreshold;
    let qualityThreshold = config.minDescriptorQuality;
    
    // Ajuster les seuils selon la qualité du visage
    if (quality.overallQuality < 0.3) {
      // Visages de très faible qualité : seuils plus bas
      similarityThreshold *= 0.8;
      confidenceThreshold *= 0.7;
      qualityThreshold *= 0.5;
    } else if (quality.overallQuality < 0.6) {
      // Visages de qualité moyenne : seuils légèrement plus bas
      similarityThreshold *= 0.9;
      confidenceThreshold *= 0.85;
      qualityThreshold *= 0.8;
    } else if (quality.overallQuality > 0.8) {
      // Visages de haute qualité : seuils standards
      // Pas d'ajustement
    }
    
    // Ajustements spéciaux pour les petits visages
    if (quality.faceRatio < 0.005) { // Très petits visages
      similarityThreshold *= 0.75;
      confidenceThreshold *= 0.6;
    } else if (quality.faceRatio < 0.01) { // Petits visages
      similarityThreshold *= 0.85;
      confidenceThreshold *= 0.75;
    }
    
    // Ajustements pour les visages partiels
    if (quality.partialFaceQuality < 0.7) {
      similarityThreshold *= 0.8;
      confidenceThreshold *= 0.7;
    }
    
    return {
      similarity: Math.max(0.2, similarityThreshold),
      confidence: Math.max(0.2, confidenceThreshold),
      quality: Math.max(0.1, qualityThreshold)
    };
  }

  // 🔍 RECHERCHE DE VISAGES SIMILAIRES
  async findSimilarFaces(referenceDescriptor, photos, options = {}) {
    if (!this.isInitialized) {
      throw new Error('Moteur non initialisé');
    }

    try {
      const config = { ...this.config, ...options };
      
      console.log('🔍 Recherche de visages similaires...');
      console.log(`📊 Analyse de ${photos.length} photos`);
      
      const results = [];
      let processedPhotos = 0;
      let analyzedFaces = 0;
      
      for (const photo of photos) {
        processedPhotos++;
        
        // Vérifier si la photo a déjà été analysée
        if (photo.faceAnalysis && photo.faceAnalysis.faces && photo.faceAnalysis.faces.length > 0) {
          analyzedFaces += photo.faceAnalysis.faces.length;
          
          // Comparer avec chaque visage détecté
          const recognitions = await this.recognizeFaces(
            referenceDescriptor, 
            photo.faceAnalysis.faces,
            config
          );
          
          // Ajouter les résultats avec les métadonnées de la photo
          for (const recognition of recognitions) {
            results.push({
              photoId: photo.id,
              fileName: photo.fileName,
              path: photo.path || photo.url,
              faceId: recognition.faceId,
              similarity: recognition.similarity,
              confidence: recognition.confidence,
              quality: recognition.quality,
              metadata: {
                ...recognition.metadata,
                photoInfo: {
                  id: photo.id,
                  fileName: photo.fileName,
                  processedAt: photo.faceAnalysis.processedAt
                }
              }
            });
          }
        } else {
          console.log(`⚠️ Photo ${photo.fileName} non analysée`);
        }
      }
      
      // Trier par similarité décroissante
      results.sort((a, b) => b.similarity - a.similarity);
      
      // Limiter le nombre de résultats
      const limitedResults = results.slice(0, config.maxResults);
      
      console.log(`✅ Recherche terminée: ${limitedResults.length} résultat(s) trouvé(s)`);
      console.log(`📊 Photos traitées: ${processedPhotos}, Visages analysés: ${analyzedFaces}`);
      
      return limitedResults;
    } catch (error) {
      console.error('❌ Erreur lors de la recherche:', error);
      throw new Error(`Échec de la recherche: ${error.message}`);
    }
  }

  // 📊 CALCULS DE SIMILARITÉ ET CONFIANCE
  calculateSimilarity(descriptor1, descriptor2) {
    if (!descriptor1 || !descriptor2 || descriptor1.length !== descriptor2.length) {
      return 0;
    }
    
    // Distance euclidienne normalisée pour les descripteurs
    let descriptorDistance = 0;
    for (let i = 0; i < descriptor1.length; i++) {
      descriptorDistance += Math.pow(descriptor1[i] - descriptor2[i], 2);
    }
    descriptorDistance = Math.sqrt(descriptorDistance);
    
    // Convertir en similarité (0 = très différent, 1 = identique)
    const descriptorSimilarity = Math.max(0, 1 - (descriptorDistance / Math.sqrt(descriptor1.length)));
    
    return descriptorSimilarity;
  }

  // Nouvelle fonction pour calculer la similarité avec landmarks
  calculateSimilarityWithLandmarks(face1, face2) {
    // Vérifier la présence des données nécessaires
    if (!face1 || !face2 || !face1.descriptor || !face2.descriptor || 
        !face1.landmarks || !face2.landmarks) {
      return 0;
    }

    // Similarité des descripteurs
    const descriptorSimilarity = this.calculateSimilarity(face1.descriptor, face2.descriptor);

    // Similarité des landmarks
    const landmarkSimilarity = this.calculateLandmarkSimilarity(face1.landmarks, face2.landmarks);

    // Similarité de la géométrie du visage
    const geometrySimilarity = this.calculateGeometrySimilarity(face1.landmarks, face2.landmarks);

    // Pondération des différentes similarités
    const weights = {
      descriptor: 0.6,  // Le descripteur reste le plus important
      landmarks: 0.25,  // Les landmarks ont un poids significatif
      geometry: 0.15    // La géométrie complète l'analyse
    };

    // Calcul de la similarité finale pondérée
    const finalSimilarity = (
      descriptorSimilarity * weights.descriptor +
      landmarkSimilarity * weights.landmarks +
      geometrySimilarity * weights.geometry
    );

    return Math.max(0, Math.min(1, finalSimilarity));
  }

  // Calcul de la similarité des landmarks
  calculateLandmarkSimilarity(landmarks1, landmarks2) {
    if (!landmarks1.positions || !landmarks2.positions || 
        landmarks1.positions.length !== landmarks2.positions.length) {
      return 0;
    }

    let totalDistance = 0;
    const positions1 = landmarks1.positions;
    const positions2 = landmarks2.positions;

    // Normaliser les positions par rapport au centre du visage
    const center1 = this.calculateLandmarkCenter(positions1);
    const center2 = this.calculateLandmarkCenter(positions2);

    for (let i = 0; i < positions1.length; i++) {
      const dx1 = positions1[i].x - center1.x;
      const dy1 = positions1[i].y - center1.y;
      const dx2 = positions2[i].x - center2.x;
      const dy2 = positions2[i].y - center2.y;

      // Distance euclidienne normalisée
      totalDistance += Math.sqrt(
        Math.pow(dx1 - dx2, 2) + Math.pow(dy1 - dy2, 2)
      );
    }

    // Convertir en similarité (0 = très différent, 1 = identique)
    const avgDistance = totalDistance / positions1.length;
    return Math.max(0, 1 - (avgDistance / 100)); // 100 est un facteur de normalisation
  }

  // Calcul de la similarité géométrique
  calculateGeometrySimilarity(landmarks1, landmarks2) {
    if (!landmarks1.positions || !landmarks2.positions) return 0;

    // Points clés pour la géométrie du visage
    const keyPoints = {
      eyeLeft: [36, 37, 38, 39, 40, 41],
      eyeRight: [42, 43, 44, 45, 46, 47],
      nose: [27, 28, 29, 30, 31, 32, 33, 34, 35],
      mouth: [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59]
    };

    let similarities = [];

    // Calculer les ratios de distance pour chaque paire de points clés
    for (const [feature1, indices1] of Object.entries(keyPoints)) {
      for (const [feature2, indices2] of Object.entries(keyPoints)) {
        if (feature1 !== feature2) {
          const ratio1 = this.calculateFeatureDistance(landmarks1.positions, indices1, indices2);
          const ratio2 = this.calculateFeatureDistance(landmarks2.positions, indices1, indices2);
          
          const ratioDiff = Math.abs(ratio1 - ratio2);
          similarities.push(Math.max(0, 1 - ratioDiff));
        }
      }
    }

    // Moyenne des similarités
    return similarities.reduce((a, b) => a + b, 0) / similarities.length;
  }

  // Calcul du centre des landmarks
  calculateLandmarkCenter(positions) {
    const sum = positions.reduce((acc, pos) => ({
      x: acc.x + pos.x,
      y: acc.y + pos.y
    }), { x: 0, y: 0 });
    
    return {
      x: sum.x / positions.length,
      y: sum.y / positions.length
    };
  }

  // Calcul de la distance entre deux groupes de points caractéristiques
  calculateFeatureDistance(positions, indices1, indices2) {
    const center1 = this.calculateLandmarkCenter(
      indices1.map(i => positions[i])
    );
    const center2 = this.calculateLandmarkCenter(
      indices2.map(i => positions[i])
    );

    return Math.sqrt(
      Math.pow(center1.x - center2.x, 2) + 
      Math.pow(center1.y - center2.y, 2)
    );
  }

  calculateDescriptorQuality(descriptor, detection) {
    if (!descriptor || descriptor.length === 0) {
      return 0;
    }
    
    // Calculer la variance du descripteur
    const mean = descriptor.reduce((sum, val) => sum + val, 0) / descriptor.length;
    const variance = descriptor.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / descriptor.length;
    
    // Qualité basée sur la variance et la confiance de détection
    const varianceQuality = Math.min(1, Math.sqrt(variance) * 2);
    const detectionQuality = detection.score;
    
    return (varianceQuality * 0.7) + (detectionQuality * 0.3);
  }

  calculateOverallQuality(detection, descriptorQuality, imageElement) {
    const detectionQuality = detection.score;
    const sizeQuality = Math.min(1, (detection.box.width * detection.box.height) / 10000);
    const resolutionQuality = this.assessImageResolution(imageElement);
    
    return (
      detectionQuality * 0.4 +
      descriptorQuality * 0.3 +
      sizeQuality * 0.2 +
      resolutionQuality * 0.1
    );
  }

  assessImageResolution(imageElement) {
    const width = imageElement.naturalWidth || imageElement.width;
    const height = imageElement.naturalHeight || imageElement.height;
    
    const totalPixels = width * height;
    
    if (totalPixels >= 2000000) return 1.0; // 2MP+
    if (totalPixels >= 1000000) return 0.8; // 1MP+
    if (totalPixels >= 500000) return 0.6;  // 0.5MP+
    if (totalPixels >= 250000) return 0.4;  // 0.25MP+
    return 0.2; // Très faible résolution
  }

  // ⚙️ CONFIGURATION
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Configuration mise à jour:', this.config);
  }

  getConfig() {
    return { ...this.config };
  }

  // 📊 STATUT ET INFORMATIONS
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      modelsLoaded: this.modelsLoaded,
      isReady: this.isInitialized && this.modelsLoaded,
      config: this.getConfig(),
      cacheSize: this.descriptorCache.size
    };
  }

  // 🧹 NETTOYAGE
  clearCache() {
    this.descriptorCache.clear();
    this.analysisCache.clear();
    console.log('🧹 Cache vidé');
  }

  // 🧹 SUPPRESSION DES DOUBLONS DE DÉTECTION
  removeDuplicateDetections(detections) {
    if (detections.length <= 1) return detections;
    
    const uniqueDetections = [];
    const overlapThreshold = 0.7; // Seuil de chevauchement pour considérer comme doublon
    
    for (const detection of detections) {
      let isDuplicate = false;
      
      for (const uniqueDetection of uniqueDetections) {
        const overlap = this.calculateOverlap(detection.box, uniqueDetection.box);
        
        if (overlap > overlapThreshold) {
          // Garder la détection avec le meilleur score
          if (detection.score > uniqueDetection.score) {
            const index = uniqueDetections.indexOf(uniqueDetection);
            uniqueDetections[index] = detection;
          }
          isDuplicate = true;
          break;
        }
      }
      
      if (!isDuplicate) {
        uniqueDetections.push(detection);
      }
    }
    
    return uniqueDetections;
  }
  
  // 📐 CALCUL DU CHEVAUCHEMENT ENTRE DEUX BOÎTES
  calculateOverlap(box1, box2) {
    const x1 = Math.max(box1.x, box2.x);
    const y1 = Math.max(box1.y, box2.y);
    const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
    const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);
    
    if (x2 <= x1 || y2 <= y1) return 0;
    
    const intersection = (x2 - x1) * (y2 - y1);
    const area1 = box1.width * box1.height;
    const area2 = box2.width * box2.height;
    const union = area1 + area2 - intersection;
    
    return intersection / union;
  }
  
  // 🎯 CALCUL DE QUALITÉ ADAPTATIVE
  calculateAdaptiveQuality(descriptor, detection, imageElement) {
    if (!descriptor || descriptor.length === 0) {
      return {
        descriptorQuality: 0,
        faceSize: 0,
        confidence: 0,
        resolution: 0,
        overallQuality: 0,
        sizeQuality: 0,
        blurQuality: 1,
        partialFaceQuality: 1
      };
    }
    
    // Qualité du descripteur
    const descriptorQuality = this.calculateDescriptorQuality(descriptor, detection);
    
    // Qualité de la taille du visage (adaptative)
    const faceArea = detection.box.width * detection.box.height;
    const imageArea = (imageElement.naturalWidth || imageElement.width) * (imageElement.naturalHeight || imageElement.height);
    const faceRatio = faceArea / imageArea;
    
    // Qualité adaptative selon la taille
    let sizeQuality;
    if (faceRatio > 0.01) { // Visage > 1% de l'image
      sizeQuality = Math.min(1, faceRatio * 100);
    } else if (faceRatio > 0.001) { // Visage > 0.1% de l'image
      sizeQuality = Math.min(0.8, faceRatio * 800);
    } else { // Très petit visage
      sizeQuality = Math.min(0.6, faceRatio * 6000);
    }
    
    // Qualité de la résolution
    const resolutionQuality = this.assessImageResolution(imageElement);
    
    // Qualité de la confiance de détection
    const confidenceQuality = detection.score;
    
    // Qualité du flou (estimation basée sur la variance des landmarks)
    const blurQuality = this.assessBlurQuality(detection.landmarks);
    
    // Qualité des visages partiels
    const partialFaceQuality = this.assessPartialFaceQuality(detection.landmarks, detection.box);
    
    // Qualité globale adaptative
    const overallQuality = (
      descriptorQuality * 0.25 +
      sizeQuality * 0.20 +
      confidenceQuality * 0.20 +
      resolutionQuality * 0.15 +
      blurQuality * 0.10 +
      partialFaceQuality * 0.10
    );
    
    return {
      descriptorQuality,
      faceSize: faceArea,
      confidence: detection.score,
      resolution: resolutionQuality,
      overallQuality,
      sizeQuality,
      blurQuality,
      partialFaceQuality,
      faceRatio
    };
  }
  
  // 🔍 ÉVALUATION DE LA QUALITÉ DU FLOU
  assessBlurQuality(landmarks) {
    if (!landmarks || !landmarks.positions || landmarks.positions.length < 10) {
      return 0.5; // Qualité moyenne par défaut
    }
    
    // Calculer la variance des positions des landmarks
    const positions = landmarks.positions;
    const centerX = positions.reduce((sum, pos) => sum + pos.x, 0) / positions.length;
    const centerY = positions.reduce((sum, pos) => sum + pos.y, 0) / positions.length;
    
    const variance = positions.reduce((sum, pos) => {
      const dx = pos.x - centerX;
      const dy = pos.y - centerY;
      return sum + (dx * dx + dy * dy);
    }, 0) / positions.length;
    
    // Plus la variance est élevée, plus l'image est floue
    const blurScore = Math.min(1, Math.sqrt(variance) / 100);
    return Math.max(0.1, 1 - blurScore);
  }
  
  // 🎭 ÉVALUATION DE LA QUALITÉ DES VISAGES PARTIELS
  assessPartialFaceQuality(landmarks, box) {
    if (!landmarks || !landmarks.positions) {
      return 0.5;
    }
    
    const positions = landmarks.positions;
    const boxArea = box.width * box.height;
    
    // Compter les landmarks visibles (dans la boîte)
    let visibleLandmarks = 0;
    for (const pos of positions) {
      if (pos.x >= box.x && pos.x <= box.x + box.width &&
          pos.y >= box.y && pos.y <= box.y + box.height) {
        visibleLandmarks++;
      }
    }
    
    const visibilityRatio = visibleLandmarks / positions.length;
    
    // Qualité basée sur la visibilité des landmarks
    if (visibilityRatio >= 0.9) return 1.0; // Visage complet
    if (visibilityRatio >= 0.7) return 0.8; // Visage presque complet
    if (visibilityRatio >= 0.5) return 0.6; // Visage partiel
    if (visibilityRatio >= 0.3) return 0.4; // Visage très partiel
    return 0.2; // Visage très incomplet
  }

  // 🔍 RECHERCHE RAPIDE DANS L'INDEX GLOBAL
  async searchInIndex(referenceImg) {
    // Extraire le descripteur du visage de référence
    const analyzedFaces = await this.detectFaces(referenceImg);
    if (!analyzedFaces || analyzedFaces.length === 0) {
      throw new Error('Aucun visage détecté dans l\'image de référence');
    }
    const referenceDescriptor = analyzedFaces[0].descriptor;
    // Recherche rapide dans l'index via IPC
    const results = await window.electronAPI.searchFaceIndex(referenceDescriptor, 5);
    return results;
  }

  // Nouvelle fonction pour évaluer la qualité des landmarks
  assessLandmarkQuality(landmarks) {
    if (!landmarks || !landmarks.positions || landmarks.positions.length === 0) {
      return 0;
    }

    // Vérifier la présence de tous les points clés
    const keyPoints = {
      eyeLeft: [36, 37, 38, 39, 40, 41],
      eyeRight: [42, 43, 44, 45, 46, 47],
      nose: [27, 28, 29, 30, 31, 32, 33, 34, 35],
      mouth: [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59],
      jawline: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
    };

    let qualityScores = [];

    // Vérifier chaque groupe de points
    for (const [feature, indices] of Object.entries(keyPoints)) {
      let validPoints = 0;
      for (const idx of indices) {
        if (landmarks.positions[idx] && 
            landmarks.positions[idx].x !== undefined && 
            landmarks.positions[idx].y !== undefined) {
          validPoints++;
        }
      }
      const featureQuality = validPoints / indices.length;
      qualityScores.push(featureQuality);
    }

    // Calculer la qualité moyenne
    const avgQuality = qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length;

    // Pénaliser si certaines caractéristiques sont manquantes
    const minFeatureQuality = Math.min(...qualityScores);
    
    return Math.min(avgQuality, minFeatureQuality * 1.2);
  }
}

// Instance singleton
const faceRecognitionEngine = new FaceRecognitionEngine();
export default faceRecognitionEngine; 