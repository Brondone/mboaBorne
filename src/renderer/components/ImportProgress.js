import React from 'react';
import { useAppStore } from '../store/appStore';

const ImportProgress = () => {
  const { importProgress } = useAppStore();

  if (!importProgress.isImporting) {
    return null;
  }

  const progressPercentage = importProgress.total > 0 
    ? Math.round((importProgress.current / importProgress.total) * 100) 
    : 0;

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(15, 15, 35, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '16px',
      padding: '32px',
      minWidth: '400px',
      zIndex: 1000,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
    }}>
      <div style={{
        textAlign: 'center',
        color: 'white'
      }}>
        {/* Icône de chargement */}
        <div style={{
          width: '60px',
          height: '60px',
          margin: '0 auto 20px',
          border: '3px solid rgba(255, 255, 255, 0.2)',
          borderTop: '3px solid #4ECDC4',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        
        {/* Titre */}
        <h3 style={{
          fontSize: '1.5rem',
          marginBottom: '16px',
          color: '#4ECDC4',
          fontWeight: '600'
        }}>
          Importation en cours...
        </h3>
        
        {/* Message */}
        <p style={{
          fontSize: '1rem',
          marginBottom: '24px',
          color: 'rgba(255, 255, 255, 0.8)',
          lineHeight: '1.5'
        }}>
          {importProgress.message}
        </p>
        
        {/* Nom du fichier en cours */}
        {importProgress.currentFileName && (
          <p style={{
            fontSize: '0.9rem',
            marginBottom: '20px',
            color: 'rgba(255, 255, 255, 0.6)',
            fontStyle: 'italic'
          }}>
            {importProgress.currentFileName}
          </p>
        )}
        
        {/* Barre de progression */}
        <div style={{
          width: '100%',
          height: '8px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '12px'
        }}>
          <div style={{
            width: `${progressPercentage}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #4ECDC4, #00D4FF)',
            borderRadius: '4px',
            transition: 'width 0.3s ease'
          }} />
        </div>
        
        {/* Pourcentage */}
        <p style={{
          fontSize: '0.9rem',
          color: 'rgba(255, 255, 255, 0.7)',
          fontWeight: '500'
        }}>
          {importProgress.current} / {importProgress.total} ({progressPercentage}%)
        </p>
      </div>
      
      {/* Animation CSS */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ImportProgress; 