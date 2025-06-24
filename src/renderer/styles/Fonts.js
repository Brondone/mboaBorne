import { createGlobalStyle } from 'styled-components';

// Polices système modernes comme alternative à Inter
const Fonts = createGlobalStyle`
  @font-face {
    font-family: 'SystemFont';
    src: local('-apple-system'), local('BlinkMacSystemFont'), local('Segoe UI'), local('Roboto'), local('Helvetica Neue'), local('Arial'), local('sans-serif');
    font-weight: 300;
    font-style: normal;
  }

  @font-face {
    font-family: 'SystemFont';
    src: local('-apple-system'), local('BlinkMacSystemFont'), local('Segoe UI'), local('Roboto'), local('Helvetica Neue'), local('Arial'), local('sans-serif');
    font-weight: 400;
    font-style: normal;
  }

  @font-face {
    font-family: 'SystemFont';
    src: local('-apple-system'), local('BlinkMacSystemFont'), local('Segoe UI'), local('Roboto'), local('Helvetica Neue'), local('Arial'), local('sans-serif');
    font-weight: 500;
    font-style: normal;
  }

  @font-face {
    font-family: 'SystemFont';
    src: local('-apple-system'), local('BlinkMacSystemFont'), local('Segoe UI'), local('Roboto'), local('Helvetica Neue'), local('Arial'), local('sans-serif');
    font-weight: 600;
    font-style: normal;
  }

  @font-face {
    font-family: 'SystemFont';
    src: local('-apple-system'), local('BlinkMacSystemFont'), local('Segoe UI'), local('Roboto'), local('Helvetica Neue'), local('Arial'), local('sans-serif');
    font-weight: 700;
    font-style: normal;
  }

  * {
    font-family: 'SystemFont', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }
`;

export default Fonts; 