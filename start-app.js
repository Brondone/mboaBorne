const { spawn } = require('child_process');
const path = require('path');

// Démarrer le serveur React
const reactProcess = spawn('npm', ['start'], {
  stdio: 'inherit',
  shell: true
});

// Attendre 10 secondes pour que le serveur React démarre
setTimeout(() => {
  // Démarrer Electron
  const electronProcess = spawn('npx', ['electron', '.'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      ELECTRON_START_URL: 'http://localhost:3000'
    }
  });

  // Gestion des erreurs
  electronProcess.on('error', (err) => {
    console.error('Erreur Electron:', err);
  });

  reactProcess.on('error', (err) => {
    console.error('Erreur React:', err);
  });

  // Nettoyage à la sortie
  process.on('SIGINT', () => {
    electronProcess.kill();
    reactProcess.kill();
    process.exit();
  });
}, 10000); 