const fs = require('fs');
const path = require('path');

// Chemin où sauvegarder l'index
const INDEX_PATH = path.join(__dirname, 'face_index.json');

class FaceVectorIndex {
  constructor() {
    this.vectors = []; // { descriptor: [...], file: "nom.jpg", meta: {...} }
    this.loaded = false;
  }

  // Charger l'index depuis le disque
  loadIndex() {
    if (fs.existsSync(INDEX_PATH)) {
      this.vectors = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));
      this.loaded = true;
      console.log('Index facial chargé.');
    } else {
      this.vectors = [];
      this.loaded = true;
      console.log('Aucun index facial trouvé, index vide.');
    }
  }

  // Sauvegarder l'index sur le disque
  saveIndex() {
    fs.writeFileSync(INDEX_PATH, JSON.stringify(this.vectors));
    console.log('Index facial sauvegardé.');
  }

  // Ajouter un descripteur facial
  addDescriptor(descriptor, file, meta = {}) {
    this.vectors.push({ descriptor, file, meta });
  }

  // Ajouter plusieurs d'un coup
  addDescriptors(descriptors) {
    this.vectors.push(...descriptors);
  }

  // Recherche des N plus proches (distance euclidienne)
  search(descriptor, topN = 5) {
    if (!this.loaded) this.loadIndex();
    const distances = this.vectors.map((v, i) => ({
      i,
      file: v.file,
      meta: v.meta,
      distance: this.euclideanDistance(descriptor, v.descriptor)
    }));
    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, topN);
  }

  // Calcul de la distance euclidienne
  euclideanDistance(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += (a[i] - b[i]) ** 2;
    }
    return Math.sqrt(sum);
  }
}

module.exports = new FaceVectorIndex(); 