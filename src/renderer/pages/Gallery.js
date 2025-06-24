import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/appStore';
import styled from 'styled-components';

const GalleryContainer = styled.div`
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Title = styled.h1`
  margin: 0;
  color: #333;
  font-size: 24px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  
  &.primary {
    background: #007bff;
    color: white;
    &:hover { background: #0056b3; }
  }
  
  &.danger {
    background: #dc3545;
    color: white;
    &:hover { background: #c82333; }
  }
  
  &.success {
    background: #28a745;
    color: white;
    &:hover { background: #218838; }
  }
  
  &.warning {
    background: #ffc107;
    color: #212529;
    &:hover { background: #e0a800; }
  }
  
  &.secondary {
    background: #6c757d;
    color: white;
    &:hover { background: #545b62; }
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 20px;
`;

const PhotoCard = styled.div`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.2s;
  cursor: pointer;
  border: 2px solid transparent;
  
  &.selected {
    border-color: #007bff;
    box-shadow: 0 4px 8px rgba(0,123,255,0.3);
  }
  
  &.favorite {
    border-color: #ffc107;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
`;

const PhotoImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
`;

const PhotoInfo = styled.div`
  padding: 10px;
`;

const PhotoName = styled.div`
  font-weight: 500;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PhotoMeta = styled.div`
  font-size: 12px;
  color: #666;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
  
  h3 {
    margin-bottom: 10px;
    color: #333;
  }
`;

const SelectionInfo = styled.div`
  background: #e3f2fd;
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export default function Gallery() {
  const {
    photos,
    selectedPhotos,
    addPhotos,
    removePhoto,
    removeSelectedPhotos,
    removeAllPhotos,
    togglePhotoSelection,
    selectAllPhotos,
    deselectAllPhotos,
    togglePhotoFavorite,
    toggleSelectedPhotosFavorite,
    markSelectedAsFavorite,
    removeSelectedFromFavorites,
    updatePhoto
  } = useAppStore();

  const [isImporting, setIsImporting] = useState(false);

  const selectedCount = selectedPhotos.length;
  const totalCount = photos.length;
  const favoriteCount = photos.filter(p => p.isFavorite).length;

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsImporting(true);
    try {
      const fileObjects = files.map(file => ({
        path: file.path,
        name: file.name,
        size: file.size,
        modified: file.lastModified
      }));
      
      await addPhotos(fileObjects);
      console.log('✅ Photos importées avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'import:', error);
    } finally {
      setIsImporting(false);
      event.target.value = ''; // Reset input
    }
  };

  const handlePhotoClick = (photoId) => {
    togglePhotoSelection(photoId);
  };

  const handlePhotoDoubleClick = (photoId) => {
    // Ouvrir la photo en plein écran (à implémenter)
    console.log('Ouvrir photo:', photoId);
  };

  const handleFavoriteClick = (e, photoId) => {
    e.stopPropagation();
    togglePhotoFavorite(photoId);
  };

  const filteredPhotos = useMemo(() => {
    return photos;
  }, [photos]);

  if (totalCount === 0) {
    return (
      <GalleryContainer>
        <Header>
          <Title>Galerie Photos</Title>
          <ActionButtons>
            <Button as="label" className="primary" htmlFor="file-input">
              {isImporting ? 'Importation...' : 'Importer des photos'}
            </Button>
            <input
              id="file-input"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </ActionButtons>
        </Header>
        
        <EmptyState>
          <h3>Aucune photo dans la galerie</h3>
          <p>Importez vos premières photos pour commencer</p>
          <Button as="label" className="primary" htmlFor="file-input-empty" style={{ marginTop: 15 }}>
            Importer des photos
          </Button>
          <input
            id="file-input-empty"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </EmptyState>
      </GalleryContainer>
    );
  }

  return (
    <GalleryContainer>
      <Header>
        <Title>
          Galerie Photos ({totalCount} photos{favoriteCount > 0 ? `, ${favoriteCount} favoris` : ''})
        </Title>
        <ActionButtons>
          <Button as="label" className="primary" htmlFor="file-input">
            {isImporting ? 'Importation...' : 'Importer'}
          </Button>
          <input
            id="file-input"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          {selectedCount > 0 && (
            <>
              <Button className="secondary" onClick={deselectAllPhotos}>
                Désélectionner tout
              </Button>
              <Button className="success" onClick={markSelectedAsFavorite}>
                Marquer favoris
              </Button>
              <Button className="warning" onClick={removeSelectedFromFavorites}>
                Retirer favoris
              </Button>
              <Button className="danger" onClick={removeSelectedPhotos}>
                Supprimer ({selectedCount})
              </Button>
            </>
          )}
          
          {selectedCount === 0 && (
            <>
              <Button className="secondary" onClick={selectAllPhotos}>
                Tout sélectionner
              </Button>
              <Button className="danger" onClick={removeAllPhotos}>
                Tout supprimer
              </Button>
            </>
          )}
        </ActionButtons>
      </Header>

      {selectedCount > 0 && (
        <SelectionInfo>
          <span>{selectedCount} photo(s) sélectionnée(s)</span>
          <Button className="secondary" size="small" onClick={deselectAllPhotos}>
            Désélectionner
          </Button>
        </SelectionInfo>
      )}

      <PhotoGrid>
        {filteredPhotos.map((photo) => (
          <PhotoCard
            key={photo.id}
            className={`${selectedPhotos.includes(photo.id) ? 'selected' : ''} ${photo.isFavorite ? 'favorite' : ''}`}
            onClick={() => handlePhotoClick(photo.id)}
            onDoubleClick={() => handlePhotoDoubleClick(photo.id)}
          >
            <PhotoImage src={photo.url} alt={photo.metadata?.fileName || 'Photo'} />
            <PhotoInfo>
              <PhotoName>{photo.metadata?.fileName || 'Photo'}</PhotoName>
              <PhotoMeta>
                {photo.metadata?.fileExtension?.toUpperCase()} • {(() => {
                  const rawDate = photo.metadata?.date;
                  if (!rawDate) return '';
                  const d = new Date(rawDate);
                  return isNaN(d) ? '' : d.toLocaleDateString();
                })()}
                {photo.isFavorite && ' • ⭐'}
              </PhotoMeta>
              <Button
                className={photo.isFavorite ? 'warning' : 'secondary'}
                size="small"
                onClick={(e) => handleFavoriteClick(e, photo.id)}
                style={{ marginTop: 5, fontSize: '12px', padding: '4px 8px' }}
              >
                {photo.isFavorite ? 'Retirer favori' : 'Ajouter favori'}
              </Button>
            </PhotoInfo>
          </PhotoCard>
        ))}
      </PhotoGrid>
    </GalleryContainer>
  );
} 