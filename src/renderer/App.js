import React, { useState, useCallback, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Header from './components/Header';
import { useAppStore } from './store/appStore';
import styled, { keyframes, css } from 'styled-components';
import { CheckCircle, Image, Folder, Heart, Trash2, X, CheckSquare, Upload, Search, Users, AlertTriangle, Info, Camera, Sparkles, Settings, Eye } from 'lucide-react';
import fileService from './services/fileService';
import ImportProgress from './components/ImportProgress';
import Gallery from './pages/Gallery';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Loader = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid #4ECDC4;
  width: 50px;
  height: 50px;
  animation: ${spin} 1s linear infinite;
`;

const Spinner = styled.div`
  width: 12px;
  height: 12px;
  border: 2px solid rgba(78, 205, 196, 0.3);
  border-top: 2px solid #4ECDC4;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 40px;
`;

const PhotoCard = styled.div`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  aspect-ratio: 1 / 1;
  background-color: #2a2a3e;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  ${props => props.isSelected && css`
    transform: scale(0.95);
    box-shadow: 0 0 0 3px #4ECDC4, 0 10px 30px rgba(0, 0, 0, 0.4);
  `}

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    
    img {
      transform: scale(1.1);
    }
    
    /* Afficher les informations au survol */
    > div:last-child {
      opacity: 1 !important;
    }
    
    /* Afficher l'overlay au survol */
    > div:nth-last-child(2) {
      opacity: 1 !important;
    }
  }
`;

const SelectionOverlay = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  background: ${props => props.isSelected ? '#4ECDC4' : 'rgba(0, 0, 0, 0.4)'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  transition: all 0.3s ease;
  transform: ${props => props.isSelected ? 'scale(1)' : 'scale(0)'};
  
  ${PhotoCard}:hover & {
    transform: scale(1);
  }
`;

const FavoriteIndicator = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  color: #ff6b9d;
  transition: all 0.3s ease;
  transform: ${props => props.isFavorite ? 'scale(1)' : 'scale(0)'};
  opacity: ${props => props.isFavorite ? 1 : 0};
  
  ${PhotoCard}:hover & {
    transform: scale(1);
    opacity: 1;
  }
`;

const SimilarityIndicator = styled.div`
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  color: white;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: opacity 0.3s ease;
  opacity: 0;

  ${PhotoCard}:hover & {
    opacity: 1;
  }
`;

const PreviewButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0;
  transform: scale(0.8);
  z-index: 10;

  ${PhotoCard}:hover & {
    opacity: 1;
    transform: scale(1);
  }

  &:hover {
    background: rgba(78, 205, 196, 0.8);
    border-color: #4ECDC4;
    transform: scale(1.1);
  }
`;

const SelectionButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  background: ${props => props.isSelected ? 'rgba(78, 205, 196, 0.8)' : 'rgba(0, 0, 0, 0.6)'};
  backdrop-filter: blur(5px);
  border: 1px solid ${props => props.isSelected ? '#4ECDC4' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  opacity: 0;
  transform: scale(0.8);
  z-index: 10;

  ${PhotoCard}:hover & {
    opacity: 1;
    transform: scale(1);
  }

  &:hover {
    background: ${props => props.isSelected ? 'rgba(78, 205, 196, 0.9)' : 'rgba(255, 255, 255, 0.2)'};
    transform: scale(1.1);
  }
`;

const EmptyGalleryContainer = styled.div`
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 60px;
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;
  ${props => props.isDragOver && css`
    border-color: rgba(78, 205, 196, 0.8);
    background: rgba(78, 205, 196, 0.1);
  `}
`;

const ImportButton = styled.button`
  background: linear-gradient(135deg, #FF6B9D, #4ECDC4);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin: 0 10px;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }
`;

const SelectionActionBar = styled.div`
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 100;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${props => props.isActive ? 1 : 0};
  transform: ${props => props.isActive ? 'translateY(0) translateX(-50%)' : 'translateY(100px) translateX(-50%)'};
  pointer-events: ${props => props.isActive ? 'auto' : 'none'};
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 10px 16px;
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const StatusOverlay = styled.div.attrs({
  className: 'status-overlay'
})`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: opacity 0.3s ease;
  pointer-events: none;
`;

const NoFacesIndicator = styled.div`
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: white;
`;

// Page Galerie
const GalleryPage = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  
  const { 
    photos, 
    selectedPhotos, 
    addPhotos, 
    togglePhotoSelection, 
    deselectAllPhotos,
    selectAllPhotos,
    removeSelectedPhotos,
    toggleSelectedPhotosFavorite
  } = useAppStore();

  const handleFileSelect = async () => {
    try {
      const filePaths = await window.electronAPI.selectFiles();
      if (filePaths && filePaths.length > 0) {
        console.log('Fichiers sélectionnés:', filePaths);
        await addPhotos(filePaths);
      }
    } catch (error) {
      console.error('Erreur lors de la sélection des fichiers:', error);
      // Afficher un message d'erreur à l'utilisateur
      alert('Une erreur est survenue lors de la sélection des fichiers.');
    }
  };

  const handleFolderSelect = async () => {
    try {
      const folderPath = await window.electronAPI.selectFolder();
      if (folderPath) {
        console.log('Dossier sélectionné:', folderPath);
        const files = await window.electronAPI.getFilesFromFolder(folderPath);
        if (files && files.length > 0) {
          console.log('Fichiers trouvés dans le dossier:', files);
          await addPhotos(files);
        } else {
          alert('Aucune image trouvée dans le dossier sélectionné.');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sélection du dossier:', error);
      alert('Une erreur est survenue lors de la sélection du dossier.');
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      try {
        // Pour le drag & drop, on doit créer des URLs temporaires
        const filePaths = files.map(file => {
          // Si c'est un fichier local avec un chemin
          if (file.path) {
            return file.path;
          }
          // Sinon, créer une URL temporaire
          return URL.createObjectURL(file);
        });
        
        await addPhotos(filePaths, false);
      } catch (error) {
        console.error('Erreur lors du drop:', error);
        alert('Erreur lors de l\'import des fichiers');
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #16213E 100%)',
      padding: '120px 40px 40px',
      color: 'white'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '40px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        {photos.length === 0 ? (
          <EmptyGalleryContainer 
            isDragOver={isDragOver}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Image size={60} style={{ marginBottom: '20px', opacity: 0.7 }} />
            <h2 style={{ fontSize: '1.8rem', marginBottom: '15px', color: '#4ECDC4' }}>
              Votre galerie est vide
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '30px' }}>
              Importez vos premières photos pour commencer
            </p>
            <div>
              <ImportButton onClick={handleFileSelect}>
                <Image size={20} />
                Importer des photos
              </ImportButton>
              <ImportButton onClick={handleFolderSelect}>
                <Folder size={20} />
                Importer un dossier
              </ImportButton>
            </div>
            <p style={{ marginTop: '20px', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.5)' }}>
              Ou glissez-déposez vos photos ici
            </p>
          </EmptyGalleryContainer>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '700', background: 'linear-gradient(135deg, #45B7D1, #00D4FF)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  📸 Galerie
                </h1>
                <p style={{ fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.7)', marginTop: '5px' }}>
                  {photos.length} photo(s) dans votre collection
                </p>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <ImportButton onClick={handleFileSelect}>
                  <Image size={18} />
                  Ajouter
                </ImportButton>
                <ImportButton onClick={handleFolderSelect}>
                  <Folder size={18} />
                  Dossier
                </ImportButton>
              </div>
            </div>
            
            <PhotoGrid>
              {photos.map(photo => {
                const isSelected = selectedPhotos.includes(photo.id);
                const faceCount = photo.faceAnalysis?.faces?.length || 0;
                const hasFaces = faceCount > 0;
                
                return (
                  <PhotoCard 
                    key={photo.id}
                    isSelected={isSelected}
                    onClick={() => {
                      // Ouvrir l'image en plein écran
                      window.open(photo.path || photo.url, '_blank');
                    }}
                  >
                    <FavoriteIndicator isFavorite={photo.isFavorite}>
                      <Heart fill="currentColor" />
                    </FavoriteIndicator>
                    
                    {/* Indicateur de visages détectés */}
                    {hasFaces && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'rgba(78, 205, 196, 0.9)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        zIndex: 10
                      }}>
                        <Users size={12} />
                        {faceCount} visage{faceCount > 1 ? 's' : ''}
                      </div>
                    )}
                    
                    <SelectionButton 
                      isSelected={isSelected}
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePhotoSelection(photo.id);
                      }}
                      title={isSelected ? "Désélectionner" : "Sélectionner"}
                    >
                      <CheckCircle size={16} />
                    </SelectionButton>
                    
                    <img src={photo.path || photo.url} alt={photo.fileName} />
                    <SelectionOverlay isSelected={isSelected}>
                      <CheckCircle size={16} color="white" />
                    </SelectionOverlay>
                    
                    {/* Informations sur l'image */}
                    <div style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '0',
                      right: '0',
                      background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.8))',
                      padding: '20px 12px 12px',
                      color: 'white',
                      fontSize: '0.8rem',
                      opacity: 0,
                      transition: 'opacity 0.3s ease'
                    }}>
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                        {photo.fileName}
                      </div>
                      {hasFaces && (
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '2px',
                          fontSize: '0.7rem',
                          opacity: 0.9
                        }}>
                          {photo.faceAnalysis.faces.map((face, index) => (
                            <div key={index} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <span>Visage {index + 1}</span>
                              <span style={{
                                background: 'rgba(78, 205, 196, 0.3)',
                                padding: '2px 6px',
                                borderRadius: '8px',
                                fontSize: '0.65rem'
                              }}>
                                {Math.round(face.confidence * 100)}% confiance
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {photo.metadata?.size && (
                        <div style={{ 
                          fontSize: '0.7rem', 
                          opacity: 0.7, 
                          marginTop: '4px' 
                        }}>
                          {(photo.metadata.size / 1024 / 1024).toFixed(1)} MB
                        </div>
                      )}
                    </div>
                    
                    {/* Hover effect pour afficher les informations */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0, 0, 0, 0.3)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      pointerEvents: 'none'
                    }} />
                    
                    {photo.processingStatus === 'processing' && (
                      <StatusOverlay>
                        <Loader />
                      </StatusOverlay>
                    )}
                    {photo.processingStatus === 'error' && (
                      <StatusOverlay>
                        <AlertTriangle size={24} />
                      </StatusOverlay>
                    )}
                  </PhotoCard>
                )
              })}
            </PhotoGrid>
          </>
        )}
      </div>
      
      <SelectionActionBar isActive={selectedPhotos.length > 0}>
        <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', marginRight: '8px' }}>
          {selectedPhotos.length} photo(s) sélectionnée(s)
        </div>
        <ActionButton onClick={selectAllPhotos}>
          <CheckSquare size={16} />
          Tout sél.
        </ActionButton>
        <ActionButton onClick={deselectAllPhotos}>
          <X size={16} />
          Effacer
        </ActionButton>
        <ActionButton onClick={toggleSelectedPhotosFavorite}>
          <Heart size={16} />
          Favoris
        </ActionButton>
        <ActionButton onClick={removeSelectedPhotos} style={{background: '#FF6B9D50', borderColor: '#FF6B9D'}}>
          <Trash2 size={16} />
          Supprimer
        </ActionButton>
      </SelectionActionBar>
    </div>
  );
};

// Page Favoris
const FavoritesPage = () => {
  const { photos, selectedPhotos, togglePhotoSelection, selectAllPhotos, deselectAllPhotos, removeSelectedPhotos, toggleSelectedPhotosFavorite } = useAppStore(state => ({
    photos: state.photos.filter(p => p.isFavorite),
    selectedPhotos: state.selectedPhotos,
    togglePhotoSelection: state.togglePhotoSelection,
    selectAllPhotos: state.selectAllPhotos,
    deselectAllPhotos: state.deselectAllPhotos,
    removeSelectedPhotos: state.removeSelectedPhotos,
    toggleSelectedPhotosFavorite: state.toggleSelectedPhotosFavorite,
  }));

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #16213E 100%)',
      padding: '120px 40px 40px',
      color: 'white'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '40px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', background: 'linear-gradient(135deg, #FF6B9D, #FF8E53)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ❤️ Favoris
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'rgba(255, 255, 255, 0.7)', marginTop: '5px' }}>
              {photos.length} photo(s) favorite(s)
            </p>
          </div>
        </div>
        
        {photos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255, 255, 255, 0.6)' }}>
            <Heart size={60} style={{ marginBottom: '20px', opacity: 0.5 }} />
            <p>Aucune photo favorite pour le moment</p>
          </div>
        ) : (
          <PhotoGrid>
            {photos.map(photo => {
              const isSelected = selectedPhotos.includes(photo.id);
              return (
                <PhotoCard 
                  key={photo.id}
                  isSelected={isSelected}
                  onClick={() => {
                    // Ouvrir l'image en plein écran
                    window.open(photo.path || photo.url, '_blank');
                  }}
                >
                  <FavoriteIndicator isFavorite={photo.isFavorite}>
                    <Heart fill="currentColor" />
                  </FavoriteIndicator>
                  <SelectionButton 
                    isSelected={isSelected}
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePhotoSelection(photo.id);
                    }}
                    title={isSelected ? "Désélectionner" : "Sélectionner"}
                  >
                    <CheckCircle size={16} />
                  </SelectionButton>
                  <img src={photo.path || photo.url} alt={photo.fileName} />
                  <SelectionOverlay isSelected={isSelected}>
                    <CheckCircle size={16} color="white" />
                  </SelectionOverlay>
                </PhotoCard>
              )
            })}
          </PhotoGrid>
        )}
      </div>
      
      <SelectionActionBar isActive={selectedPhotos.length > 0}>
        <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', marginRight: '8px' }}>
          {selectedPhotos.length} photo(s) sélectionnée(s)
        </div>
        <ActionButton onClick={selectAllPhotos}>
          <CheckSquare size={16} />
          Tout sél.
        </ActionButton>
        <ActionButton onClick={deselectAllPhotos}>
          <X size={16} />
          Effacer
        </ActionButton>
        <ActionButton onClick={toggleSelectedPhotosFavorite}>
          <Heart size={16} />
          Favoris
        </ActionButton>
        <ActionButton onClick={removeSelectedPhotos} style={{background: '#FF6B9D50', borderColor: '#FF6B9D'}}>
          <Trash2 size={16} />
          Supprimer
        </ActionButton>
      </SelectionActionBar>
    </div>
  );
};

// Page Recherche Faciale (ancien design)
const FaceSearchPage = () => {
  const [referenceImg, setReferenceImg] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [isAutoInitializing, setIsAutoInitializing] = useState(false);
  const [searchProgress, setSearchProgress] = useState({ current: 0, total: 0, message: '' });
  const [similarityThreshold, setSimilarityThreshold] = useState(0.7); // Seuil de similarité (70% par défaut)
  
  const { 
    photos, 
    selectedPhotos, 
    togglePhotoSelection, 
    selectAllPhotos, 
    deselectAllPhotos, 
    removeSelectedPhotos, 
    toggleSelectedPhotosFavorite,
    initializeFaceRecognition,
    searchSimilarFaces,
    faceRecognition
  } = useAppStore(state => ({
    photos: state.photos,
    selectedPhotos: state.selectedPhotos,
    togglePhotoSelection: state.togglePhotoSelection,
    selectAllPhotos: state.selectAllPhotos,
    deselectAllPhotos: state.deselectAllPhotos,
    removeSelectedPhotos: state.removeSelectedPhotos,
    toggleSelectedPhotosFavorite: state.toggleSelectedPhotosFavorite,
    initializeFaceRecognition: state.initializeFaceRecognition,
    searchSimilarFaces: state.searchSimilarFaces,
    faceRecognition: state.faceRecognition
  }));
  
  const handleReferenceUpload = async () => {
    try {
      const filePaths = await window.electronAPI.selectFiles();
      if (filePaths && filePaths.length > 0) {
        const filePath = filePaths[0];
        const url = await fileService.createImageUrl(filePath);
        setReferenceImg(url);
      }
    } catch (error) {
      console.error("Erreur lors de l'import de l'image de référence :", error);
      alert("Une erreur est survenue lors de l'import de l'image de référence.");
    }
  };

  const handleSearch = async () => {
    if (!referenceImg) {
      alert('Veuillez d\'abord sélectionner une image de référence.');
      return;
    }

    try {
      setIsSearching(true);
      setSearchProgress({ current: 0, total: 0, message: 'Initialisation...' });
      setSearchResults([]);
      setSearchPerformed(false);

      console.log('🔍 Début de la recherche faciale...');
      
      // Initialiser la reconnaissance faciale si nécessaire
      if (!faceRecognition.isInitialized && initializeFaceRecognition) {
        setIsAutoInitializing(true);
        setSearchProgress({ current: 0, total: 0, message: 'Initialisation des services IA...' });
        await initializeFaceRecognition();
        setIsAutoInitializing(false);
      }

      // Lancer la recherche
      setSearchProgress({ current: 0, total: photos.length, message: 'Recherche en cours...' });
      const results = await searchSimilarFaces(referenceImg, {
        onProgress: (current, total, message) => {
          setSearchProgress({ current, total, message });
        },
        similarityThreshold: similarityThreshold,
        maxResults: 10,
        searchQuery: '',
        filterFavorites: false,
        filterFaces: false,
        sortBy: 'similarity'
      });

      setSearchResults(results);
      setSearchPerformed(true);
      console.log(`✅ Recherche terminée: ${results?.length || 0} résultats trouvés`);
      
    } catch (error) {
      console.error('❌ Erreur lors de la recherche:', error);
      alert(`Erreur lors de la recherche: ${error.message}`);
    } finally {
      setIsSearching(false);
      setSearchProgress({ current: 0, total: 0, message: '' });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #16213E 100%)',
      padding: '120px 40px 40px',
      color: 'white'
    }}>
      
      {/* Indicateur d'initialisation intelligente */}
      {isAutoInitializing && (
        <div style={{
          background: 'rgba(78, 205, 196, 0.15)',
          borderRadius: '8px',
          padding: '10px 15px',
          marginBottom: '15px',
          border: '1px solid rgba(78, 205, 196, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.9rem'
        }}>
          <Spinner />
          <span style={{ color: '#4ECDC4', fontWeight: '500' }}>
            ⚡ Initialisation intelligente des services IA...
          </span>
        </div>
      )}

      {/* Indicateur de mode démo */}
      <div style={{
        background: 'rgba(255, 193, 7, 0.15)',
        borderRadius: '8px',
        padding: '10px 15px',
        marginBottom: '15px',
        border: '1px solid rgba(255, 193, 7, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.9rem'
      }}>
        <span style={{ fontSize: '1.2rem' }}>🎯</span>
        <span style={{ color: '#FFC107', fontWeight: '500' }}>
          Mode démo actif - Résultats simulés pour démonstration
        </span>
        <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem' }}>
          (IA non disponible)
        </span>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '30px' }}>
        {/* Colonne de gauche: Recherche */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '30px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          alignSelf: 'start',
          height: 'fit-content'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
            <Camera size={24} color="#4ECDC4" />
            <h3 style={{ fontSize: '1.4rem', color: '#4ECDC4', margin: 0 }}>
              Recherche par visage
            </h3>
          </div>

          <div 
            onClick={handleReferenceUpload}
            style={{
              border: '2px dashed rgba(78, 205, 196, 0.5)',
              borderRadius: '16px',
              padding: '40px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              height: '250px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {referenceImg ? (
              <img 
                src={referenceImg} 
                alt="Image de référence" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: 1
                }}
              />
            ) : (
              <>
                <Upload size={40} style={{ marginBottom: '15px', opacity: 0.7 }} />
                <p style={{ fontSize: '1rem', marginBottom: '8px' }}>Importer une photo de référence</p>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Cliquez ou glissez-déposez une image
                </p>
              </>
            )}
            {isSearching && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '16px',
                zIndex: 2
              }}>
                <div style={{ textAlign: 'center' }}>
                  <Loader />
                  <p style={{ marginTop: '15px', fontSize: '0.9rem' }}>Analyse en cours...</p>
                </div>
              </div>
            )}
          </div>

          {referenceImg && !isSearching && (
            <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(78, 205, 196, 0.1)', borderRadius: '12px', border: '1px solid rgba(78, 205, 196, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Sparkles size={16} color="#4ECDC4" />
                <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#4ECDC4' }}>
                  Image de référence prête
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                La recherche s'effectue automatiquement dans votre galerie
              </p>
            </div>
          )}

          {/* Contrôle du seuil de similarité */}
          {referenceImg && !isSearching && (
            <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1rem' }}>🎯</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)' }}>
                  Seuil de similarité
                </span>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {Math.round(similarityThreshold * 100)}%
                </span>
              </div>
              
              <div style={{ position: 'relative', marginBottom: '8px' }}>
                <input
                  type="range"
                  min="0.1"
                  max="0.95"
                  step="0.05"
                  value={similarityThreshold}
                  onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '3px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    outline: 'none',
                    cursor: 'pointer',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(78, 205, 196, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                />
                <style>{`
                  input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #4ECDC4, #44A08D);
                    cursor: pointer;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
                  }
                  input[type="range"]::-moz-range-thumb {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #4ECDC4, #44A08D);
                    cursor: pointer;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
                  }
                `}</style>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                <span>10% (Plus de résultats)</span>
                <span>95% (Plus précis)</span>
              </div>
            </div>
          )}

          {referenceImg && !isSearching && (
            <button
              onClick={handleSearch}
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #4ECDC4, #44A08D)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(78, 205, 196, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                🔍 Lancer la recherche
                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>(Mode démo)</span>
              </span>
            </button>
          )}
        </div>

        {/* Colonne de droite: Résultats */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '30px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
            <Search size={24} color="#45B7D1" />
            <h3 style={{ fontSize: '1.4rem', color: '#45B7D1', margin: 0 }}>
              Résultats de recherche
            </h3>
          </div>
          
          {isSearching ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <div style={{ textAlign: 'center' }}>
                <Loader />
                <p style={{ marginTop: '15px', fontSize: '1rem' }}>Recherche en cours...</p>
                
                {/* Affichage de la progression */}
                {searchProgress.total > 0 && (
                  <div style={{ 
                    marginTop: '20px', 
                    padding: '15px', 
                    background: 'rgba(69, 183, 209, 0.1)', 
                    borderRadius: '12px', 
                    border: '1px solid rgba(69, 183, 209, 0.3)',
                    maxWidth: '400px'
                  }}>
                    <p style={{ fontSize: '0.9rem', marginBottom: '10px', color: 'rgba(255, 255, 255, 0.8)' }}>
                      {searchProgress.message}
                    </p>
                    <div style={{ 
                      background: 'rgba(255, 255, 255, 0.1)', 
                      borderRadius: '8px', 
                      height: '8px', 
                      overflow: 'hidden',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        background: 'linear-gradient(90deg, #45B7D1, #00D4FF)',
                        height: '100%',
                        width: `${(searchProgress.current / searchProgress.total) * 100}%`,
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                      {searchProgress.current} / {searchProgress.total} photos analysées
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : searchPerformed && searchResults.length > 0 ? (
            <>
              <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(69, 183, 209, 0.1)', borderRadius: '12px', border: '1px solid rgba(69, 183, 209, 0.3)' }}>
                <p style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                  <strong>{searchResults.length}</strong> photo(s) trouvée(s) avec des visages similaires
                </p>
                {/* Affichage des statistiques de recherche simulée */}
                {searchResults.length > 0 && searchResults[0].confidence && (
                  <div style={{ marginTop: '10px', display: 'flex', gap: '15px', fontSize: '0.8rem', flexWrap: 'wrap' }}>
                    <span style={{ color: '#4ECDC4', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      🎯 <strong>Confiance:</strong> {Math.round(searchResults[0].confidence * 100)}%
                    </span>
                    <span style={{ color: '#FFD93D', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      ⚡ <strong>Qualité:</strong> {Math.round(searchResults[0].quality * 100)}%
                    </span>
                    <span style={{ color: '#6BCF7F', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      📊 <strong>Mode:</strong> Résultats simulés
                    </span>
                    <span style={{ color: '#FF6B9D', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      ⏱️ <strong>Temps:</strong> ~500ms
                    </span>
                  </div>
                )}
              </div>
              <PhotoGrid>
                {searchResults.map(({photo, similarity, confidence, quality, metadata}) => {
                  const isSelected = selectedPhotos.includes(photo.id);
                  return (
                    <PhotoCard 
                      key={photo.id}
                      isSelected={isSelected}
                      onClick={() => {
                        // Ouvrir l'image en plein écran
                        window.open(photo.path || photo.url, '_blank');
                      }}
                    >
                      <FavoriteIndicator isFavorite={photo.isFavorite}>
                        <Heart fill="currentColor" />
                      </FavoriteIndicator>
                      <SelectionButton 
                        isSelected={isSelected}
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePhotoSelection(photo.id);
                        }}
                        title={isSelected ? "Désélectionner" : "Sélectionner"}
                      >
                        <CheckCircle size={16} />
                      </SelectionButton>
                      <img src={photo.path || photo.url} alt={photo.fileName} />
                      <SelectionOverlay isSelected={isSelected}>
                        <CheckCircle size={16} color="white" />
                      </SelectionOverlay>
                      <SimilarityIndicator>
                        <Info size={12} />
                        {`${(similarity * 100).toFixed(0)}%`}
                      </SimilarityIndicator>
                      {/* Informations supplémentaires pour les résultats simulés */}
                      {confidence && (
                        <div style={{
                          position: 'absolute',
                          bottom: '8px',
                          left: '8px',
                          right: '8px',
                          background: 'rgba(0, 0, 0, 0.8)',
                          borderRadius: '6px',
                          padding: '6px 8px',
                          fontSize: '0.7rem',
                          color: 'white',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span style={{ color: '#4ECDC4' }}>
                            🎯 {Math.round(confidence * 100)}%
                          </span>
                          <span style={{ color: '#FFD93D' }}>
                            ⚡ {Math.round(quality * 100)}%
                          </span>
                          {metadata && (
                            <span style={{ color: '#6BCF7F' }}>
                              👤 {metadata.age}ans
                            </span>
                          )}
                        </div>
                      )}
                    </PhotoCard>
                  )
                })}
              </PhotoGrid>
            </>
          ) : searchPerformed && searchResults.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255, 255, 255, 0.6)' }}>
              <Search size={48} style={{ marginBottom: '20px', opacity: 0.5 }} />
              <p style={{ fontSize: '1.1rem', marginBottom: '10px' }}>Aucun visage similaire trouvé</p>
              <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>Essayez avec une autre photo de référence</p>
              <div style={{ 
                padding: '15px', 
                background: 'rgba(255, 193, 7, 0.1)', 
                borderRadius: '12px', 
                border: '1px solid rgba(255, 193, 7, 0.3)',
                maxWidth: '400px',
                margin: '0 auto'
              }}>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                  💡 <strong>Conseil :</strong> Utilisez une photo claire avec un visage bien visible
                </p>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255, 255, 255, 0.6)' }}>
              <Camera size={48} style={{ marginBottom: '20px', opacity: 0.5 }} />
              <p style={{ fontSize: '1.1rem', marginBottom: '10px' }}>
                Prêt pour la recherche faciale
              </p>
              <p style={{ fontSize: '0.9rem', marginBottom: '20px' }}>
                Importez une photo de référence pour commencer
              </p>
              <div style={{ 
                padding: '15px', 
                background: 'rgba(78, 205, 196, 0.1)', 
                borderRadius: '12px', 
                border: '1px solid rgba(78, 205, 196, 0.3)',
                maxWidth: '400px',
                margin: '0 auto'
              }}>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                  🎯 <strong>Mode démo :</strong> Résultats simulés pour démonstration
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <SelectionActionBar isActive={selectedPhotos.length > 0}>
        <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', marginRight: '8px' }}>
          {selectedPhotos.length} photo(s) sélectionnée(s)
        </div>
        <ActionButton onClick={selectAllPhotos}>
          <CheckSquare size={16} />
          Tout sél.
        </ActionButton>
        <ActionButton onClick={deselectAllPhotos}>
          <X size={16} />
          Effacer
        </ActionButton>
        <ActionButton onClick={toggleSelectedPhotosFavorite}>
          <Heart size={16} />
          Favoris
        </ActionButton>
        <ActionButton onClick={removeSelectedPhotos} style={{background: '#FF6B9D50', borderColor: '#FF6B9D'}}>
          <Trash2 size={16} />
          Supprimer
        </ActionButton>
      </SelectionActionBar>
    </div>
  );
};

// Page Paramètres
const SettingsPage = () => (
  <div style={{
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #16213E 100%)',
    padding: '120px 40px 40px',
    color: 'white'
  }}>
    <div style={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      borderRadius: '24px',
      padding: '40px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
    }}>
      <h1 style={{
        fontSize: '3rem',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #45B7D1, #00D4FF)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        ⚙️ Paramètres
      </h1>
      <p style={{
        fontSize: '1.2rem',
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        Configurez votre expérience utilisateur
      </p>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {[
          { icon: '🎨', title: 'Apparence', desc: 'Thème et couleurs' },
          { icon: '🔒', title: 'Sécurité', desc: 'Confidentialité et accès' },
          { icon: '💾', title: 'Stockage', desc: 'Gestion des fichiers' },
          { icon: '🔧', title: 'Avancé', desc: 'Options techniques' }
        ].map((setting, index) => (
          <div key={index} style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '25px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '15px' }}>{setting.icon}</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{setting.title}</h3>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
              {setting.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Composant principal avec header intégré
function App() {
  const { 
    photos, 
    selectedPhotos, 
    addPhotos, 
    togglePhotoSelection, 
    deselectAllPhotos,
    selectAllPhotos,
    removeSelectedPhotos,
    toggleSelectedPhotosFavorite
  } = useAppStore();

  return (
    <Router>
      <div style={{ 
        background: 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #16213E 100%)',
        minHeight: '100vh',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
      }}>
        <Header />
        <Routes>
          <Route path="/" element={<GalleryPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/face-search" element={<FaceSearchPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
        <ImportProgress />
      </div>
    </Router>
  );
}

export default App; 