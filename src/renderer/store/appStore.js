import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import fileService from '../services/fileService';
import photoAnalysisService from '../services/PhotoAnalysisService';

// Structure d'une photo
const createPhoto = (filePath, metadata = {}, faceAnalysis = null) => {
  // Créer une URL pour l'affichage
  const imageUrl = filePath.startsWith('blob:') || filePath.startsWith('http') 
    ? filePath 
    : `file:///${filePath.replace(/\\/g, '/')}`;
    
  return {
  id: Math.random().toString(36).substr(2, 9),
    filePath, // Chemin original du fichier
    path: imageUrl, // URL pour l'affichage (compatible avec les résultats de recherche)
  fileName: filePath.split(/[\\/]/).pop(),
    url: imageUrl, // URL pour l'affichage (rétrocompatibilité)
  metadata: {
    size: metadata.size || 0,
    date: metadata.date || new Date(),
    width: metadata.width || 0,
    height: metadata.height || 0,
    camera: metadata.camera || null,
    settings: metadata.settings || {},
    gps: metadata.gps || null,
    orientation: metadata.orientation || 1,
    ...metadata
  },
    faceAnalysis: faceAnalysis || {
  faces: [],
      processingStatus: 'pending'
    },
  tags: [],
  isFavorite: false,
  isProcessed: false,
  processingStatus: 'pending' // pending, processing, completed, error
  };
};

// Store principal de l'application
export const useAppStore = create(
  persist(
    (set, get) => ({
      // État de base
      isInitialized: false,
      isLoading: false,
      sidebarOpen: true,
      theme: 'dark',
      
      // Progression d'importation
      importProgress: {
        isImporting: false,
        current: 0,
        total: 0,
        currentFileName: '',
        message: ''
      },
      
      // Photos
      photos: [],
      selectedPhotos: [],
      currentPhoto: null,
      
      // Filtres
      searchQuery: '',
      activeFilters: {
        faces: false,
        favorites: false,
        dateRange: null,
        tags: [],
        camera: null,
        expressions: []
      },
      
      // Reconnaissance faciale ultra-performante
      faceRecognition: {
        isInitialized: false,
        isLoading: true,
        error: null,
        isProcessing: false,
        status: 'initializing',
        config: {
          similarityThreshold: 0.6,
          confidenceThreshold: 0.6,
          qualityThreshold: 0.4,
          maxResults: 50
        },
        // Nouvelles propriétés pour le système ultra-performant
        engineStatus: {
          isReady: false,
          modelsLoaded: false,
          cacheSize: 0
        },
        searchResults: [],
        searchStats: {
          totalSearches: 0,
          averageSearchTime: 0,
          totalFacesDetected: 0,
          averageSimilarity: 0,
          averageConfidence: 0
        }
      },
      
      // Profils de visages
      faceProfiles: [],
      currentFaceProfile: null,
      
      // Actions pour les photos
      addPhotos: async (filePaths, autoAnalyze = true) => {
        set(state => ({ 
          isLoading: true,
          importProgress: {
            isImporting: true,
            current: 0,
            total: filePaths.length,
            currentFileName: '',
            message: 'Début de l\'importation...'
          }
        }));
        try {
          console.log('🔄 Début du traitement des fichiers (sans analyse faciale)...');
          // On n'analyse plus les photos à l'import
          const processedFiles = filePaths.map((filePath, index) => {
            let actualFilePath;
            if (typeof filePath === 'string') {
              actualFilePath = filePath;
            } else if (filePath && typeof filePath === 'object' && filePath.path) {
              actualFilePath = filePath.path;
            } else {
              console.warn('⚠️ filePath invalide:', filePath);
              actualFilePath = String(filePath);
            }
            const fileName = actualFilePath.split(/[\\/]/).pop() || 'unknown';
            // Pas d'analyse faciale ici
            return {
              filePath: actualFilePath,
              metadata: {
                fileName,
                fileExtension: fileName.split('.').pop()?.toLowerCase() || 'unknown',
                filePath: actualFilePath,
                size: 0,
                date: new Date(),
                type: 'image'
              },
              faceAnalysis: {
                faces: [],
                processingStatus: 'pending'
              },
              processingStatus: 'pending'
            };
          });
          console.log('✅ Fichiers importés (sans analyse):', processedFiles.length);
          const newPhotos = processedFiles.map(file => {
            const photo = createPhoto(file.filePath, file.metadata, file.faceAnalysis);
            return {
              ...photo,
              url: photo.url,
              path: photo.path,
              processingStatus: 'pending'
            };
          });
          set(state => ({
            photos: [...state.photos, ...newPhotos],
            isLoading: false,
            importProgress: {
              isImporting: false,
              current: 0,
              total: 0,
              currentFileName: '',
              message: `Importation terminée : ${newPhotos.length} photos ajoutées`
            }
          }));
          console.log('✅ Photos ajoutées au store (sans analyse):', newPhotos.length);
          return newPhotos;
        } catch (error) {
          console.error('❌ Erreur lors de l\'ajout des photos:', error);
          set(state => ({ 
            isLoading: false,
            importProgress: {
              isImporting: false,
              current: 0,
              total: 0,
              currentFileName: '',
              message: `Erreur lors de l'importation : ${error.message}`
            }
          }));
          throw error;
        }
      },
      
      removePhoto: (photoId) => {
        set(state => ({
          photos: state.photos.filter(photo => photo.id !== photoId),
          selectedPhotos: state.selectedPhotos.filter(id => id !== photoId)
        }));
      },
      
      removeSelectedPhotos: () => {
        set(state => {
          const selectedIds = state.selectedPhotos;
          return {
            photos: state.photos.filter(photo => !selectedIds.includes(photo.id)),
            selectedPhotos: []
          };
        });
      },
      
      removeAllPhotos: () => {
        set(state => ({
          photos: [],
          selectedPhotos: [],
          currentPhoto: null
        }));
      },
      
      updatePhoto: (photoId, updates) => {
        set(state => ({
          photos: state.photos.map(photo => 
            photo.id === photoId ? { ...photo, ...updates, isFavorite: updates.isFavorite ?? photo.isFavorite } : photo
          )
        }));
      },
      
      togglePhotoFavorite: (photoId) => {
        set(state => ({
          photos: state.photos.map(photo => 
            photo.id === photoId ? { ...photo, isFavorite: !photo.isFavorite } : photo
          )
        }));
      },
      
      toggleSelectedPhotosFavorite: () => {
        set(state => {
          const selectedIds = state.selectedPhotos;
          return {
            photos: state.photos.map(photo => 
              selectedIds.includes(photo.id) ? { ...photo, isFavorite: !photo.isFavorite } : photo
            )
          };
        });
      },
      
      markSelectedAsFavorite: () => {
        set(state => {
          const selectedIds = state.selectedPhotos;
          return {
            photos: state.photos.map(photo => 
              selectedIds.includes(photo.id) ? { ...photo, isFavorite: true } : photo
            )
          };
        });
      },
      
      removeSelectedFromFavorites: () => {
        set(state => {
          const selectedIds = state.selectedPhotos;
          return {
            photos: state.photos.map(photo => 
              selectedIds.includes(photo.id) ? { ...photo, isFavorite: false } : photo
            )
          };
        });
      },
      
      selectPhoto: (photoId) => {
        set(state => ({
          currentPhoto: state.photos.find(photo => photo.id === photoId) || null
        }));
      },

      togglePhotoSelection: (photoId) => {
        set(state => ({
          selectedPhotos: state.selectedPhotos.includes(photoId)
            ? state.selectedPhotos.filter(id => id !== photoId)
            : [...state.selectedPhotos, photoId]
        }));
      },
      
      selectAllPhotos: () => {
        set(state => ({
          selectedPhotos: state.photos.map(photo => photo.id)
        }));
      },
      
      deselectAllPhotos: () => {
        set(state => ({
          selectedPhotos: []
        }));
      },
      
      // Actions pour la reconnaissance faciale ultra-performante
      initializeFaceRecognition: async () => {
        try {
        set(state => ({
            faceRecognition: {
              ...state.faceRecognition,
            isLoading: true,
              status: 'initializing'
          }
        }));
        
          // Initialiser le service d'analyse
          await photoAnalysisService.initialize();
          
          // Obtenir le statut après initialisation
          const status = {
            isInitialized: photoAnalysisService.isInitialized,
            cacheSize: photoAnalysisService.faceDescriptorsCache.size
          };
          
            set(state => ({
            faceRecognition: {
              ...state.faceRecognition,
                isInitialized: true,
                isLoading: false,
              status: 'ready',
              engineStatus: status
              }
            }));
            
          console.log('✅ Reconnaissance faciale ultra-performante initialisée');
        } catch (error) {
          console.error('❌ Erreur lors de l\'initialisation:', error);
          set(state => ({
            faceRecognition: {
              ...state.faceRecognition,
              isLoading: false,
              status: 'error',
              error: error.message
            }
          }));
          throw error;
        }
      },
      
      // 🔍 RECHERCHE DE VISAGES SIMILAIRES
      searchSimilarFaces: async (referenceImage, options = {}) => {
        const { 
          onProgress, 
          similarityThreshold = 0.7, 
          maxResults = 10,
          searchQuery = '',
          filterFavorites = false,
          filterFaces = false,
          sortBy = 'similarity'
        } = options;
        
        console.log('🔍 Début de la recherche de visages similaires...');
        console.log('📊 Options de recherche:', options);
        
        try {
          const state = get();
          let photos = state.photos;
          console.log('📸 Photos dans la galerie:', photos.length);
          
          // Appliquer les filtres
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            photos = photos.filter(photo => 
              photo.fileName?.toLowerCase().includes(query) ||
              photo.metadata?.fileName?.toLowerCase().includes(query)
            );
            console.log(`🔍 Filtre texte "${searchQuery}": ${photos.length} photos`);
          }
          
          if (filterFavorites) {
            photos = photos.filter(photo => photo.isFavorite);
            console.log(`⭐ Filtre favoris: ${photos.length} photos`);
          }
          
          if (filterFaces) {
            photos = photos.filter(photo => photo.faceAnalysis?.faces?.length > 0);
            console.log(`👤 Filtre visages: ${photos.length} photos`);
          }
          
          // Filtrer les photos qui ont déjà été analysées
          const photosWithFaces = photos.filter(photo => photo.faceAnalysis);
          console.log('🔍 Photos avec analyse faciale:', photosWithFaces.length);
          
          // Recherche réelle avec analyse faciale
          console.log('🔍 Recherche réelle avec analyse faciale...');
          
          if (onProgress) {
            onProgress(0, photos.length, 'Analyse des visages...');
          }
          
          const results = await photoAnalysisService.findSimilarFaces(
            referenceImage, 
            photos, // Utiliser toutes les photos, pas seulement celles "analysées"
            onProgress
          );
          
          // Filtrer les résultats selon le seuil de similarité
          const filteredResults = results.filter(result => result.similarity >= similarityThreshold);
          
          console.log(`✅ Recherche réelle terminée: ${filteredResults.length} résultats (seuil: ${Math.round(similarityThreshold * 100)}%)`);
          return filteredResults;
          
              } catch (error) {
          console.error('❌ Erreur lors de la recherche:', error);
          throw error;
        }
      },
      
      updateFaceRecognitionConfig: (newConfig) => {
          set(state => ({
          faceRecognition: {
            ...state.faceRecognition,
            config: {
              ...state.faceRecognition.config,
              ...newConfig
            }
          }
        }));
      },
      
      clearFaceRecognitionCache: async () => {
        try {
          await photoAnalysisService.clearCache();
          
          set(state => ({
            faceRecognition: {
              ...state.faceRecognition,
              engineStatus: {
                ...state.faceRecognition.engineStatus,
                cacheSize: 0
              }
            }
          }));
          
          console.log('🧹 Cache de reconnaissance faciale vidé');
        } catch (error) {
          console.error('❌ Erreur lors du vidage du cache:', error);
        }
      },
      
      // Actions pour les filtres
      setSearchQuery: (query) => {
        set(state => ({
          searchQuery: query
        }));
      },
      
      setActiveFilters: (filters) => {
        set(state => ({
          activeFilters: {
            ...state.activeFilters,
            ...filters
          }
        }));
      },
      
      clearFilters: () => {
          set(state => ({
          searchQuery: '',
          activeFilters: {
            faces: false,
            favorites: false,
            dateRange: null,
            tags: [],
            camera: null,
            expressions: []
          }
        }));
      },
      
      // Actions pour l'interface
      toggleSidebar: () => {
        set(state => ({
          sidebarOpen: !state.sidebarOpen
        }));
      },
      
      setTheme: (theme) => {
        set(state => ({
          theme
        }));
      },
      
      // Actions pour les profils de visages
      addFaceProfile: (profile) => {
        set(state => ({
          faceProfiles: [...state.faceProfiles, profile]
        }));
      },
      
      updateFaceProfile: (profileId, updates) => {
        set(state => ({
          faceProfiles: state.faceProfiles.map(profile => 
            profile.id === profileId ? { ...profile, ...updates } : profile
          )
        }));
      },
      
      removeFaceProfile: (profileId) => {
        set(state => ({
          faceProfiles: state.faceProfiles.filter(profile => profile.id !== profileId)
        }));
      },
      
      setCurrentFaceProfile: (profile) => {
        set(state => ({
          currentFaceProfile: profile
        }));
      },
      
      // Getters pour les photos filtrées
      getFilteredPhotos: () => {
        const state = get();
        let filteredPhotos = state.photos;
        
        // Filtre par recherche textuelle
        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase();
          filteredPhotos = filteredPhotos.filter(photo => 
            photo.fileName.toLowerCase().includes(query) ||
            photo.metadata.camera?.toLowerCase().includes(query) ||
            photo.tags.some(tag => tag.toLowerCase().includes(query))
          );
        }
        
        // Filtre par visages
        if (state.activeFilters.faces) {
          filteredPhotos = filteredPhotos.filter(photo => 
            photo.faceAnalysis?.faces?.length > 0
          );
        }
        
        // Filtre par favoris
        if (state.activeFilters.favorites) {
          filteredPhotos = filteredPhotos.filter(photo => photo.isFavorite);
        }
        
        // Filtre par date
        if (state.activeFilters.dateRange) {
          const { start, end } = state.activeFilters.dateRange;
          filteredPhotos = filteredPhotos.filter(photo => {
            const photoDate = new Date(photo.metadata.date);
            return (!start || photoDate >= start) && (!end || photoDate <= end);
          });
        }
        
        // Filtre par tags
        if (state.activeFilters.tags.length > 0) {
          filteredPhotos = filteredPhotos.filter(photo => 
            state.activeFilters.tags.some(tag => photo.tags.includes(tag))
          );
        }
        
        // Filtre par appareil photo
        if (state.activeFilters.camera) {
          filteredPhotos = filteredPhotos.filter(photo => 
            photo.metadata.camera === state.activeFilters.camera
          );
        }
        
        return filteredPhotos;
      },
      
      // Getters pour les statistiques
      getPhotoStats: () => {
        const state = get();
        const photos = state.photos;
        
        return {
          total: photos.length,
          withFaces: photos.filter(p => p.faceAnalysis?.faces?.length > 0).length,
          favorites: photos.filter(p => p.isFavorite).length,
          processed: photos.filter(p => p.processingStatus === 'completed').length,
          errors: photos.filter(p => p.processingStatus === 'error').length
        };
      },
      
      getFaceStats: () => {
        const state = get();
        const photos = state.photos;
        
        const allFaces = photos.flatMap(photo => photo.faceAnalysis?.faces || []);
        
        return {
          totalFaces: allFaces.length,
          averageQuality: allFaces.length > 0 ? 
            allFaces.reduce((sum, face) => sum + (face.quality?.overallQuality || 0), 0) / allFaces.length : 0,
          averageAge: allFaces.length > 0 ? 
            allFaces.reduce((sum, face) => sum + (face.age || 0), 0) / allFaces.length : 0,
          genderDistribution: allFaces.reduce((acc, face) => {
            const gender = face.gender || 'unknown';
            acc[gender] = (acc[gender] || 0) + 1;
            return acc;
          }, {})
        };
      }
    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        photos: state.photos,
        selectedPhotos: state.selectedPhotos,
        faceRecognition: {
          config: state.faceRecognition.config,
          searchStats: state.faceRecognition.searchStats
        },
        faceProfiles: state.faceProfiles,
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        activeFilters: state.activeFilters
      })
    }
  )
);

// Exposer les fonctions de debug globalement pour les tests
if (typeof window !== 'undefined') {
  window.debugFaceServices = {
    forceInit: () => useAppStore.getState().forceInitializeServices(),
    checkStatus: () => useAppStore.getState().debugServicesStatus(),
    getState: () => useAppStore.getState(),
    analyzePhoto: (photoId) => useAppStore.getState().analyzePhotoFaces(photoId),
    testInit: async () => {
      console.log("🧪 TEST - Début du test d'initialisation");
      const result = await useAppStore.getState().initializeFaceServices();
      console.log("🧪 TEST - Résultat:", result);
      return result;
    },
    disable: () => useAppStore.getState().disableFaceServices(),
    enable: () => useAppStore.getState().enableFaceServices(),
    analyzeAll: () => useAppStore.getState().analyzeAllPendingPhotos(),
    stopAll: () => useAppStore.getState().stopAllAnalyses(),
    testStoreFunctions: () => {
      console.log("🧪 TEST - Test de toutes les fonctions du store");
      const store = useAppStore.getState();
      
      // Test des fonctions de base
      const functions = [
        'initializeFaceServices',
        'forceInitializeServices', 
        'checkServicesStatus',
        'disableFaceServices',
        'enableFaceServices',
        'analyzeAllPendingPhotos',
        'stopAllAnalyses'
      ];
      
      const results = {};
      functions.forEach(funcName => {
        try {
          const func = store[funcName];
          if (typeof func === 'function') {
            results[funcName] = '✅ Disponible';
          } else {
            results[funcName] = '❌ Non disponible';
          }
        } catch (error) {
          results[funcName] = `❌ Erreur: ${error.message}`;
        }
      });
      
      console.log("🧪 TEST - Résultats:", results);
      return results;
    }
  };
}

// Store pour les notifications
export const useNotificationStore = create((set, get) => ({
  notifications: [],
  
  addNotification: (notification) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      ...notification
    };
    
    set((state) => ({
      notifications: [...state.notifications, newNotification]
    }));
    
    // Auto-suppression après la durée spécifiée
    if (newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, newNotification.duration);
    }
    
    return id;
  },
  
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },
  
  clearNotifications: () => {
    set({ notifications: [] });
  }
}));

// Store pour l'historique des actions
export const useHistoryStore = create((set, get) => ({
  history: [],
  currentIndex: -1,
  maxHistory: 50,
  
  addAction: (action) => {
    const state = get();
    const newHistory = state.history.slice(0, state.currentIndex + 1);
    newHistory.push(action);
    
    // Limiter la taille de l'historique
    if (newHistory.length > state.maxHistory) {
      newHistory.shift();
    }
    
    set({
      history: newHistory,
      currentIndex: newHistory.length - 1
    });
  },
  
  undo: () => {
    const state = get();
    if (state.currentIndex > 0) {
      set({ currentIndex: state.currentIndex - 1 });
      return state.history[state.currentIndex - 1];
    }
    return null;
  },
  
  redo: () => {
    const state = get();
    if (state.currentIndex < state.history.length - 1) {
      set({ currentIndex: state.currentIndex + 1 });
      return state.history[state.currentIndex + 1];
    }
    return null;
  },
  
  canUndo: () => {
    const state = get();
    return state.currentIndex > 0;
  },
  
  canRedo: () => {
    const state = get();
    return state.currentIndex < state.history.length - 1;
  }
})); 