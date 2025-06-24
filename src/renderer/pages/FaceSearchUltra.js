// 🔍 PAGE DE RECHERCHE FACIALE ULTRA-PERFORMANTE
// Interface moderne et intuitive pour la recherche de visages similaires

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { 
  Search, Upload, X, CheckCircle, AlertCircle, Loader, 
  Trash2, Download, Settings, Eye, EyeOff, Target,
  BarChart3, Filter, Zap, Shield, Clock, Users
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import photoAnalysisService from '../services/PhotoAnalysisService';

// 🎨 COMPOSANTS STYLISÉS
const Container = styled.div`
  padding: 24px;
  max-width: 1400px;
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
  background: linear-gradient(135deg, #007AFF, #5856D6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #b0b0b0;
  margin: 0;
`;

const UltraBadge = styled.span`
  background: linear-gradient(135deg, #FF6B6B, #FFE66D);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: 12px;
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: #2d2d2d;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #404040;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
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
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: #007AFF;
    background: #1a1a2a;
    transform: translateY(-2px);
  }

  &.dragover {
    border-color: #007AFF;
    background: #1a1a2a;
    transform: scale(1.02);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 122, 255, 0.1), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
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
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
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
    transform: scale(1.1);
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
    background: linear-gradient(135deg, #007AFF, #5856D6);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0, 122, 255, 0.3);
    }

    &:disabled {
      background: #404040;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  }

  &.secondary {
    background: #404040;
    color: white;

    &:hover {
      background: #505050;
    }
  }

  &.success {
    background: linear-gradient(135deg, #34C759, #30D158);
    color: white;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(52, 199, 89, 0.3);
    }
  }
`;

const AdvancedSettings = styled.div`
  background: #1a1a1a;
  border-radius: 12px;
  padding: 20px;
  margin-top: 16px;
  border: 1px solid #404040;
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
`;

const SettingGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SettingLabel = styled.label`
  font-size: 0.9rem;
  color: #b0b0b0;
  font-weight: 500;
`;

const SettingValue = styled.span`
  font-size: 0.8rem;
  color: #007AFF;
  font-weight: 600;
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
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #007AFF;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.2);
    }
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #007AFF;
    cursor: pointer;
    border: none;
  }
`;

const ResultsSection = styled.div`
  background: #2d2d2d;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #404040;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #404040;
`;

const ResultsStats = styled.div`
  display: flex;
  gap: 24px;
  align-items: center;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #b0b0b0;
  font-size: 0.9rem;
`;

const StatValue = styled.span`
  color: #007AFF;
  font-weight: 600;
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
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    border-color: #007AFF;
  }

  &.selected {
    border-color: #34C759;
    background: rgba(52, 199, 89, 0.1);
  }
`;

const ResultImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 8px;
`;

const ResultInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ResultFileName = styled.div`
  font-size: 0.8rem;
  color: #ffffff;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ResultScore = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
`;

const SimilarityScore = styled.span`
  color: #34C759;
  font-weight: 600;
`;

const ConfidenceScore = styled.span`
  color: #FF9500;
  font-weight: 600;
`;

const QualityScore = styled.span`
  color: #5856D6;
  font-weight: 600;
`;

const SelectionCheckbox = styled.input`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 18px;
  height: 18px;
  accent-color: #34C759;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const LoadingContent = styled.div`
  background: #2d2d2d;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  border: 1px solid #404040;
`;

const ProgressBar = styled.div`
  width: 300px;
  height: 8px;
  background: #404040;
  border-radius: 4px;
  overflow: hidden;
  margin: 16px 0;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #007AFF, #5856D6);
  transition: width 0.3s ease;
  width: ${props => props.progress}%;
`;

// 🚀 COMPOSANT PRINCIPAL
const FaceSearchUltra = () => {
  const { photos, selectedPhotos, setSelectedPhotos } = useAppStore();
  
  // États locaux
  const [referenceImage, setReferenceImage] = useState(null);
  const [referenceImageUrl, setReferenceImageUrl] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [servicesReady, setServicesReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);
  
  // Paramètres de recherche avancés
  const [similarityThreshold, setSimilarityThreshold] = useState(0.6);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.6);
  const [qualityThreshold, setQualityThreshold] = useState(0.4);
  const [maxResults, setMaxResults] = useState(50);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  
  // États de progression
  const [searchProgress, setSearchProgress] = useState({
    current: 0,
    total: 0,
    message: ''
  });

  // 🔧 INITIALISATION
  useEffect(() => {
    const initializeServices = async () => {
      try {
        console.log('🚀 Initialisation des services ultra-performants...');
        
        await photoAnalysisService.initialize();
        
        setServicesReady(true);
        setIsInitializing(false);
        
        console.log('✅ Services ultra-performants initialisés');
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        setError(`Erreur d'initialisation: ${error.message}`);
        setIsInitializing(false);
      }
    };

    initializeServices();
  }, []);

  // 🎯 GESTION DES ÉVÉNEMENTS
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
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleImageSelect(files[0]);
    }
  };

  const handleImageSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setReferenceImage(file);
      setReferenceImageUrl(url);
      setError(null);
    } else {
      setError('Veuillez sélectionner une image valide');
    }
  };

  const handleRemoveReference = () => {
    if (referenceImageUrl) {
      URL.revokeObjectURL(referenceImageUrl);
    }
    setReferenceImage(null);
    setReferenceImageUrl(null);
    setSearchResults([]);
  };

  // ⚙️ GESTION DES PARAMÈTRES
  const handleSimilarityThresholdChange = (event) => {
    setSimilarityThreshold(parseFloat(event.target.value));
  };

  const handleConfidenceThresholdChange = (event) => {
    setConfidenceThreshold(parseFloat(event.target.value));
  };

  const handleQualityThresholdChange = (event) => {
    setQualityThreshold(parseFloat(event.target.value));
  };

  const handleMaxResultsChange = (event) => {
    setMaxResults(parseInt(event.target.value));
  };

  // 🔍 RECHERCHE ULTRA-PERFORMANTE
  const handleSearch = async () => {
    if (!referenceImage || !servicesReady) return;

    setIsSearching(true);
    setSearchResults([]);
    setError(null);
    
    try {
      console.log('🚀 Début de la recherche ultra-performante...');
      console.log(`🎯 Seuil de similarité: ${(similarityThreshold * 100).toFixed(1)}%`);
      console.log(`🎯 Seuil de confiance: ${(confidenceThreshold * 100).toFixed(1)}%`);
      console.log(`🎯 Seuil de qualité: ${(qualityThreshold * 100).toFixed(1)}%`);
      
      // Rechercher des visages similaires
      const searchResults = await photoAnalysisService.findSimilarFaces(
        referenceImageUrl,
        photos,
        {
          similarityThreshold,
          confidenceThreshold,
          minQuality: qualityThreshold,
          maxResults
        }
      );
      
      console.log(`✅ Recherche terminée: ${searchResults.results.length} résultat(s) trouvé(s)`);
      setSearchResults(searchResults.results);
      
    } catch (error) {
      console.error('❌ Erreur lors de la recherche:', error);
      setError(`Erreur lors de la recherche: ${error.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  // 🎯 GESTION DE LA SÉLECTION
  const handleToggleResultSelection = (photoId) => {
    setSelectedPhotos(prev => 
      prev.includes(photoId) 
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  const handleSelectAllResults = () => {
    const resultIds = searchResults.map(result => result.photoId);
    setSelectedPhotos(resultIds);
  };

  const handleDeselectAllResults = () => {
    setSelectedPhotos([]);
  };

  // 🗑️ SUPPRESSION
  const handleDeleteSelected = () => {
    // Implémenter la suppression des photos sélectionnées
    console.log('🗑️ Suppression des photos sélectionnées:', selectedPhotos);
  };

  // 📤 EXPORT
  const handleExportSelected = async () => {
    // Implémenter l'export des photos sélectionnées
    console.log('📤 Export des photos sélectionnées:', selectedPhotos);
  };

  // 🎨 RENDU
  if (isInitializing) {
    return (
      <LoadingOverlay>
        <LoadingContent>
          <Loader size={48} className="animate-spin" />
          <h2>Initialisation des services ultra-performants...</h2>
          <p>Chargement des modèles de reconnaissance faciale</p>
        </LoadingContent>
      </LoadingOverlay>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          Recherche Faciale Ultra-Performante
          <UltraBadge>ULTRA</UltraBadge>
        </Title>
        <Subtitle>
          Système de reconnaissance faciale avancé avec IA
        </Subtitle>
      </Header>

      <MainGrid>
        {/* Section de référence */}
        <Section>
          <SectionTitle>
            <Target size={20} />
            Image de Référence
          </SectionTitle>
          
          {!referenceImage ? (
            <UploadArea
              className={isDragging ? 'dragover' : ''}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <UploadIcon>📸</UploadIcon>
              <UploadText>
                Glissez-déposez une image ou cliquez pour sélectionner
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

          {/* Paramètres avancés */}
          <Button
            className="secondary"
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            style={{ marginTop: '16px' }}
          >
            <Settings size={16} />
            {showAdvancedSettings ? 'Masquer' : 'Afficher'} les paramètres avancés
          </Button>

          {showAdvancedSettings && (
            <AdvancedSettings>
              <SettingsGrid>
                <SettingGroup>
                  <SettingLabel>
                    Seuil de Similarité: <SettingValue>{(similarityThreshold * 100).toFixed(0)}%</SettingValue>
                  </SettingLabel>
                  <Slider
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={similarityThreshold}
                    onChange={handleSimilarityThresholdChange}
                  />
                </SettingGroup>

                <SettingGroup>
                  <SettingLabel>
                    Seuil de Confiance: <SettingValue>{(confidenceThreshold * 100).toFixed(0)}%</SettingValue>
                  </SettingLabel>
                  <Slider
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={confidenceThreshold}
                    onChange={handleConfidenceThresholdChange}
                  />
                </SettingGroup>

                <SettingGroup>
                  <SettingLabel>
                    Seuil de Qualité: <SettingValue>{(qualityThreshold * 100).toFixed(0)}%</SettingValue>
                  </SettingLabel>
                  <Slider
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={qualityThreshold}
                    onChange={handleQualityThresholdChange}
                  />
                </SettingGroup>

                <SettingGroup>
                  <SettingLabel>
                    Nombre Max de Résultats: <SettingValue>{maxResults}</SettingValue>
                  </SettingLabel>
                  <Slider
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={maxResults}
                    onChange={handleMaxResultsChange}
                  />
                </SettingGroup>
              </SettingsGrid>
            </AdvancedSettings>
          )}

          <Button
            className="primary"
            onClick={handleSearch}
            disabled={!referenceImage || isSearching || !servicesReady}
            style={{ marginTop: '16px', width: '100%' }}
          >
            {isSearching ? (
              <>
                <Loader size={16} className="animate-spin" />
                Recherche en cours...
              </>
            ) : (
              <>
                <Search size={16} />
                Lancer la Recherche Ultra-Performante
              </>
            )}
          </Button>

          {error && (
            <div style={{ 
              marginTop: '16px', 
              padding: '12px', 
              background: 'rgba(255, 59, 48, 0.1)', 
              border: '1px solid #FF3B30', 
              borderRadius: '8px',
              color: '#FF3B30',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </Section>

        {/* Section des statistiques */}
        <Section>
          <SectionTitle>
            <BarChart3 size={20} />
            Statistiques
          </SectionTitle>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <StatItem>
              <Users size={16} />
              Photos dans la galerie: <StatValue>{photos.length}</StatValue>
            </StatItem>
            
            <StatItem>
              <Shield size={16} />
              Services prêts: <StatValue>{servicesReady ? 'Oui' : 'Non'}</StatValue>
            </StatItem>
            
            <StatItem>
              <Target size={16} />
              Image de référence: <StatValue>{referenceImage ? 'Définie' : 'Aucune'}</StatValue>
            </StatItem>
            
            <StatItem>
              <Zap size={16} />
              Résultats trouvés: <StatValue>{searchResults.length}</StatValue>
            </StatItem>
            
            <StatItem>
              <CheckCircle size={16} />
              Photos sélectionnées: <StatValue>{selectedPhotos.length}</StatValue>
            </StatItem>
          </div>
        </Section>
      </MainGrid>

      {/* Section des résultats */}
      {searchResults.length > 0 && (
        <ResultsSection>
          <ResultsHeader>
            <div>
              <SectionTitle style={{ margin: 0 }}>
                <Search size={20} />
                Résultats de la Recherche
              </SectionTitle>
            </div>
            
            <ResultsStats>
              <StatItem>
                <Target size={16} />
                Trouvés: <StatValue>{searchResults.length}</StatValue>
              </StatItem>
              
              <StatItem>
                <CheckCircle size={16} />
                Sélectionnés: <StatValue>{selectedPhotos.length}</StatValue>
              </StatItem>
              
              <StatItem>
                <Clock size={16} />
                Temps: <StatValue>~{Math.round(searchResults.length * 0.1)}s</StatValue>
              </StatItem>
            </ResultsStats>
          </ResultsHeader>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <Button className="secondary" onClick={handleSelectAllResults}>
              <CheckCircle size={16} />
              Tout sélectionner
            </Button>
            
            <Button className="secondary" onClick={handleDeselectAllResults}>
              <X size={16} />
              Tout désélectionner
            </Button>
            
            <Button className="success" onClick={handleExportSelected} disabled={selectedPhotos.length === 0}>
              <Download size={16} />
              Exporter ({selectedPhotos.length})
            </Button>
            
            <Button className="secondary" onClick={handleDeleteSelected} disabled={selectedPhotos.length === 0}>
              <Trash2 size={16} />
              Supprimer ({selectedPhotos.length})
            </Button>
          </div>

          <ResultsGrid>
            {searchResults.map((result) => (
              <ResultCard
                key={result.photoId}
                className={selectedPhotos.includes(result.photoId) ? 'selected' : ''}
                onClick={() => handleToggleResultSelection(result.photoId)}
              >
                <SelectionCheckbox
                  type="checkbox"
                  checked={selectedPhotos.includes(result.photoId)}
                  onChange={() => handleToggleResultSelection(result.photoId)}
                  onClick={(e) => e.stopPropagation()}
                />
                
                <ResultImage src={result.path} alt={result.fileName} />
                
                <ResultInfo>
                  <ResultFileName>{result.fileName}</ResultFileName>
                  
                  <ResultScore>
                    <SimilarityScore>
                      {(result.similarity * 100).toFixed(0)}% sim
                    </SimilarityScore>
                    <ConfidenceScore>
                      {(result.confidence * 100).toFixed(0)}% conf
                    </ConfidenceScore>
                    <QualityScore>
                      {(result.quality.overallQuality * 100).toFixed(0)}% qual
                    </QualityScore>
                  </ResultScore>
                </ResultInfo>
              </ResultCard>
            ))}
          </ResultsGrid>
        </ResultsSection>
      )}

      {/* Overlay de chargement */}
      {isSearching && (
        <LoadingOverlay>
          <LoadingContent>
            <Loader size={48} className="animate-spin" />
            <h2>Recherche en cours...</h2>
            <p>{searchProgress.message}</p>
            {searchProgress.total > 0 && (
              <ProgressBar>
                <ProgressFill progress={(searchProgress.current / searchProgress.total) * 100} />
              </ProgressBar>
            )}
          </LoadingContent>
        </LoadingOverlay>
      )}
    </Container>
  );
};

export default FaceSearchUltra; 