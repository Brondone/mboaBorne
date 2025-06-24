import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Search, 
  Menu, 
  Plus, 
  Settings, 
  Upload,
  FolderOpen,
  Image as ImageIcon,
  X,
  CheckCircle,
  Download
} from 'lucide-react';
import { useAppStore } from '../store/appStore';

const HeaderContainer = styled.header`
  height: 80px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const SearchContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 600px;
  margin: 0 32px;
  position: relative;
  z-index: 1;
`;

const SearchInput = styled.input`
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 14px 20px 14px 56px;
  color: #ffffff;
  font-size: 1rem;
  width: 100%;
  outline: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }
  
  &:focus {
    border-color: rgba(255, 107, 157, 0.6);
    box-shadow: 0 0 20px rgba(255, 107, 157, 0.3);
    background: rgba(255, 255, 255, 0.15);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.7);
  z-index: 1;
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 10px;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const BurgerButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const BurgerLine = styled.div`
  width: 20px;
  height: 2px;
  background: white;
  transition: all 0.3s ease;
  transform: ${props => props.isOpen ? props.transform : 'none'};
  opacity: ${props => props.isOpen ? props.opacity : '1'};
`;

const SideMenu = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: ${props => props.isOpen ? '280px' : '0'};
  height: 100vh;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  overflow: hidden;
`;

const MenuOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.3);
  z-index: 999;
  backdrop-filter: blur(2px);
  opacity: ${props => props.isOpen ? '1' : '0'};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

const MenuContent = styled.div`
  padding: 100px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const MenuItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-radius: 12px;
  text-decoration: none;
  color: white;
  background: ${props => props.isActive ? `linear-gradient(135deg, ${props.color}20, ${props.color}40)` : 'transparent'};
  border: ${props => props.isActive ? `1px solid ${props.color}60` : '1px solid transparent'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: ${props => props.isActive ? 'scale(1.02)' : 'scale(1)'};
  box-shadow: ${props => props.isActive ? `0 0 20px ${props.color}40` : 'none'};
  
  &:hover {
    transform: scale(1.05);
    box-shadow: ${props => `0 0 25px ${props.color}50`};
  }
`;

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fileInputRef = useRef(null);
  const location = useLocation();
  
  const { addPhotos, selectedPhotos, photos } = useAppStore();

  const navItems = [
    { path: '/gallery', icon: '📷', label: 'Galerie', color: '#FF6B9D' },
    { path: '/favorites', icon: '❤️', label: 'Favoris', color: '#FFD93D' },
    { path: '/face-search', icon: '🔍', label: 'Recherche', color: '#4ECDC4' },
    { path: '/settings', icon: '⚙️', label: 'Paramètres', color: '#45B7D1' }
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleAddPhotos = async () => {
    if (window.electronAPI && window.electronAPI.selectFiles) {
      const filePaths = await window.electronAPI.selectFiles();
      if (filePaths && filePaths.length > 0) {
        try {
          await addPhotos(filePaths);
          setNotificationMessage(`${filePaths.length} photo(s) ajoutée(s) !`);
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 3000);
        } catch (error) {
          console.error("Erreur lors de l'ajout des photos depuis le header:", error);
          alert("Une erreur est survenue lors de l'ajout des photos.");
        }
      }
    } else {
      alert("La fonctionnalité d'ajout de photos n'est pas disponible.");
    }
  };

  const handleExport = async () => {
    if (selectedPhotos.length === 0) {
      alert('Veuillez sélectionner au moins une photo à exporter.');
      return;
    }
    // On récupère les chemins des fichiers des photos sélectionnées
    const selectedFilePaths = photos
      .filter(photo => selectedPhotos.includes(photo.id))
      .map(photo => photo.filePath);

    if (window.electronAPI && window.electronAPI.exportPhotos) {
      // Appel de la fonction d'export côté Electron
      const result = await window.electronAPI.exportPhotos(selectedFilePaths);
      if (result.success) {
        alert(result.message);
      } else {
        alert(result.message + (result.errors ? '\n' + result.errors.map(e => e.file + ': ' + e.error).join('\n') : ''));
      }
    } else {
      alert('Fonctionnalité d\'export non disponible dans ce mode.');
    }
  };

  return (
    <>
      <HeaderContainer>
        <ActionsContainer>
          <BurgerButton 
            onClick={toggleMenu}
            title="Menu principal"
          >
            <BurgerLine 
              isOpen={isMenuOpen} 
              transform="rotate(45deg) translate(5px, 5px)"
            />
            <BurgerLine 
              isOpen={isMenuOpen} 
              opacity="0"
            />
            <BurgerLine 
              isOpen={isMenuOpen} 
              transform="rotate(-45deg) translate(5px, -5px)"
            />
          </BurgerButton>
        </ActionsContainer>
        
        <SearchContainer>
          <SearchIcon>
            <Search size={20} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Rechercher dans vos photos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchContainer>
        
        <ActionsContainer>
          <ActionButton 
            onClick={handleAddPhotos}
            title="Ajouter des photos"
          >
            <Upload size={20} />
          </ActionButton>
          
          {selectedPhotos.length > 0 && (
            <ActionButton 
              onClick={handleExport}
              title={`Exporter ${selectedPhotos.length} photo(s)`}
              style={{
                background: 'linear-gradient(135deg, #4ECDC4, #45B7D1)',
                border: 'none',
                color: 'white'
              }}
            >
              <Download size={20} />
            </ActionButton>
          )}
        </ActionsContainer>
      </HeaderContainer>

      {/* Menu latéral */}
      <SideMenu isOpen={isMenuOpen}>
        <MenuContent>
          {navItems.map((item) => (
            <MenuItem
              key={item.path}
              to={item.path}
              onClick={() => setIsMenuOpen(false)}
              isActive={location.pathname === item.path}
              color={item.color}
            >
              <span style={{ fontSize: '24px', marginRight: '16px' }}>{item.icon}</span>
              <span style={{ 
                fontSize: '16px', 
                fontWeight: '500',
                opacity: location.pathname === item.path ? '1' : '0.9'
              }}>
                {item.label}
              </span>
            </MenuItem>
          ))}
        </MenuContent>
      </SideMenu>

      {/* Overlay pour fermer le menu */}
      <MenuOverlay 
        isOpen={isMenuOpen}
        onClick={() => setIsMenuOpen(false)}
      />
      
      {/* Notifications */}
      {showNotification && (
        <div style={{
          position: 'fixed',
          top: '100px',
          right: '32px',
          background: 'rgba(78, 205, 196, 0.9)',
          backdropFilter: 'blur(20px)',
          color: 'white',
          padding: '16px 20px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 1000,
          border: '1px solid rgba(78, 205, 196, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          animation: 'slideIn 0.3s ease'
        }}>
          <CheckCircle size={18} />
          {notificationMessage}
        </div>
      )}
    </>
  );
} 