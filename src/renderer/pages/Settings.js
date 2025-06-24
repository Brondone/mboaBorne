import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Settings as SettingsIcon, 
  Monitor, 
  Image, 
  Database, 
  Shield,
  Save,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { useAppStore } from '../store/appStore';

const SettingsContainer = styled.div`
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

const SaveButton = styled.button`
  background: #007AFF;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #0056CC;
  }
`;

const Content = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 24px;
  overflow: hidden;
`;

const Sidebar = styled.div`
  background: #3a3a3a;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #4a4a4a;
  height: fit-content;
`;

const NavItem = styled.div`
  padding: 12px 16px;
  color: ${props => props.active ? '#007AFF' : '#b0b0b0'};
  background: ${props => props.active ? '#007AFF20' : 'transparent'};
  border-radius: 8px;
  margin-bottom: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  
  &:hover {
    background: ${props => props.active ? '#007AFF30' : '#4a4a4a'};
    color: #007AFF;
  }
`;

const MainArea = styled.div`
  background: #3a3a3a;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #4a4a4a;
  overflow-y: auto;
`;

const Section = styled.div`
  margin-bottom: 32px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SettingItem = styled.div`
  margin-bottom: 20px;
`;

const SettingLabel = styled.label`
  display: block;
  font-size: 0.9rem;
  color: #b0b0b0;
  margin-bottom: 8px;
  font-weight: 500;
`;

const SettingInput = styled.input`
  width: 100%;
  background: #4a4a4a;
  border: 1px solid #5a5a5a;
  border-radius: 6px;
  padding: 10px 12px;
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
  padding: 10px 12px;
  color: #ffffff;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #007AFF;
  }
`;

const SettingTextarea = styled.textarea`
  width: 100%;
  background: #4a4a4a;
  border: 1px solid #5a5a5a;
  border-radius: 6px;
  padding: 10px 12px;
  color: #ffffff;
  font-size: 0.9rem;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #007AFF;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #007AFF;
`;

const CheckboxLabel = styled.span`
  color: #b0b0b0;
  font-size: 0.9rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const Button = styled.button`
  background: ${props => props.danger ? '#FF3B30' : 'transparent'};
  color: ${props => props.danger ? '#ffffff' : '#b0b0b0'};
  border: ${props => props.danger ? 'none' : '1px solid #3a3a3a'};
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: ${props => props.danger ? '#D70015' : '#3a3a3a'};
    color: #ffffff;
  }
`;

const InfoText = styled.p`
  color: #888;
  font-size: 0.8rem;
  margin-top: 8px;
  line-height: 1.4;
`;

function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // Général
    theme: 'dark',
    language: 'fr',
    autoSave: true,
    notifications: true,
    
    // Galerie
    thumbnailSize: 'medium',
    columns: 4,
    watchFolders: [],
    
    // Reconnaissance faciale
    faceDetectionEnabled: true,
    confidence: 0.7,
    model: 'fast',
    
    // Stockage
    maxStorage: 10,
    compression: 'medium',
    backupEnabled: true,
    
    // Avancé
    debugMode: false,
    analytics: false
  });

  const { photos, deselectAllPhotos } = useAppStore();

  const handleSave = () => {
    // Sauvegarder les paramètres
    localStorage.setItem('borne-settings', JSON.stringify(settings));
    console.log('Paramètres sauvegardés');
  };

  const handleReset = () => {
    // Réinitialiser les paramètres
    setSettings({
      theme: 'dark',
      language: 'fr',
      autoSave: true,
      notifications: true,
      thumbnailSize: 'medium',
      columns: 4,
      watchFolders: [],
      faceDetectionEnabled: true,
      confidence: 0.7,
      model: 'fast',
      maxStorage: 10,
      compression: 'medium',
      backupEnabled: true,
      debugMode: false,
      analytics: false
    });
  };

  const handleClearData = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes les données ? Cette action est irréversible.')) {
      // Supprimer toutes les données
      localStorage.clear();
      deselectAllPhotos();
      console.log('Données supprimées');
    }
  };

  const renderGeneralSettings = () => (
    <Section>
      <SectionTitle>
        <SettingsIcon size={18} />
        Général
      </SectionTitle>
      
      <SettingItem>
        <SettingLabel>Thème</SettingLabel>
        <SettingSelect
          value={settings.theme}
          onChange={(e) => setSettings({...settings, theme: e.target.value})}
        >
          <option value="dark">Sombre</option>
          <option value="light">Clair</option>
          <option value="auto">Automatique</option>
        </SettingSelect>
      </SettingItem>
      
      <SettingItem>
        <SettingLabel>Langue</SettingLabel>
        <SettingSelect
          value={settings.language}
          onChange={(e) => setSettings({...settings, language: e.target.value})}
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
          <option value="es">Español</option>
        </SettingSelect>
      </SettingItem>
      
      <SettingItem>
        <CheckboxContainer>
          <Checkbox
            type="checkbox"
            checked={settings.autoSave}
            onChange={(e) => setSettings({...settings, autoSave: e.target.checked})}
          />
          <CheckboxLabel>Sauvegarde automatique</CheckboxLabel>
        </CheckboxContainer>
      </SettingItem>
      
      <SettingItem>
        <CheckboxContainer>
          <Checkbox
            type="checkbox"
            checked={settings.notifications}
            onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
          />
          <CheckboxLabel>Notifications</CheckboxLabel>
        </CheckboxContainer>
      </SettingItem>
    </Section>
  );

  const renderGallerySettings = () => (
      <Section>
      <SectionTitle>
        <Image size={18} />
        Galerie
      </SectionTitle>
      
        <SettingItem>
        <SettingLabel>Taille des vignettes</SettingLabel>
        <SettingSelect
          value={settings.thumbnailSize}
          onChange={(e) => setSettings({...settings, thumbnailSize: e.target.value})}
        >
          <option value="small">Petite</option>
          <option value="medium">Moyenne</option>
          <option value="large">Grande</option>
        </SettingSelect>
        </SettingItem>
      
        <SettingItem>
          <SettingLabel>Nombre de colonnes</SettingLabel>
        <SettingInput
          type="number"
          min="2"
          max="8"
          value={settings.columns}
          onChange={(e) => setSettings({...settings, columns: parseInt(e.target.value)})}
        />
        </SettingItem>
      </Section>
  );

  const renderFaceDetectionSettings = () => (
      <Section>
      <SectionTitle>
        <Shield size={18} />
        Reconnaissance faciale
      </SectionTitle>
      
      <SettingItem>
        <CheckboxContainer>
          <Checkbox
            type="checkbox"
            checked={settings.faceDetectionEnabled}
            onChange={(e) => setSettings({...settings, faceDetectionEnabled: e.target.checked})}
          />
          <CheckboxLabel>Activer la reconnaissance faciale</CheckboxLabel>
        </CheckboxContainer>
      </SettingItem>
      
        <SettingItem>
        <SettingLabel>Seuil de confiance: {settings.confidence}</SettingLabel>
        <SettingInput
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={settings.confidence}
          onChange={(e) => setSettings({...settings, confidence: parseFloat(e.target.value)})}
        />
        </SettingItem>
      
        <SettingItem>
        <SettingLabel>Modèle de détection</SettingLabel>
        <SettingSelect
          value={settings.model}
          onChange={(e) => setSettings({...settings, model: e.target.value})}
        >
          <option value="fast">Rapide</option>
          <option value="accurate">Précis</option>
          <option value="balanced">Équilibré</option>
        </SettingSelect>
        </SettingItem>
      </Section>
  );

  const renderStorageSettings = () => (
    <Section>
      <SectionTitle>
        <Database size={18} />
        Stockage
      </SectionTitle>
      
      <SettingItem>
        <SettingLabel>Espace de stockage maximum (GB)</SettingLabel>
        <SettingInput
          type="number"
          min="1"
          max="100"
          value={settings.maxStorage}
          onChange={(e) => setSettings({...settings, maxStorage: parseInt(e.target.value)})}
        />
      </SettingItem>
      
      <SettingItem>
        <SettingLabel>Compression</SettingLabel>
        <SettingSelect
          value={settings.compression}
          onChange={(e) => setSettings({...settings, compression: e.target.value})}
        >
          <option value="none">Aucune</option>
          <option value="low">Faible</option>
          <option value="medium">Moyenne</option>
          <option value="high">Élevée</option>
        </SettingSelect>
      </SettingItem>
      
      <SettingItem>
        <CheckboxContainer>
          <Checkbox
            type="checkbox"
            checked={settings.backupEnabled}
            onChange={(e) => setSettings({...settings, backupEnabled: e.target.checked})}
          />
          <CheckboxLabel>Sauvegarde automatique</CheckboxLabel>
        </CheckboxContainer>
      </SettingItem>
      
      <ButtonGroup>
        <Button onClick={handleClearData} danger>
          <Trash2 size={16} />
          Supprimer toutes les données
        </Button>
      </ButtonGroup>
    </Section>
  );

  const renderAdvancedSettings = () => (
      <Section>
      <SectionTitle>
        <Monitor size={18} />
        Avancé
      </SectionTitle>
      
        <SettingItem>
        <CheckboxContainer>
          <Checkbox
            type="checkbox"
            checked={settings.debugMode}
            onChange={(e) => setSettings({...settings, debugMode: e.target.checked})}
          />
          <CheckboxLabel>Mode debug</CheckboxLabel>
        </CheckboxContainer>
        </SettingItem>
      
        <SettingItem>
        <CheckboxContainer>
          <Checkbox
            type="checkbox"
            checked={settings.analytics}
            onChange={(e) => setSettings({...settings, analytics: e.target.checked})}
          />
          <CheckboxLabel>Analytics</CheckboxLabel>
        </CheckboxContainer>
        <InfoText>Collecter des données d'utilisation pour améliorer l'application</InfoText>
        </SettingItem>
      
      <ButtonGroup>
        <Button onClick={handleReset}>
          <RefreshCw size={16} />
          Réinitialiser les paramètres
        </Button>
      </ButtonGroup>
      </Section>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'gallery':
        return renderGallerySettings();
      case 'face-detection':
        return renderFaceDetectionSettings();
      case 'storage':
        return renderStorageSettings();
      case 'advanced':
        return renderAdvancedSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <SettingsContainer>
      <Header>
        <Title>
          <SettingsIcon size={24} />
          Paramètres
        </Title>
        <SaveButton onClick={handleSave}>
          <Save size={16} />
          Sauvegarder
        </SaveButton>
      </Header>
      
      <Content>
        <Sidebar>
          <NavItem 
            active={activeTab === 'general'} 
            onClick={() => setActiveTab('general')}
          >
            <SettingsIcon size={16} />
            Général
          </NavItem>
          <NavItem 
            active={activeTab === 'gallery'} 
            onClick={() => setActiveTab('gallery')}
          >
            <Image size={16} />
            Galerie
          </NavItem>
          <NavItem 
            active={activeTab === 'face-detection'} 
            onClick={() => setActiveTab('face-detection')}
          >
            <Shield size={16} />
            Reconnaissance faciale
          </NavItem>
          <NavItem 
            active={activeTab === 'storage'} 
            onClick={() => setActiveTab('storage')}
          >
            <Database size={16} />
            Stockage
          </NavItem>
          <NavItem 
            active={activeTab === 'advanced'} 
            onClick={() => setActiveTab('advanced')}
          >
            <Monitor size={16} />
            Avancé
          </NavItem>
        </Sidebar>
        
        <MainArea>
          {renderContent()}
        </MainArea>
      </Content>
    </SettingsContainer>
  );
}

export default Settings; 