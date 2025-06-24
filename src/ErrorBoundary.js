import React from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  padding: 2rem;
  margin: 2rem;
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 8px;
  color: #fff;
  text-align: center;
`;

const ErrorTitle = styled.h2`
  color: #dc3545;
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.pre`
  background: rgba(0, 0, 0, 0.1);
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
`;

const ReloadButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  margin-top: 1rem;
  cursor: pointer;
  
  &:hover {
    background: #c82333;
  }
`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log l'erreur
    console.error('Erreur capturée par ErrorBoundary:', error, errorInfo);
    
    // Vous pouvez envoyer l'erreur à un service de monitoring ici
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorTitle>🚨 Une erreur est survenue</ErrorTitle>
          <p>
            L'application a rencontré une erreur inattendue. 
            Vous pouvez essayer de recharger la page.
          </p>
          {this.state.error && (
            <ErrorMessage>
              {this.state.error.toString()}
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </ErrorMessage>
          )}
          <ReloadButton onClick={this.handleReload}>
            Recharger l'application
          </ReloadButton>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 