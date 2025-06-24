# 🔧 Guide de Dépannage - Reconnaissance Faciale

## 🚨 Problème : "Erreur lors de la détection du visage"

### 📋 Diagnostic Rapide

1. **Accédez au diagnostic** : Naviguez vers `/face-diagnostic` dans l'application
2. **Lancez le diagnostic complet** : Cliquez sur "Lancer le diagnostic complet"
3. **Vérifiez les résultats** : Analysez les sections qui affichent des erreurs

### 🔍 Causes Possibles et Solutions

#### 1. **Modèles non chargés**
**Symptômes :**
- Message "Service de reconnaissance faciale non initialisé"
- Erreur lors de l'import d'image

**Solutions :**
```bash
# Vérifiez que les modèles sont présents
ls public/models/

# Les fichiers suivants doivent exister :
# - tiny_face_detector_model-weights_manifest.json
# - face_landmark_68_model-weights_manifest.json
# - face_recognition_model-weights_manifest.json
```

#### 2. **Problème de chemin d'accès**
**Symptômes :**
- Erreur "Les modèles ne sont pas accessibles"
- Erreur 404 lors du chargement

**Solutions :**
- Vérifiez que l'application tourne sur `http://localhost:3000`
- Assurez-vous que les modèles sont dans `public/models/`
- Redémarrez l'application avec `npm run dev`

#### 3. **Problème de mémoire/performance**
**Symptômes :**
- Détection très lente
- Erreurs de timeout
- Application qui plante

**Solutions :**
- Fermez d'autres applications
- Redémarrez l'application
- Utilisez TinyFaceDetector au lieu de SSD Mobilenet

#### 4. **Problème avec face-api.js**
**Symptômes :**
- Erreur "faceapi is not defined"
- Erreurs de compilation

**Solutions :**
```bash
# Réinstallez face-api.js
npm uninstall face-api.js
npm install face-api.js@latest

# Vérifiez la version
npm list face-api.js
```

### 🛠️ Actions Correctives

#### Étape 1 : Vérification des Modèles
```bash
# Dans le terminal, vérifiez la structure
cd public/models
ls -la

# Vous devriez voir :
# - tiny_face_detector/
# - face_landmark_68/
# - face_recognition/
# - Et les fichiers .json correspondants
```

#### Étape 2 : Réinitialisation des Services
1. Allez sur `/face-diagnostic`
2. Cliquez sur "Réinitialiser les services"
3. Attendez la confirmation
4. Testez à nouveau

#### Étape 3 : Test avec une Image Simple
1. Utilisez une image de test claire avec un visage bien visible
2. Assurez-vous que l'image n'est pas trop grande (< 2MB)
3. Testez avec différents formats (JPG, PNG)

#### Étape 4 : Vérification de la Console
1. Ouvrez les outils de développement (F12)
2. Allez dans l'onglet Console
3. Recherchez les erreurs en rouge
4. Notez les messages d'erreur spécifiques

### 📊 Messages d'Erreur Courants

| Erreur | Cause | Solution |
|--------|-------|----------|
| `Service non initialisé` | Modèles non chargés | Attendez l'initialisation ou réinitialisez |
| `Modèles non accessibles` | Problème de chemin | Vérifiez public/models/ |
| `Aucun visage détecté` | Image sans visage | Utilisez une image avec un visage clair |
| `faceapi is not defined` | Bibliothèque manquante | Réinstallez face-api.js |
| `WebGL not supported` | Problème matériel | Mettez à jour les pilotes graphiques |

### 🔄 Procédure de Récupération

#### Option 1 : Redémarrage Complet
```bash
# Arrêtez l'application (Ctrl+C)
# Puis redémarrez
npm run dev
```

#### Option 2 : Nettoyage et Réinstallation
```bash
# Nettoyez le cache
npm cache clean --force

# Supprimez node_modules
rm -rf node_modules
rm package-lock.json

# Réinstallez
npm install

# Redémarrez
npm run dev
```

#### Option 3 : Vérification des Modèles
```bash
# Téléchargez les modèles si manquants
# Les modèles doivent être dans public/models/
# Vérifiez que tous les fichiers .json sont présents
```

### 📞 Support Avancé

Si les problèmes persistent :

1. **Collectez les logs** :
   - Console du navigateur
   - Terminal de l'application
   - Résultats du diagnostic

2. **Informations système** :
   - Version de Node.js : `node --version`
   - Version de npm : `npm --version`
   - Système d'exploitation
   - Navigateur utilisé

3. **Test de compatibilité** :
   - Testez sur un autre navigateur
   - Testez sur un autre ordinateur
   - Vérifiez la connexion internet

### ✅ Vérification Finale

Après avoir appliqué les corrections :

1. **Testez l'initialisation** :
   - Allez sur `/face-diagnostic`
   - Lancez le diagnostic
   - Vérifiez que tous les tests passent

2. **Testez la détection** :
   - Allez sur `/facefilter`
   - Importez une image de test
   - Vérifiez que le visage est détecté

3. **Testez la recherche** :
   - Lancez une recherche
   - Vérifiez que les résultats s'affichent

### 🎯 Conseils de Performance

- **Utilisez TinyFaceDetector** pour la vitesse
- **Réduisez la taille des images** avant import
- **Fermez les autres onglets** du navigateur
- **Utilisez un navigateur moderne** (Chrome, Firefox, Edge)

---

**Note** : La plupart des problèmes sont liés à l'initialisation des modèles ou à l'accès aux fichiers. Le diagnostic intégré devrait identifier précisément le problème. 