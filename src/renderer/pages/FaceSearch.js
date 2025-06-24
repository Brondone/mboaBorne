import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Search, Upload, X, CheckCircle, AlertCircle, Loader, Trash2, Download, Settings } from 'lucide-react';
import { useAppStore } from '../store/appStore';

// Composants stylisés de base
const Container = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 48px);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #b0b0b0;
  margin: 0;
`;

const SimulationBadge = styled.span`
  background: #FF9500;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: #2d2d2d;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #404040;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UploadArea = styled.div`
  border: 2px dashed #404040;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #1a1a1a;

  &:hover {
    border-color: #007AFF;
    background: #1a1a2a;
  }

  &.dragover {
    border-color: #007AFF;
    background: #1a1a2a;
    transform: scale(1.02);
  }
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 16px;
  color: #007AFF;
`;

const UploadText = styled.p`
  color: #b0b0b0;
  margin: 0;
  font-size: 1.1rem;
`;

const ReferencePreview = styled.div`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: #1a1a1a;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
`;

const ReferenceImage = styled.img`
  max-width: 100%;
  max-height: 200px;
  border-radius: 12px;
  object-fit: contain;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 59, 48, 0.9);
  border: none;
  color: white;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 59, 48, 1);
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  &.primary {
    background: #007AFF;
    color: white;

    &:hover {
      background: #0056CC;
    }

    &:disabled {
      background: #404040;
      cursor: not-allowed;
    }
  }

  &.secondary {
    background: #404040;
    color: white;

    &:hover {
      background: #505050;
    }
  }
`;

const ResultsSection = styled.div`
  background: #2d2d2d;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #404040;
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const ResultCard = styled.div`
  background: #1a1a1a;
  border-radius: 12px;
  padding: 12px;
  border: 1px solid #404040;
  position: relative;
  transition: all 0.2s ease;

  &:hover {
    border-color: #007AFF;
    transform: translateY(-2px);
  }
`;

const ResultImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 8px;
`;

const SimilarityBadge = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  background: ${props => {
    const similarity = props.similarity;
    if (similarity >= 0.8) return 'rgba(52, 199, 89, 0.9)';
    if (similarity >= 0.6) return 'rgba(255, 149, 0, 0.9)';
    return 'rgba(255, 59, 48, 0.9)';
  }};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

const SimilarityValue = styled.span`
  font-size: 0.9rem;
  font-weight: 700;
`;

const ConfidenceIndicator = styled.span`
  font-size: 0.7rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 1px 4px;
  border-radius: 6px;
  color: ${props => {
    const confidence = props.confidence;
    if (confidence >= 0.8) return '#34C759';
    if (confidence >= 0.6) return '#FF9500';
    return '#FF3B30';
  }};
`;

const ResultInfo = styled.div`
  margin-top: 8px;
`;

const ResultFileName = styled.div`
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ResultDetails = styled.div`
  color: #b0b0b0;
  font-size: 0.8rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SelectionArea = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #404040;
`;

const StatusMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #b0b0b0;
  font-size: 1.1rem;
`;

const StatusBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  background: ${props => props.isReady ? '#1a3a1a' : '#3a1a1a'};
  border: 1px solid ${props => props.isReady ? '#34C759' : '#FF3B30'};
  border-radius: 12px;
  margin-bottom: 24px;
`;

const StatusIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.isReady ? '#34C759' : '#FF3B30'};
  color: white;
`;

const StatusText = styled.span`
  color: #ffffff;
  font-weight: 500;
`;

const ErrorMessage = styled.div`
  background: #3a1a1a;
  border: 1px solid #FF3B30;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  color: #FF3B30;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  color: #007AFF;
`;

const ActionBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100vw;
  background: #232a36;
  border-top: 2px solid #007AFF;
  box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 16px 0;
  z-index: 100;
  transform: translateY(${props => props.visible ? '0' : '100%'});
  transition: transform 0.3s ease;
`;

const ActionButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  &.danger {
    background: #FF3B30;
    color: white;

    &:hover {
      background: #CC2E26;
    }
  }

  &.primary {
    background: #007AFF;
    color: white;

    &:hover {
      background: #0056CC;
    }
  }

  &.secondary {
    background: #404040;
    color: white;

    &:hover {
      background: #505050;
    }
  }
`;

const SelectionInfo = styled.div`
  color: #ffffff;
  font-weight: 500;
  margin-right: 16px;
`;

// Nouveau composant pour les paramètres de recherche
const SearchSettings = styled.div`
  background: #2d2d2d;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #404040;
  margin-bottom: 24px;
`;

const SettingsTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SliderContainer = styled.div`
  margin-bottom: 16px;
`;

const SliderLabel = styled.label`
  display: block;
  color: #b0b0b0;
  margin-bottom: 8px;
  font-size: 0.9rem;
`;

const SliderValue = styled.span`
  color: #007AFF;
  font-weight: 600;
  margin-left: 8px;
`;

const Slider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #404040;
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #007AFF;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: #0056CC;
      transform: scale(1.1);
    }
  }
  
  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #007AFF;
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
    
    &:hover {
      background: #0056CC;
      transform: scale(1.1);
    }
  }
`;

const SliderRange = styled.div`
  display: flex;
  justify-content: space-between;
  color: #808080;
  font-size: 0.8rem;
  margin-top: 4px;
`;

const OptimizationInfo = styled.div`
  background: #1a1a2a;
  border: 1px solid #404040;
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
`;

const OptimizationTitle = styled.h4`
  color: #007AFF;
  font-size: 0.9rem;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const OptimizationList = styled.ul`
  color: #b0b0b0;
  font-size: 0.8rem;
  margin: 0;
  padding-left: 16px;
`;

const OptimizationItem = styled.li`
  margin-bottom: 4px;
`;

const ResultsSummary = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  padding: 16px;
  background: #1a1a1a;
  border-radius: 12px;
  border: 1px solid #404040;
`;

const SummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

const SummaryLabel = styled.span`
  font-size: 0.8rem;
  color: #b0b0b0;
  font-weight: 500;
`;

const SummaryValue = styled.span`
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
`;

const DetailLabel = styled.span`
  font-size: 0.75rem;
  color: #b0b0b0;
  font-weight: 500;
`;

const DetailValue = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => {
    if (props.confidence !== undefined) {
      if (props.confidence >= 0.8) return '#34C759';
      if (props.confidence >= 0.6) return '#FF9500';
      return '#FF3B30';
    }
    if (props.quality !== undefined) {
      if (props.quality >= 0.8) return '#34C759';
      if (props.quality >= 0.6) return '#FF9500';
      return '#FF3B30';
    }
    if (props.score !== undefined) {
      if (props.score >= 0.8) return '#34C759';
      if (props.score >= 0.6) return '#FF9500';
      return '#FF3B30';
    }
    return '#ffffff';
  }};
`;

// Composant principal
const FaceSearch = () => {
  const { 
    photos, 
    selectedPhotos, 
    togglePhotoSelection, 
    selectAllPhotos, 
    deselectAllPhotos,
    searchSimilarFaces 
  } = useAppStore();
  
  // États locaux
  const [referenceImage, setReferenceImage] = useState(null);
  const [referenceImageUrl, setReferenceImageUrl] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [servicesReady, setServicesReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);
  
  // Nouveaux états pour les paramètres de recherche
  const [similarityThreshold, setSimilarityThreshold] = useState(0.3);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
  const [qualityThreshold, setQualityThreshold] = useState(0.3);
  const [maxResults, setMaxResults] = useState(50);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Initialisation des services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        setIsInitializing(true);
        setError(null);
        
        console.log('🔍 Initialisation des services de reconnaissance faciale...');
        
        // Version simplifiée - pas besoin d'initialisation complexe
        // Les services seront initialisés à la demande lors de la recherche
        setServicesReady(true);
        console.log('✅ Services de reconnaissance faciale prêts (Mode Simulation)');
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        setError('Impossible d\'initialiser les services de reconnaissance faciale');
        setServicesReady(false);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeServices();
  }, []);

  // Gestion du drag & drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageSelect(files[0]);
    }
  };

  // Gestion de la sélection d'image
  const handleImageSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setReferenceImage(file);
      const url = URL.createObjectURL(file);
      setReferenceImageUrl(url);
    }
  };

  // Supprimer l'image de référence
  const handleRemoveReference = () => {
    setReferenceImage(null);
    if (referenceImageUrl) {
      URL.revokeObjectURL(referenceImageUrl);
      setReferenceImageUrl(null);
    }
    setSearchResults([]);
  };

  // Gérer le changement du seuil de similarité
  const handleSimilarityThresholdChange = (event) => {
    const newThreshold = parseFloat(event.target.value);
    setSimilarityThreshold(newThreshold);
    console.log(`🎯 Seuil de similarité ajusté à: ${(newThreshold * 100).toFixed(1)}%`);
  };

  const handleConfidenceThresholdChange = (event) => {
    const newThreshold = parseFloat(event.target.value);
    setConfidenceThreshold(newThreshold);
    console.log(`🎯 Seuil de confiance ajusté à: ${(newThreshold * 100).toFixed(1)}%`);
  };

  const handleQualityThresholdChange = (event) => {
    const newThreshold = parseFloat(event.target.value);
    setQualityThreshold(newThreshold);
    console.log(`🎯 Seuil de qualité ajusté à: ${(newThreshold * 100).toFixed(1)}%`);
  };

  const handleMaxResultsChange = (event) => {
    const newMax = parseInt(event.target.value);
    setMaxResults(newMax);
    console.log(`🎯 Nombre maximum de résultats ajusté à: ${newMax}`);
  };

  // Recherche faciale améliorée avec seuil personnalisé et fiabilité
  const handleSearch = async () => {
    if (!referenceImage) {
      setError('Veuillez sélectionner une image de référence');
      return;
    }

    setIsSearching(true);
    setSearchResults([]);
    setError(null);
    
    try {
      console.log('🔍 Début de la recherche faciale avec fiabilité améliorée...');
      console.log(`🎯 Seuil de similarité: ${(similarityThreshold * 100).toFixed(1)}%`);
      console.log(`📸 Image de référence:`, referenceImage);
      console.log(`📊 Nombre de photos dans la galerie:`, photos.length);
      console.log(`🔍 Photos avec analyse faciale:`, photos.filter(p => p.faceAnalysis?.faces?.length > 0).length);
      
      // Utiliser le service ultra-performant pour la recherche
      const searchResults = await searchSimilarFaces(referenceImageUrl, {
        similarityThreshold,
        confidenceThreshold,
        qualityThreshold,
        maxResults,
        progressCallback: (progress) => {
          console.log(`📊 Progression: ${progress}%`);
        }
      });
      
      console.log(`✅ Recherche terminée : ${searchResults.results?.length || 0} résultat(s) fiables trouvé(s)`);
      console.log(`📋 Résultats détaillés:`, searchResults);
      setSearchResults(searchResults.results || []);
      
    } catch (error) {
      console.error('❌ Erreur lors de la recherche:', error);
      setError(`Erreur lors de la recherche : ${error.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  // Gestion de la sélection des résultats
  const handleToggleResultSelection = (photoId) => {
    togglePhotoSelection(photoId);
  };

  // Sélectionner tous les résultats
  const handleSelectAllResults = () => {
    selectAllPhotos();
  };

  // Désélectionner tous les résultats
  const handleDeselectAllResults = () => {
    deselectAllPhotos();
  };

  // Supprimer les photos sélectionnées
  const handleDeleteSelected = () => {
    if (selectedPhotos.length === 0) return;
    
    const photoNames = selectedPhotos.map(id => {
      const result = searchResults.find(r => r.id === id);
      return result ? result.fileName : 'Photo inconnue';
    }).join(', ');
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedPhotos.length} photo(s) ?\n\nPhotos : ${photoNames}`)) {
      // Ici on pourrait ajouter la logique de suppression
      console.log('Suppression des photos:', selectedPhotos);
      deselectAllPhotos();
    }
  };

  // Exporter les photos sélectionnées
  const handleExportSelected = async () => {
    if (selectedPhotos.length === 0) return;
    
    try {
      const selectedFilePaths = searchResults
        .filter(result => selectedPhotos.includes(result.id))
        .map(result => result.path);
        
      if (selectedFilePaths.length === 0) {
        alert('Aucune photo sélectionnée.');
        return;
      }
      
      // Utiliser l'API Electron pour sélectionner un dossier
      if (window.electronAPI) {
        const result = await window.electronAPI.selectDirectory();
        if (result) {
          const copyResult = await window.electronAPI.copyFiles(selectedFilePaths, result);
          if (copyResult.success) {
            alert('Export terminé !');
            deselectAllPhotos();
          } else {
            alert('Erreur lors de l\'export');
          }
        }
      } else {
        alert('L\'export n\'est disponible qu\'en mode application Electron.');
      }
    } catch (error) {
      alert('Erreur lors de l\'export : ' + error.message);
    }
  };

  return (
    <Container>
      <Header>
        <Title>🔍 Recherche Faciale</Title>
        <Subtitle>Importez une photo de référence pour trouver des visages similaires</Subtitle>
        {/* <SimulationBadge>
          🎭 Mode Simulation - Résultats simulés pour démonstration
        </SimulationBadge> */}
      </Header>

      {/* Barre de statut des services */}
      <StatusBar isReady={servicesReady}>
        <StatusIcon isReady={servicesReady}>
          {isInitializing ? <Loader size={20} /> : servicesReady ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
        </StatusIcon>
        <StatusText>
          {isInitializing 
            ? 'Initialisation des services...' 
            : servicesReady 
              ? 'Services de reconnaissance faciale prêts' 
              : 'Services de reconnaissance faciale non disponibles'
          }
        </StatusText>
      </StatusBar>

      {/* Message d'erreur */}
      {error && (
        <ErrorMessage>
          <AlertCircle size={20} />
          {error}
        </ErrorMessage>
      )}

      {/* Section Paramètres de Recherche */}
      <SearchSettings>
        <SettingsTitle>
          <Settings size={20} />
          Paramètres de Recherche
        </SettingsTitle>
        
        <SliderContainer>
          <SliderLabel>
            Seuil de Similarité
            <SliderValue>{(similarityThreshold * 100).toFixed(1)}%</SliderValue>
          </SliderLabel>
          <Slider
            type="range"
            min="0.1"
            max="0.9"
            step="0.05"
            value={similarityThreshold}
            onChange={handleSimilarityThresholdChange}
          />
          <SliderRange>
            <span>10% (Plus strict)</span>
            <span>90% (Plus permissif)</span>
          </SliderRange>
        </SliderContainer>
      </SearchSettings>

      <MainGrid>
        {/* Section Image de Référence */}
        <Section>
          <SectionTitle>
            <Upload size={20} />
            Image de Référence
          </SectionTitle>
          
          {!referenceImage ? (
            <UploadArea
              className={isDragging ? 'dragover' : ''}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input').click()}
            >
              <UploadIcon>📷</UploadIcon>
              <UploadText>
                Glissez-déposez une image ici<br />
                ou cliquez pour sélectionner
              </UploadText>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleImageSelect(e.target.files[0])}
              />
            </UploadArea>
          ) : (
            <ReferencePreview>
              <ReferenceImage src={referenceImageUrl} alt="Référence" />
              <RemoveButton onClick={handleRemoveReference}>
                <X size={16} />
              </RemoveButton>
            </ReferencePreview>
          )}

          <Button
            className="primary"
            onClick={handleSearch}
            disabled={!referenceImage || isSearching}
          >
            {isSearching ? (
              <>
                <Loader size={16} />
                Recherche en cours...
              </>
            ) : (
              <>
                <Search size={16} />
                Lancer la Recherche
              </>
            )}
          </Button>
        </Section>

        {/* Section Résultats */}
        <Section>
          <SectionTitle>
            <Search size={20} />
            Résultats de Recherche
          </SectionTitle>
          
          {isSearching ? (
            <LoadingSpinner>
              <Loader size={20} />
              Analyse des visages en cours...
            </LoadingSpinner>
          ) : searchResults.length > 0 ? (
            <>
              <ResultsSummary>
                <SummaryItem>
                  <SummaryLabel>Résultats trouvés:</SummaryLabel>
                  <SummaryValue>{searchResults.length}</SummaryValue>
                </SummaryItem>
                <SummaryItem>
                  <SummaryLabel>Moyenne confiance:</SummaryLabel>
                  <SummaryValue>
                    {((searchResults.reduce((sum, r) => sum + r.confidence, 0) / searchResults.length) * 100).toFixed(1)}%
                  </SummaryValue>
                </SummaryItem>
                <SummaryItem>
                  <SummaryLabel>Moyenne qualité:</SummaryLabel>
                  <SummaryValue>
                    {((searchResults.reduce((sum, r) => sum + r.quality.averageQuality, 0) / searchResults.length) * 100).toFixed(1)}%
                  </SummaryValue>
                </SummaryItem>
              </ResultsSummary>
              
              <ResultsGrid>
                {searchResults.map((result) => (
                  <ResultCard key={result.id}>
                    <ResultImage src={result.path || result.filePath} alt="Résultat" />
                    
                    {/* Badge de similarité avec indicateur de confiance */}
                    <SimilarityBadge similarity={result.similarity}>
                      <SimilarityValue>{(result.similarity * 100).toFixed(1)}%</SimilarityValue>
                      <ConfidenceIndicator confidence={result.confidence}>
                        {(result.confidence * 100).toFixed(0)}%
                      </ConfidenceIndicator>
                    </SimilarityBadge>
                    
                    <ResultInfo>
                      <ResultFileName>{result.fileName}</ResultFileName>
                      <ResultDetails>
                        <DetailItem>
                          <DetailLabel>Confiance:</DetailLabel>
                          <DetailValue confidence={result.confidence}>
                            {(result.confidence * 100).toFixed(1)}%
                          </DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>Qualité:</DetailLabel>
                          <DetailValue quality={result.quality.averageQuality}>
                            {(result.quality.averageQuality * 100).toFixed(1)}%
                          </DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>Distance:</DetailLabel>
                          <DetailValue>{(result.distance * 100).toFixed(1)}%</DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>Score final:</DetailLabel>
                          <DetailValue score={result.finalScore}>
                            {(result.finalScore * 100).toFixed(1)}%
                          </DetailValue>
                        </DetailItem>
                      </ResultDetails>
                    </ResultInfo>
                    
                    <SelectionArea>
                      <input
                        type="checkbox"
                        checked={selectedPhotos.includes(result.id)}
                        onChange={() => handleToggleResultSelection(result.id)}
                      />
                      <span>Sélectionner</span>
                    </SelectionArea>
                  </ResultCard>
                ))}
              </ResultsGrid>
            </>
          ) : (
            <StatusMessage>
              {referenceImage 
                ? "Cliquez sur 'Lancer la Recherche' pour commencer"
                : "Importez une image de référence pour commencer"
              }
            </StatusMessage>
          )}
        </Section>
      </MainGrid>

      {/* Barre d'actions contextuelle */}
      <ActionBar visible={selectedPhotos.length > 0}>
        <SelectionInfo>
          {selectedPhotos.length} photo(s) sélectionnée(s)
        </SelectionInfo>
        <ActionButton className="primary" onClick={handleSelectAllResults}>
          <CheckCircle size={16} />
          Tout sélectionner
        </ActionButton>
        <ActionButton className="secondary" onClick={handleDeselectAllResults}>
          <X size={16} />
          Tout désélectionner
        </ActionButton>
        <ActionButton className="danger" onClick={handleDeleteSelected}>
          <Trash2 size={16} />
          Supprimer ({selectedPhotos.length})
        </ActionButton>
        <ActionButton className="primary" onClick={handleExportSelected}>
          <Download size={16} />
          Exporter ({selectedPhotos.length})
        </ActionButton>
      </ActionBar>
    </Container>
  );
};

export default FaceSearch; 