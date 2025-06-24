// Importer les polyfills en premier
import './polyfills';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './renderer/App';
import ErrorBoundary from './ErrorBoundary';
import GlobalStyles from './renderer/styles/GlobalStyles';

// Gestionnaire d'erreurs global
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Erreur globale:', { message, source, lineno, colno, error });
};

// Gestionnaire de rejets de promesses non gérés
window.onunhandledrejection = function(event) {
  console.error('Promesse rejetée non gérée:', event.reason);
};

// Point d'entrée principal de l'application React
ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <GlobalStyles />
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
); 