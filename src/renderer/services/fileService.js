// Service de fichiers simplifié et robuste
import photoAnalysisService from './PhotoAnalysisService';

class FileService {
  constructor() {
    this.servicesInitialized = false;
    this.supportedFormats = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  }

  // Initialiser les services de reconnaissance faciale
  async initializeServices() {
    if (this.servicesInitialized) {
      console.log('✅ Services déjà initialisés');
      return true;
    }

    try {
      console.log('🚀 Initialisation des services de reconnaissance faciale...');
      
      // Initialiser le service d'analyse ultra-performant
      await photoAnalysisService.initialize();
      
      this.servicesInitialized = true;
      console.log('✅ Services initialisés avec succès');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des services:', error);
      this.servicesInitialized = false;
      return false;
    }
  }

  // Vérifier si un fichier est une image supportée
  isImageFile(filePath) {
    const path = typeof filePath === 'string' ? filePath : filePath.path || filePath.name;
    
    if (!path) {
      console.warn('Chemin de fichier invalide:', filePath);
      return false;
    }
    
    const extension = path.split('.').pop().toLowerCase();
    return this.supportedFormats.includes(extension);
  }

  // Analyser une image pour détecter les visages
  async analyzeImageForFaces(imagePath) {
    try {
      console.log(`🔍 Analyse des visages pour ${imagePath}`);
      
      // Utiliser le service d'analyse ultra-performant
      const analysis = await photoAnalysisService.analyzePhoto(imagePath);
      
      return analysis.faces || [];
    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse des visages:', error);
      throw error;
    }
  }

  // Analyser les visages dans une image
  async analyzeFacesInImage(imageUrl, photoId) {
    try {
      console.log(`🔍 Analyse des visages pour ${photoId}...`);
      
      // Initialiser les services si nécessaire
      const servicesReady = await this.initializeServices();
      if (!servicesReady) {
        console.warn(`⚠️ Services non disponibles pour ${photoId}`);
        return {
          photoId,
          faces: [],
          processingStatus: 'error',
          error: 'Services non disponibles'
        };
      }
      
      // Utiliser le service d'analyse ultra-performant
      const analysis = await photoAnalysisService.analyzePhoto(imageUrl);
            
            console.log(`✅ Analyse terminée pour ${photoId}:`, analysis);
      
      return {
            photoId,
        faces: analysis.faces || [],
        processingStatus: analysis.processingStatus || 'completed'
      };
    } catch (error) {
      console.error(`❌ Erreur lors de l'analyse des visages pour ${photoId}:`, error);
      return {
        photoId,
        faces: [],
        processingStatus: 'error',
        error: error.message
      };
    }
  }

  // Créer une URL pour afficher l'image
  createImageUrl(filePath) {
    return new Promise((resolve) => {
      // Si c'est déjà une URL (blob: ou http:)
      if (filePath.startsWith('blob:') || filePath.startsWith('http:') || filePath.startsWith('https:')) {
        resolve(filePath);
        return;
      }
      
      if (window.electronAPI) {
        try {
          // Normaliser le chemin pour Electron
          const normalizedPath = filePath.replace(/\\/g, '/');
          
          // Créer une URL file:// compatible avec Electron
          let url;
          if (normalizedPath.startsWith('/')) {
            url = `file://${normalizedPath}`;
          } else {
            url = `file:///${normalizedPath}`;
          }
          
          console.log(`🔗 URL créée pour ${filePath}: ${url}`);
          resolve(url);
        } catch (error) {
          console.warn('Erreur création URL:', error);
          resolve(filePath);
        }
      } else {
        // Mode web - utiliser le chemin tel quel
        resolve(filePath);
      }
    });
  }

  // Obtenir la taille d'un fichier
  async getFileSize(filePath) {
    try {
      // Si c'est une URL temporaire, on ne peut pas obtenir la taille
      if (filePath.startsWith('blob:') || filePath.startsWith('http:') || filePath.startsWith('https:')) {
        return 0;
      }
      
      if (window.electronAPI && window.electronAPI.getFileSize) {
        return await window.electronAPI.getFileSize(filePath);
      } else {
        return 0;
      }
    } catch (error) {
      console.warn('Erreur taille fichier:', error);
      return 0;
    }
  }

  // Scanner un dossier pour trouver toutes les images
  async scanDirectory(directoryPath) {
    try {
      if (window.electronAPI && window.electronAPI.scanDirectory) {
        return await window.electronAPI.scanDirectory(directoryPath);
      } else {
        throw new Error('Scan de dossier non supporté en mode web');
      }
    } catch (error) {
      console.error('Erreur lors du scan du dossier:', error);
      return [];
    }
  }

  // Traiter un lot de fichiers avec analyse faciale
  async processFiles(filePaths, onProgress) {
    try {
      console.log('🔄 Début du traitement des fichiers...');
      
      const results = [];
      const totalFiles = filePaths.length;
      
      for (let i = 0; i < totalFiles; i++) {
        const fileItem = filePaths[i];
        
        try {
          // Gérer les différents types de fichiers (string, objet, etc.)
          let filePath, fileName;
          
          if (typeof fileItem === 'string') {
            // C'est un chemin de fichier
            filePath = fileItem;
            fileName = filePath.split(/[\\/]/).pop();
          } else if (fileItem && typeof fileItem === 'object') {
            // C'est un objet File ou un objet avec des propriétés
            if (fileItem.path) {
              filePath = fileItem.path;
              fileName = fileItem.name || filePath.split(/[\\/]/).pop();
            } else if (fileItem.name) {
              // C'est un objet File du drag & drop
              filePath = URL.createObjectURL(fileItem);
              fileName = fileItem.name;
            } else {
              console.warn(`⚠️ Objet de fichier invalide:`, fileItem);
              continue;
            }
          } else {
            console.warn(`⚠️ Type de fichier non supporté:`, typeof fileItem);
            continue;
          }
          
          console.log(`Traitement fichier: ${filePath}`);
          
          if (!this.isImageFile(filePath)) {
            console.log(`⚠️ Fichier ignoré (non supporté): ${filePath}`);
            continue;
          }
          
          // Créer l'URL de l'image
          const imageUrl = await this.createImageUrl(filePath);
          
          // Générer un ID unique pour la photo
          const photoId = `photo_${Date.now()}_${i}`;
          
          // Analyser les visages dans l'image
          const faceAnalysis = await this.analyzeFacesInImage(imageUrl, photoId);
          
          // Obtenir la taille du fichier
          let fileSize = 0;
          try {
            fileSize = await this.getFileSize(filePath);
          } catch (error) {
            console.warn(`⚠️ Impossible d'obtenir la taille pour ${filePath}:`, error.message);
          }
          
          // Créer l'objet photo
          const photo = {
            id: photoId,
            filePath: filePath,
            fileName: fileName,
            url: imageUrl,
            path: imageUrl,
            metadata: {
              size: fileSize,
              date: new Date()
            },
            faceAnalysis: faceAnalysis,
            processed: true
          };
          
          results.push(photo);
          
          // Mettre à jour la progression
          if (onProgress) {
            onProgress(i + 1, totalFiles, photo);
          }
          
        } catch (error) {
          console.error(`❌ Erreur lors du traitement de ${fileItem}:`, error);
          
          // Ajouter une entrée d'erreur
          const errorPhoto = {
            id: `error_${Date.now()}_${i}`,
            filePath: typeof fileItem === 'string' ? fileItem : 'unknown',
            fileName: typeof fileItem === 'string' ? fileItem.split(/[\\/]/).pop() : 'unknown',
            url: '',
            metadata: { size: 0, date: new Date() },
            faceAnalysis: {
              photoId: `error_${Date.now()}_${i}`,
              faces: [],
              processingStatus: 'error',
              error: error.message
            },
            processed: true
          };
          
          results.push(errorPhoto);
        }
      }
      
      console.log(`✅ Fichiers traités: ${results.length}`);
      return results;
    } catch (error) {
      console.error('❌ Erreur lors du traitement des fichiers:', error);
      throw error;
    }
  }

  // Extraire les métadonnées d'une image - VERSION SIMPLIFIÉE
  async extractMetadata(filePath) {
    try {
      // Version simplifiée sans exifr pour éviter les problèmes CSP
      return {
        date: new Date(),
        camera: null,
        settings: {},
        gps: null,
        dimensions: null,
        orientation: 1
      };
    } catch (error) {
      console.warn('Erreur métadonnées:', error.message);
      return {
        date: new Date(),
        camera: null,
        settings: {},
        gps: null,
        dimensions: null,
        orientation: 1
      };
    }
  }

  // Sauvegarder une image modifiée
  async saveImage(imageData, outputPath, options = {}) {
    try {
      if (window.electronAPI) {
        // En mode Electron, utiliser l'API de sauvegarde
        const result = await window.electronAPI.saveFile({
          title: 'Sauvegarder l\'image',
          defaultPath: outputPath,
          filters: [
            { name: 'Images', extensions: ['jpg', 'png', 'webp'] }
          ]
        });
        
        if (result) {
          // Ici vous pourriez implémenter la logique de sauvegarde
          // avec les options de qualité, format, etc.
          return result;
        }
      } else {
        // En mode web, télécharger le fichier
        const link = document.createElement('a');
        link.href = imageData;
        link.download = outputPath.split(/[\\/]/).pop();
        link.click();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw error;
    }
  }

  // Compresser une image
  async compressImage(imageUrl, quality = 0.8, maxWidth = 1920) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = document.createElement('img');
      
      img.onload = () => {
        try {
          // Calculer les nouvelles dimensions
          let { width, height } = img;
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Dessiner l'image redimensionnée
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convertir en blob avec compression
          canvas.toBlob(
            (blob) => {
              const url = URL.createObjectURL(blob);
              resolve({
                url,
                blob,
                width,
                height,
                size: blob.size
              });
            },
            'image/jpeg',
            quality
          );
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Impossible de charger l\'image'));
      };
      
      img.src = imageUrl;
    });
  }

  // Nettoyer les URLs blob
  revokeObjectURL(url) {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  // Indexer toutes les images d'un dossier (chemin absolu)
  async indexAllImagesInFolder(folderPath, progressCallback = null) {
    // 1. Récupérer la liste des fichiers images
    const files = await window.electronAPI.getFilesFromFolder(folderPath);
    let indexed = 0;
    for (const file of files) {
      try {
        // 2. Charger l'image et extraire le descripteur facial
        const img = await photoAnalysisService.loadImage(file);
        const faces = await photoAnalysisService.extractFaceDescriptors(img, file);
        if (faces && faces.length > 0) {
          // Ajout à l'index via IPC (déjà fait dans extractFaceDescriptors)
          indexed++;
        }
      } catch (e) {
        // Ignore les erreurs sur les fichiers non valides
      }
      if (progressCallback) {
        progressCallback(indexed, files.length);
      }
    }
    return indexed;
  }

  // Recherche ultra-rapide d'une image dans l'index
  async searchImageInIndex(imagePath, topN = 5) {
    const img = await photoAnalysisService.loadImage(imagePath);
    const faces = await photoAnalysisService.extractFaceDescriptors(img);
    if (faces && faces.length > 0) {
      const descriptor = faces[0].descriptor;
      const results = await window.electronAPI.searchFaceIndex(descriptor, topN);
      return results;
    }
    return [];
  }
}

export default new FileService(); 