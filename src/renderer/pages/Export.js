import React, { useState } from 'react';
import styled from 'styled-components';
import { useAppStore } from '../store/appStore';
import fileService from '../services/fileService';

const Container = styled.div`
  padding: 20px;
  height: 100vh;
  overflow-y: auto;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
  margin: 0;
`;

const ExportGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
`;

const Section = styled.div`
  background: ${props => props.theme.colors.card};
  padding: 25px;
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0 0 20px 0;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 8px;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const RangeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const Range = styled.input`
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: ${props => props.theme.colors.border};
  outline: none;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${props => props.theme.colors.primary};
    cursor: pointer;
  }
`;

const RangeValue = styled.span`
  min-width: 40px;
  text-align: center;
  font-weight: 600;
  color: ${props => props.theme.colors.primary};
`;

const Checkbox = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 0.9rem;
  color: ${props => props.theme.colors.text};
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: ${props => props.theme.colors.primary};
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.variant === 'primary' ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.variant === 'primary' ? 'white' : props.theme.colors.text};
  border: 1px solid ${props => props.variant === 'primary' ? 'transparent' : props.theme.colors.border};
  
  &:hover {
    background: ${props => props.variant === 'primary' ? props.theme.colors.primaryHover : props.theme.colors.hover};
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ProgressContainer = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: ${props => props.theme.colors.background};
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${props => props.theme.colors.border};
  border-radius: 4px;
  overflow: hidden;
  margin: 10px 0;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${props => props.theme.colors.primary};
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.card};
  padding: 15px;
  border-radius: 8px;
  text-align: center;
  border: 1px solid ${props => props.theme.colors.border};
`;

const StatNumber = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Export = () => {
  const { photos, selectedPhotos, getFilteredPhotos } = useAppStore();
  
  const [exportSettings, setExportSettings] = useState({
    format: 'jpg',
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080,
    preserveMetadata: true,
    includeFaces: false,
    watermark: false,
    watermarkText: 'Borne Gallery',
    watermarkPosition: 'bottom-right',
    watermarkOpacity: 0.7
  });
  
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStats, setExportStats] = useState({
    totalSize: 0,
    compressedSize: 0,
    savedSpace: 0
  });

  const photosToExport = selectedPhotos.length > 0 
    ? photos.filter(p => selectedPhotos.includes(p.id))
    : getFilteredPhotos();

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    
    try {
      let totalOriginalSize = 0;
      let totalCompressedSize = 0;
      
      for (let i = 0; i < photosToExport.length; i++) {
        const photo = photosToExport[i];
        
        // Calculer la taille originale
        totalOriginalSize += photo.metadata.size || 0;
        
        // Compresser l'image
        const compressed = await fileService.compressImage(
          photo.url || photo.filePath,
          exportSettings.quality,
          exportSettings.maxWidth
        );
        
        totalCompressedSize += compressed.size;
        
        // Mettre à jour le progrès
        const progress = ((i + 1) / photosToExport.length) * 100;
        setExportProgress(progress);
        
        // Simuler un délai pour voir le progrès
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Calculer les statistiques
      const savedSpace = totalOriginalSize - totalCompressedSize;
      setExportStats({
        totalSize: totalOriginalSize,
        compressedSize: totalCompressedSize,
        savedSpace
      });
      
      console.log('Export terminé !');
      
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Container>
      <Header>
        <Title>Export des Photos</Title>
        <Button 
          variant="primary" 
          onClick={handleExport}
          disabled={isExporting || photosToExport.length === 0}
        >
          {isExporting ? 'Export en cours...' : `Exporter ${photosToExport.length} photo(s)`}
        </Button>
      </Header>

      <Stats>
        <StatCard>
          <StatNumber>{photosToExport.length}</StatNumber>
          <StatLabel>Photos à exporter</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{formatFileSize(photosToExport.reduce((sum, p) => sum + (p.metadata.size || 0), 0))}</StatNumber>
          <StatLabel>Taille totale</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{selectedPhotos.length}</StatNumber>
          <StatLabel>Photos sélectionnées</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{exportSettings.format.toUpperCase()}</StatNumber>
          <StatLabel>Format d'export</StatLabel>
        </StatCard>
      </Stats>

      <ExportGrid>
        <Section>
          <SectionTitle>Paramètres de Format</SectionTitle>
          
          <FormGroup>
            <Label>Format d'export</Label>
            <Select 
              value={exportSettings.format}
              onChange={(e) => setExportSettings({...exportSettings, format: e.target.value})}
            >
              <option value="jpg">JPEG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label>Qualité de compression</Label>
            <RangeContainer>
              <Range 
                type="range" 
                min="0.1" 
                max="1" 
                step="0.1"
                value={exportSettings.quality}
                onChange={(e) => setExportSettings({...exportSettings, quality: parseFloat(e.target.value)})}
              />
              <RangeValue>{Math.round(exportSettings.quality * 100)}%</RangeValue>
            </RangeContainer>
          </FormGroup>
          
          <FormGroup>
            <Label>Largeur maximale (px)</Label>
            <Input 
              type="number"
              value={exportSettings.maxWidth}
              onChange={(e) => setExportSettings({...exportSettings, maxWidth: parseInt(e.target.value)})}
              min="100"
              max="4000"
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Hauteur maximale (px)</Label>
            <Input 
              type="number"
              value={exportSettings.maxHeight}
              onChange={(e) => setExportSettings({...exportSettings, maxHeight: parseInt(e.target.value)})}
              min="100"
              max="4000"
            />
          </FormGroup>
        </Section>

        <Section>
          <SectionTitle>Options Avancées</SectionTitle>
          
          <FormGroup>
            <Checkbox>
              <input 
                type="checkbox"
                checked={exportSettings.preserveMetadata}
                onChange={(e) => setExportSettings({...exportSettings, preserveMetadata: e.target.checked})}
              />
              Conserver les métadonnées EXIF
            </Checkbox>
          </FormGroup>
          
          <FormGroup>
            <Checkbox>
              <input 
                type="checkbox"
                checked={exportSettings.includeFaces}
                onChange={(e) => setExportSettings({...exportSettings, includeFaces: e.target.checked})}
              />
              Inclure les données de reconnaissance faciale
            </Checkbox>
          </FormGroup>
          
          <FormGroup>
            <Checkbox>
              <input 
                type="checkbox"
                checked={exportSettings.watermark}
                onChange={(e) => setExportSettings({...exportSettings, watermark: e.target.checked})}
              />
              Ajouter un filigrane
            </Checkbox>
          </FormGroup>
          
          {exportSettings.watermark && (
            <>
              <FormGroup>
                <Label>Texte du filigrane</Label>
                <Input 
                  type="text"
                  value={exportSettings.watermarkText}
                  onChange={(e) => setExportSettings({...exportSettings, watermarkText: e.target.value})}
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Position du filigrane</Label>
                <Select 
                  value={exportSettings.watermarkPosition}
                  onChange={(e) => setExportSettings({...exportSettings, watermarkPosition: e.target.value})}
                >
                  <option value="top-left">Haut-gauche</option>
                  <option value="top-right">Haut-droite</option>
                  <option value="bottom-left">Bas-gauche</option>
                  <option value="bottom-right">Bas-droite</option>
                  <option value="center">Centre</option>
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label>Opacité du filigrane</Label>
                <RangeContainer>
                  <Range 
                    type="range" 
                    min="0.1" 
                    max="1" 
                    step="0.1"
                    value={exportSettings.watermarkOpacity}
                    onChange={(e) => setExportSettings({...exportSettings, watermarkOpacity: parseFloat(e.target.value)})}
                  />
                  <RangeValue>{Math.round(exportSettings.watermarkOpacity * 100)}%</RangeValue>
                </RangeContainer>
              </FormGroup>
            </>
          )}
        </Section>
      </ExportGrid>

      {isExporting && (
        <ProgressContainer>
          <div>Export en cours... {Math.round(exportProgress)}%</div>
          <ProgressBar>
            <ProgressFill progress={exportProgress} />
          </ProgressBar>
          <div style={{ fontSize: '0.9rem', color: '#888', marginTop: '10px' }}>
            Traitement de {Math.ceil(exportProgress / 100 * photosToExport.length)} sur {photosToExport.length} photos
          </div>
        </ProgressContainer>
      )}

      {exportStats.totalSize > 0 && !isExporting && (
        <Section>
          <SectionTitle>Résultats de l'Export</SectionTitle>
          <Stats>
            <StatCard>
              <StatNumber>{formatFileSize(exportStats.totalSize)}</StatNumber>
              <StatLabel>Taille originale</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{formatFileSize(exportStats.compressedSize)}</StatNumber>
              <StatLabel>Taille compressée</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{formatFileSize(exportStats.savedSpace)}</StatNumber>
              <StatLabel>Espace économisé</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{Math.round((exportStats.savedSpace / exportStats.totalSize) * 100)}%</StatNumber>
              <StatLabel>Réduction</StatLabel>
            </StatCard>
          </Stats>
        </Section>
      )}
    </Container>
  );
};

export default Export; 