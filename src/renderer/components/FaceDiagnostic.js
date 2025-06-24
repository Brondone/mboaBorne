import React, { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 500px;
  margin: 40px auto;
  padding: 32px 24px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  text-align: center;
`;

const Title = styled.h2`
  color: #222;
  margin-bottom: 12px;
`;

const Explanation = styled.p`
  color: #555;
  font-size: 1.1rem;
  margin-bottom: 28px;
`;

const BigButton = styled.button`
  background: #007AFF;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  padding: 18px 36px;
  margin-bottom: 24px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.2s;
  &:hover { background: #0056CC; }
`;

const ResultBox = styled.div`
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  color: #222;
  font-size: 1.1rem;
`;

const ActionButton = styled.button`
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  padding: 12px 24px;
  margin: 0 8px;
  cursor: pointer;
  font-weight: 500;
  color: #fff;
  background: ${props => props.variant === 'add' ? '#28a745' : '#e74c3c'};
  &:hover { opacity: 0.9; }
`;

export default function FaceDiagnostic() {
  // État pour savoir si un visage a été détecté
  const [faceDetected, setFaceDetected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fonction simulant l'analyse d'une photo (à remplacer par la vraie détection)
  const handleAnalyze = async () => {
    setLoading(true);
    setMessage('Analyse en cours...');
    // Ici tu appellerais la vraie fonction de détection de visage
    setTimeout(() => {
      setFaceDetected(true); // Simule qu'un visage a été trouvé
      setMessage('1 visage détecté sur la photo.');
      setLoading(false);
    }, 1500);
  };

  // Fonction pour ajouter à un profil (à personnaliser)
  const handleAddProfile = () => {
    setMessage('Visage ajouté au profil !');
    setFaceDetected(false);
  };

  // Fonction pour supprimer le visage détecté
  const handleDeleteFace = () => {
    setMessage('Visage supprimé.');
    setFaceDetected(false);
  };

  return (
    <Container>
      <Title>Reconnaissance Faciale Simplifiée</Title>
      <Explanation>
        Cliquez sur « Analyser la photo » pour détecter un visage. Si un visage est trouvé, vous pouvez l'ajouter à un profil ou le supprimer.
      </Explanation>
      {/* Bouton principal pour lancer l'analyse */}
      <BigButton onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyse en cours...' : 'Analyser la photo'}
      </BigButton>
      {/* Affichage du résultat */}
      {message && <ResultBox>{message}</ResultBox>}
      {/* Si un visage est détecté, afficher les actions */}
      {faceDetected && (
        <div>
          <ActionButton variant="add" onClick={handleAddProfile}>
            Ajouter à un profil
          </ActionButton>
          <ActionButton variant="delete" onClick={handleDeleteFace}>
            Supprimer ce visage
          </ActionButton>
        </div>
      )}
    </Container>
  );
} 