import React from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const LoadingContainer = styled.div`
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-family: 'SystemFont', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

const Logo = styled.div`
  font-size: 3rem;
  font-weight: 700;
  color: #007AFF;
  letter-spacing: 2px;
  margin-bottom: 2rem;
  animation: ${fadeIn} 1s ease-out;
`;

const LoadingText = styled.h2`
  font-size: 1.5rem;
  color: #b0b0b0;
  margin-bottom: 3rem;
  animation: ${fadeIn} 1s ease-out 0.3s both;
`;

const LoadingSpinner = styled.div`
  width: 60px;
  height: 60px;
  border: 3px solid #3a3a3a;
  border-top: 3px solid #007AFF;
  border-radius: 50%;
  animation: ${rotate} 1s linear infinite;
  margin-bottom: 2rem;
`;

const StatusText = styled.div`
  color: #34C759;
  font-size: 0.9rem;
  margin-top: 1rem;
  animation: ${fadeIn} 1s ease-out 1.2s both;
`;

function LoadingScreen() {
  console.log('LoadingScreen: Rendu du composant de chargement');
  
  return (
    <LoadingContainer>
      <Logo>Borne</Logo>
      <LoadingText>Galerie Photo Intelligente</LoadingText>
      <LoadingSpinner />
      <StatusText>Chargement en cours...</StatusText>
    </LoadingContainer>
  );
}

export default LoadingScreen; 