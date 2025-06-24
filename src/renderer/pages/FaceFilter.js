import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { 
  Smile, 
  Play, 
  Pause, 
  Settings, 
  Download,
  Eye,
  Users,
  Zap,
  Brain,
  Target,
  Activity,
  UserCheck,
  Filter,
  CheckCircle,
  AlertCircle,
  Loader,
  EyeOff,
  BarChart3,
  Shield,
  Clock
} from 'lucide-react';
import { useAppStore } from '../store/appStore';

const FaceFilterContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #3a3a3a;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Button = styled.button`
  background: ${props => props.primary ? '#007AFF' : 'transparent'};
  color: ${props => props.primary ? '#ffffff' : '#b0b0b0'};
  border: ${props => props.primary ? 'none' : '1px solid #3a3a3a'};
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: ${props => props.primary ? '#0056CC' : '#3a3a3a'};
    color: #ffffff;
  }
  
  &:disabled {
    background: #3a3a3a;
    color: #888;
    cursor: not-allowed;
  }
`;

const Content = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
  overflow: hidden;
`;

const MainArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StatusCard = styled.div`
  background: #3a3a3a;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #4a4a4a;
`;

const StatusTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusText = styled.p`
  color: #b0b0b0;
  margin: 0;
  line-height: 1.5;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #4a4a4a;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 12px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #007AFF, #00C6FF);
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  overflow-y: auto;
  max-height: 400px;
`;

const PhotoCard = styled.div`
  background: #3a3a3a;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid ${props => props.hasFaces ? '#34C759' : 'transparent'};
`;

const PhotoImage = styled.div`
  width: 100%;
  height: 120px;
  background: ${props => props.src ? `url(${props.src})` : '#4a4a4a'};
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  font-size: 1.5rem;
`;

const FaceIndicator = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: #34C759;
  color: white;
  border-radius: 12px;
  padding: 4px 8px;
  font-size: 0.7rem;
  font-weight: 600;
`;

const PhotoInfo = styled.div`
  padding: 12px;
`;

const PhotoName = styled.div`
  font-size: 0.8rem;
  color: #ffffff;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PhotoStatus = styled.div`
  font-size: 0.7rem;
  color: ${props => props.processed ? '#34C759' : '#FF9500'};
`;

const Sidebar = styled.div`
  background: #3a3a3a;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #4a4a4a;
  height: fit-content;
`;

const SidebarSection = styled.div`
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SidebarTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ModelSelector = styled.div`
  margin-bottom: 16px;
`;

const ModelOption = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: ${props => props.selected ? '#007AFF' : '#4a4a4a'};
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.selected ? '#0056CC' : '#5a5a5a'};
  }
`;

const ModelInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const ModelName = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: #ffffff;
`;

const ModelDescription = styled.span`
  font-size: 0.7rem;
  color: #b0b0b0;
`;

const ModelStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.available ? '#34C759' : '#FF3B30'};
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Checkbox = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #ffffff;
  
  input {
    width: 16px;
    height: 16px;
    accent-color: #007AFF;
  }
`;

const SliderContainer = styled.div`
  margin-bottom: 16px;
`;

const SliderLabel = styled.label`
  display: block;
  font-size: 0.9rem;
  color: #ffffff;
  margin-bottom: 8px;
`;

const Slider = styled.input`
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: #4a4a4a;
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #007AFF;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #007AFF;
    cursor: pointer;
    border: none;
  }
`;

const SliderValue = styled.span`
  font-size: 0.8rem;
  color: #b0b0b0;
  margin-left: 8px;
`;

const SettingItem = styled.div`
  margin-bottom: 12px;
`;

const SettingLabel = styled.label`
  display: block;
  font-size: 0.9rem;
  color: #b0b0b0;
  margin-bottom: 4px;
`;

const SettingInput = styled.input`
  width: 100%;
  background: #4a4a4a;
  border: 1px solid #5a5a5a;
  border-radius: 6px;
  padding: 8px 12px;
  color: #ffffff;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #007AFF;
  }
`;

const SettingSelect = styled.select`
  width: 100%;
  background: #4a4a4a;
  border: 1px solid #5a5a5a;
  border-radius: 6px;
  padding: 8px 12px;
  color: #ffffff;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #007AFF;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const StatCard = styled.div`
  background: #4a4a4a;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #007AFF;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: #b0b0b0;
`;

function FaceFilter() {
  const {
    photos,
    faceRecognition,
    initializeFaceRecognition,
    addPhotos,
    updateFaceRecognitionConfig
  } = useAppStore();

  const [isInitializing, setIsInitializing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [filterExpression, setFilterExpression] = useState('');
  const [showOnlyWithFaces, setShowOnlyWithFaces] = useState(false);

  const canvasRef = useRef(null);

  // Modèles de détection disponibles (simulés pour l'interface)
  const detectionModels = [
    {
      id: 'tinyFaceDetector',
      name: 'TinyFaceDetector',
      description: 'Rapide et léger',
      available: true
    },
    {
      id: 'ssdMobilenetv1',
      name: 'SSD Mobilenet v1',
      description: 'Plus précis',
      available: true
    },
    {
      id: 'mtcnn',
      name: 'MTCNN',
      description: 'Très précis, plus lent',
      available: true
    },
    {
      id: 'tinyYolov2',
      name: 'Tiny YOLOv2',
      description: 'Bon compromis',
      available: true
    }
  ];

  // Initialiser la reconnaissance faciale au chargement
  useEffect(() => {
    if (!faceRecognition.isInitialized) {
      handleInitialize();
    }
  }, []);

  const handleInitialize = async () => {
    setIsInitializing(true);
    try {
      await initializeFaceRecognition();
        console.log('Reconnaissance faciale initialisée avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleAnalyzeAll = async () => {
    try {
      // Utiliser le service d'analyse ultra-performant via le store
      const filePaths = photos.map(photo => photo.filePath).filter(Boolean);
      
      if (filePaths.length > 0) {
        await addPhotos(filePaths, true);
      setProgress(100);
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
    }
  };

  const handlePhotoSelect = (photoId) => {
    setSelectedPhotos(prev => 
      prev.includes(photoId) 
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  const handleModelChange = (modelId) => {
    updateFaceRecognitionConfig({ detector: modelId });
  };

  const handleAnalysisOptionChange = (option, value) => {
    updateFaceRecognitionConfig({ [option]: value });
  };

  const handleDetectionOptionChange = (option, value) => {
    updateFaceRecognitionConfig({ [option]: value });
  };

  const getStatusText = () => {
    if (isInitializing) return 'Initialisation...';
    if (faceRecognition.isProcessing) return 'Analyse en cours...';
    if (faceRecognition.isInitialized) return 'Modèles chargés';
    return 'Non initialisé';
  };

  const getStatusType = () => {
    if (isInitializing || faceRecognition.isProcessing) return 'loading';
    if (faceRecognition.isInitialized) return 'loaded';
    return 'error';
  };

  // Filtrer les photos
  const filteredPhotos = photos.filter(photo => {
    if (showOnlyWithFaces && (!photo.faceAnalysis || !photo.faceAnalysis.faces || photo.faceAnalysis.faces.length === 0)) return false;
    if (filterExpression && (!photo.faceAnalysis || !photo.faceAnalysis.faces || !photo.faceAnalysis.faces.some(face => 
      face.expressions && face.expressions.type === filterExpression
    ))) return false;
    return true;
  });

  // Statistiques
  const photosWithFaces = photos.filter(photo => photo.faceAnalysis && photo.faceAnalysis.faces && photo.faceAnalysis.faces.length > 0);
  const totalFaces = photosWithFaces.reduce((sum, photo) => sum + (photo.faceAnalysis?.faces?.length || 0), 0);
  const uniqueExpressions = new Set();
  photosWithFaces.forEach(photo => {
    photo.faceAnalysis?.faces?.forEach(face => {
      if (face.expressions) {
        Object.keys(face.expressions).forEach(expression => {
          if (face.expressions[expression] > 0.5) {
            uniqueExpressions.add(expression);
          }
        });
      }
    });
  });
  const processingPhotos = photos.filter(p => p.processingStatus === 'processing').length;

  return (
    <FaceFilterContainer>
      <Header>
        <Title>
          <Smile size={24} />
          Filtres de reconnaissance faciale
        </Title>
        
        <Controls>
          {!isInitializing && faceRecognition.isInitialized ? (
            <Button primary onClick={handleAnalyzeAll}>
              <Play size={16} />
              Analyser toutes les photos
            </Button>
          ) : (
            <Button primary onClick={handleInitialize} disabled={isInitializing}>
              {isInitializing ? 'Initialisation...' : 'Initialiser les modèles'}
            </Button>
          )}
          
          <Button>
            <Settings size={16} />
            Paramètres
          </Button>
        </Controls>
      </Header>
      
      <Content>
        <MainArea>
          <StatusCard>
            <StatusTitle>
              <Zap size={18} />
              Statut de l'analyse
            </StatusTitle>
            <StatusText>
              {getStatusText()}
            </StatusText>
            {faceRecognition.isProcessing && (
              <ProgressBar>
                <ProgressFill progress={progress} />
              </ProgressBar>
            )}
          </StatusCard>
          
          <StatusCard>
            <StatusTitle>
              <Users size={18} />
              Photos avec visages détectés
            </StatusTitle>
            <PhotoGrid>
              {photos.slice(0, 8).map(photo => (
                <PhotoCard key={photo.id} hasFaces={photo.faces.length > 0}>
                  <PhotoImage src={photo.url}>
                    {!photo.url && '📷'}
                  </PhotoImage>
                  {photo.faces.length > 0 && (
                    <FaceIndicator>
                      {photo.faces.length} visage{photo.faces.length > 1 ? 's' : ''}
                    </FaceIndicator>
                  )}
                  <PhotoInfo>
                    <PhotoName>{photo.fileName}</PhotoName>
                    <PhotoStatus processed={photo.isProcessed}>
                      {photo.isProcessed ? 'Traité' : 'En attente'}
                    </PhotoStatus>
                  </PhotoInfo>
                </PhotoCard>
              ))}
            </PhotoGrid>
          </StatusCard>
        </MainArea>
        
        <Sidebar>
          <SidebarSection>
            <SidebarTitle>
              <Brain size={16} />
              Modèles de détection
            </SidebarTitle>
            <ModelSelector>
              {detectionModels.map(model => (
                <ModelOption
                  key={model.id}
                  selected={faceRecognition.detectionOptions.detector === model.id}
                  onClick={() => handleModelChange(model.id)}
                >
                  <ModelInfo>
                    <ModelName>{model.name}</ModelName>
                    <ModelDescription>{model.description}</ModelDescription>
                  </ModelInfo>
                  <ModelStatus>
                    <StatusDot available={model.available} />
                  </ModelStatus>
                </ModelOption>
              ))}
            </ModelSelector>
          </SidebarSection>

          <SidebarSection>
            <SidebarTitle>
              <Target size={16} />
              Options d'analyse
            </SidebarTitle>
            <CheckboxGroup>
              <Checkbox>
                <input
                  type="checkbox"
                  checked={faceRecognition.analysisOptions.withLandmarks}
                  onChange={(e) => handleAnalysisOptionChange('withLandmarks', e.target.checked)}
                />
                Points de repère
              </Checkbox>
              <Checkbox>
                <input
                  type="checkbox"
                  checked={faceRecognition.analysisOptions.withExpressions}
                  onChange={(e) => handleAnalysisOptionChange('withExpressions', e.target.checked)}
                />
                Expressions faciales
              </Checkbox>
              <Checkbox>
                <input
                  type="checkbox"
                  checked={faceRecognition.analysisOptions.withAgeAndGender}
                  onChange={(e) => handleAnalysisOptionChange('withAgeAndGender', e.target.checked)}
                />
                Âge et genre
              </Checkbox>
              <Checkbox>
                <input
                  type="checkbox"
                  checked={faceRecognition.analysisOptions.withDescriptors}
                  onChange={(e) => handleAnalysisOptionChange('withDescriptors', e.target.checked)}
                />
                Descripteurs (reconnaissance)
              </Checkbox>
            </CheckboxGroup>
          </SidebarSection>

          <SidebarSection>
            <SidebarTitle>
              <Activity size={16} />
              Paramètres de détection
            </SidebarTitle>
            <SliderContainer>
              <SliderLabel>
                Seuil de confiance
                <SliderValue>{faceRecognition.detectionOptions.minConfidence}</SliderValue>
              </SliderLabel>
              <Slider
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={faceRecognition.detectionOptions.minConfidence}
                onChange={(e) => handleDetectionOptionChange('minConfidence', parseFloat(e.target.value))}
              />
            </SliderContainer>
            <SliderContainer>
              <SliderLabel>
                Taille d'entrée
                <SliderValue>{faceRecognition.detectionOptions.inputSize}</SliderValue>
              </SliderLabel>
              <Slider
                type="range"
                min="128"
                max="512"
                step="32"
                value={faceRecognition.detectionOptions.inputSize}
                onChange={(e) => handleDetectionOptionChange('inputSize', parseInt(e.target.value))}
              />
            </SliderContainer>
          </SidebarSection>

          <SidebarSection>
            <SidebarTitle>
              <UserCheck size={16} />
              Statistiques
            </SidebarTitle>
            <StatsGrid>
              <StatCard>
                <StatValue>{photos.length}</StatValue>
                <StatLabel>Photos totales</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{photosWithFaces.length}</StatValue>
                <StatLabel>Avec visages</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{uniqueExpressions.size}</StatValue>
                <StatLabel>Expressions</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{faceRecognition.availableModels ? Object.values(faceRecognition.availableModels).filter(Boolean).length : 0}</StatValue>
                <StatLabel>Modèles chargés</StatLabel>
              </StatCard>
            </StatsGrid>
          </SidebarSection>
        </Sidebar>
      </Content>
    </FaceFilterContainer>
  );
}

export default FaceFilter; 