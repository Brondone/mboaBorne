import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Image, 
  Users, 
  Download, 
  Heart, 
  Search, 
  Settings,
  Smile
} from 'lucide-react';
import { useAppStore } from '../store/appStore';

const SidebarContainer = styled.aside`
  width: 280px;
  background: #2d2d2d;
  border-radius: 12px;
  padding: 24px;
  margin: 24px;
  margin-right: 0;
  height: calc(100vh - 108px);
  overflow-y: auto;
  border: 1px solid #3a3a3a;
`;

const Section = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  font-size: 0.8rem;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: #b0b0b0;
  text-decoration: none;
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.2s ease;
  background: transparent;
  
  &:hover {
    background: #3a3a3a;
    color: #007AFF;
  }
  
  &.active {
    color: #007AFF;
    background: #007AFF20;
  }
  
  &.active:hover {
    background: #007AFF30;
  }
  
  svg {
    margin-right: 12px;
    width: 18px;
    height: 18px;
  }
`;

const FilterItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: ${props => props.active ? '#007AFF' : '#b0b0b0'};
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.2s ease;
  background: ${props => props.active ? '#007AFF20' : 'transparent'};
  cursor: pointer;
  
  &:hover {
    background: ${props => props.active ? '#007AFF30' : '#3a3a3a'};
    color: #007AFF;
  }
  
  svg {
    margin-right: 12px;
    width: 18px;
    height: 18px;
  }
`;

const FilterToggle = styled.input`
  margin-left: auto;
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #3a3a3a;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  position: relative;
  
  &:checked {
    background: #007AFF;
    border-color: #007AFF;
  }
  
  &:checked::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 12px;
    font-weight: bold;
  }
`;

const menuItems = [
  {
    id: 'gallery',
    label: 'Galerie',
    icon: Image,
    path: '/'
  },
  {
    id: 'facefilter',
    label: 'Reconnaissance Faciale',
    icon: Users,
    path: '/facefilter'
  },
  {
    id: 'export',
    label: 'Export',
    icon: Download,
    path: '/export'
  },
  {
    id: 'favorites',
    label: 'Favoris',
    icon: Heart,
    path: '/favorites'
  },
  {
    id: 'search',
    label: 'Recherche Avancée',
    icon: Search,
    path: '/search'
  },
  {
    id: 'settings',
    label: 'Paramètres',
    icon: Settings,
    path: '/settings'
  }
];

function Sidebar() {
  const location = useLocation();
  const { 
    sidebarOpen,
    activeFilters, 
    setActiveFilters,
    photos
  } = useAppStore();

  const handleFilterToggle = (filterKey) => {
    setActiveFilters({
      [filterKey]: !activeFilters[filterKey]
    });
  };

  return (
    <SidebarContainer>
      <Section>
        <SectionTitle>Navigation</SectionTitle>
        {menuItems.map(item => (
          <NavItem
            key={item.id}
            to={item.path}
            className={location.pathname === item.path ? 'active' : ''}
          >
            <item.icon />
            {item.label}
          </NavItem>
        ))}
      </Section>
      
      <Section>
        <SectionTitle>Filtres</SectionTitle>
        <FilterItem 
          active={activeFilters.favorites}
          onClick={() => handleFilterToggle('favorites')}
        >
          <Heart />
          Favoris
          <FilterToggle 
            type="checkbox"
            checked={activeFilters.favorites}
            onChange={() => handleFilterToggle('favorites')}
          />
        </FilterItem>
        
        <FilterItem 
          active={activeFilters.faces}
          onClick={() => handleFilterToggle('faces')}
        >
          <Smile />
          Avec visages
          <FilterToggle 
            type="checkbox"
            checked={activeFilters.faces}
            onChange={() => handleFilterToggle('faces')}
          />
        </FilterItem>
      </Section>
      
      <Section>
        <SectionTitle>Statistiques</SectionTitle>
        <div style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>
          <div>📷 Photos: {photos.length}</div>
          <div>👥 Visages: {photos.filter(photo => photo.faces && photo.faces.length > 0).length}</div>
          <div>❤️ Favoris: {photos.filter(photo => photo.isFavorite).length}</div>
        </div>
      </Section>
    </SidebarContainer>
  );
}

export default Sidebar; 