import { createGlobalStyle } from 'styled-components';
import Fonts from './Fonts';

// Thème sombre par défaut
export const theme = {
  colors: {
    // Couleurs de base
    background: '#1a1a1a',
    surface: '#2d2d2d',
    surfaceHover: '#3a3a3a',
    surfaceActive: '#404040',
    
    // Couleurs d'accent
    primary: '#007AFF',
    primaryHover: '#0056CC',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    
    // Couleurs de texte
    textPrimary: '#ffffff',
    textSecondary: '#b0b0b0',
    textTertiary: '#808080',
    textInverse: '#000000',
    
    // Couleurs de bordure
    border: '#404040',
    borderLight: '#333333',
    
    // Couleurs d'overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
    
    // Couleurs de sélection
    selection: 'rgba(0, 122, 255, 0.2)',
    selectionBorder: '#007AFF'
  },
  
  // Typographie
  typography: {
    fontFamily: "'SystemFont', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px'
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.7
    }
  },
  
  // Espacement
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px'
  },
  
  // Bordures
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px'
  },
  
  // Ombres
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  
  // Transitions
  transitions: {
    fast: '150ms ease-out',
    normal: '200ms ease-out',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)'
  },
  
  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  
  // Z-index
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070
  }
};

// Thème clair (optionnel)
export const lightTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    background: '#ffffff',
    surface: '#f5f5f5',
    surfaceHover: '#e5e5e5',
    surfaceActive: '#d5d5d5',
    textPrimary: '#000000',
    textSecondary: '#404040',
    textTertiary: '#606060',
    textInverse: '#ffffff',
    border: '#d1d5db',
    borderLight: '#e5e7eb',
    overlay: 'rgba(255, 255, 255, 0.5)',
    overlayLight: 'rgba(255, 255, 255, 0.3)'
  }
};

// Styles globaux
const GlobalStyles = createGlobalStyle`
  ${Fonts}

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  html, body {
    height: 100%;
    overflow: hidden;
  }
  
  body {
    font-family: 'SystemFont', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  #root {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  /* Scrollbar personnalisée */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.background};
  }
  
  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border};
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.primary};
  }
  
  /* Focus styles */
  *:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }
  
  /* Animations globales */
  .fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }

  .slide-up {
    animation: slideUp 0.3s ease-out;
  }

  .scale-in {
    animation: scaleIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes scaleIn {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  /* Utilitaires */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  
  .text-center {
    text-align: center;
  }

  .text-left {
    text-align: left;
  }

  .text-right {
    text-align: right;
  }

  .flex {
    display: flex;
  }

  .flex-col {
    flex-direction: column;
  }
  
  .items-center {
    align-items: center;
  }

  .justify-center {
    justify-content: center;
  }

  .justify-between {
    justify-content: space-between;
  }

  .w-full {
    width: 100%;
  }

  .h-full {
    height: 100%;
  }
  
  /* États de chargement */
  .loading {
    opacity: 0.6;
    pointer-events: none;
  }
  
  .loading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    margin: -10px 0 0 -10px;
    border: 2px solid ${props => props.theme.colors.primary};
    border-top: 2px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Gestion des erreurs */
  .error {
    color: ${props => props.theme.colors.error};
    background: ${props => props.theme.colors.error + '20'};
    border: 1px solid ${props => props.theme.colors.error};
    padding: 12px;
    border-radius: 8px;
    margin: 10px 0;
  }
  
  .success {
    color: ${props => props.theme.colors.success};
    background: ${props => props.theme.colors.success + '20'};
    border: 1px solid ${props => props.theme.colors.success};
    padding: 12px;
    border-radius: 8px;
    margin: 10px 0;
  }

  .warning {
    color: ${props => props.theme.colors.warning};
    background: ${props => props.theme.colors.warning + '20'};
    border: 1px solid ${props => props.theme.colors.warning};
    padding: 12px;
    border-radius: 8px;
    margin: 10px 0;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .mobile-hidden {
      display: none;
    }
  }

  @media (min-width: 769px) {
    .desktop-hidden {
      display: none;
    }
  }
`;

export default GlobalStyles; 