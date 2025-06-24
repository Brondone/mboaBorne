// Polyfills pour les APIs du navigateur
if (typeof window !== 'undefined') {
  // Polyfill pour l'objet global
  if (!window.global) {
    window.global = window;
  }

  // Polyfills pour TextEncoder/TextDecoder
  if (typeof window.TextEncoder === 'undefined') {
    window.TextEncoder = require('util').TextEncoder;
  }
  if (typeof window.TextDecoder === 'undefined') {
    window.TextDecoder = require('util').TextDecoder;
  }

  // Polyfill pour process
  if (!window.process) {
    window.process = {
      browser: true,
      env: {},
      versions: {
        node: process.versions.node,
        chrome: process.versions.chrome,
        electron: process.versions.electron
      }
    };
  }

  // Polyfill pour Buffer
  if (typeof window.Buffer === 'undefined') {
    window.Buffer = require('buffer').Buffer;
  }

  // Polyfills pour les APIs de flux
  if (typeof window.Stream === 'undefined') {
    window.Stream = require('stream');
  }
}

// Export des polyfills pour une utilisation explicite
export const polyfills = {
  TextEncoder: window.TextEncoder,
  TextDecoder: window.TextDecoder,
  Buffer: window.Buffer,
  Stream: window.Stream,
  process: window.process,
  global: window.global
}; 