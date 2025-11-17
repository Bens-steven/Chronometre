import * as handTrack from 'handtrackjs';

/**
 * Gestionnaire de détection de gestes avec Handtrack.js
 * Beaucoup plus simple que MediaPipe - pas de calibration nécessaire !
 */
class GestureDetector {
  constructor() {
    this.model = null;
    this.video = null;
    this.canvas = null;
    this.context = null;
    this.isRunning = false;
    this.gestureSequence = [];
    this.lastGesture = null;
    this.gestureStartTime = null;
    this.GESTURE_HOLD_TIME = 1000; // 1 seconde
    this.animationId = null;
  }

  /**
   * Initialiser la détection de gestes
   */
  async initialize(videoElementId = 'gesture-video', canvasElementId = 'gesture-canvas') {
    try {
      console.log('🚀 Initialisation de Handtrack.js...');
      
      this.video = document.getElementById(videoElementId);
      this.canvas = document.getElementById(canvasElementId);
      
      if (!this.video || !this.canvas) {
        throw new Error('Éléments vidéo ou canvas introuvables');
      }
      
      this.context = this.canvas.getContext('2d');
      
      // Configuration du modèle
      const modelParams = {
        flipHorizontal: true,   // Effet miroir
        maxNumBoxes: 1,         // Une seule main
        iouThreshold: 0.5,
        scoreThreshold: 0.6,
      };
      
      // Charger le modèle
      console.log('📦 Chargement du modèle...');
      this.model = await handTrack.load(modelParams);
      console.log('✅ Modèle chargé avec succès');
      
      return true;
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
      return false;
    }
  }

  /**
   * Démarrer la détection
   */
  async start() {
    if (!this.model) {
      const initialized = await this.initialize();
      if (!initialized) {
        console.error('❌ Impossible d\'initialiser la détection');
        return false;
      }
    }
    
    try {
      console.log('▶️ Démarrage de la caméra...');
      
      // Démarrer la vidéo
      await handTrack.startVideo(this.video);
      this.isRunning = true;
      
      console.log('✅ Détection de gestes démarrée');
      
      // Démarrer la boucle de détection
      this.runDetection();
      
      return true;
      
    } catch (error) {
      console.error('❌ Erreur lors du démarrage:', error);
      alert('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
      return false;
    }
  }

  /**
   * Arrêter la détection
   */
  stop() {
    this.isRunning = false;
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    if (this.video && this.video.srcObject) {
      handTrack.stopVideo(this.video);
    }
    
    // Effacer le canvas
    if (this.context) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    console.log('⏹️ Détection de gestes arrêtée');
  }

  /**
   * Boucle de détection
   */
  runDetection() {
    if (!this.isRunning) return;
    
    this.model.detect(this.video).then(predictions => {
      // Dessiner les prédictions
      this.model.renderPredictions(predictions, this.canvas, this.context, this.video);
      
      // Analyser les gestes
      this.analyzePredictions(predictions);
      
      // Continuer la boucle
      this.animationId = requestAnimationFrame(() => this.runDetection());
    });
  }

  /**
   * Analyser les prédictions pour détecter les doigts
   */
  analyzePredictions(predictions) {
    if (predictions.length === 0) {
      this.updateDisplay(0, 0);
      this.resetGesture();
      return;
    }
    
    const hand = predictions[0];
    const confidence = Math.round(hand.score * 100);
    
    // Estimation simple du nombre de doigts basée sur la taille de la boîte
    // Plus la main est ouverte, plus la boîte est grande
    const boxWidth = hand.bbox[2];
    const boxHeight = hand.bbox[3];
    const boxArea = boxWidth * boxHeight;
    
    // Calibration empirique (à ajuster selon les tests)
    let fingerCount = 0;
    if (boxArea < 3000) fingerCount = 0;      // Poing fermé
    else if (boxArea < 5000) fingerCount = 1; // 1 doigt
    else if (boxArea < 7000) fingerCount = 2; // 2 doigts
    else if (boxArea < 9000) fingerCount = 3; // 3 doigts
    else if (boxArea < 11000) fingerCount = 4; // 4 doigts
    else fingerCount = 5;                      // Main ouverte
    
    this.updateDisplay(fingerCount, confidence);
    this.handleGestureSequence(fingerCount);
  }

  /**
   * Mettre à jour l'affichage
   */
  updateDisplay(fingerCount, confidence) {
    const countElement = document.getElementById('gesture-count');
    const confidenceElement = document.getElementById('confidence-value');
    
    if (countElement) {
      countElement.textContent = fingerCount;
    }
    
    if (confidenceElement) {
      confidenceElement.textContent = `${confidence}%`;
    }
  }

  /**
   * Gérer la séquence de gestes
   */
  handleGestureSequence(fingerCount) {
    const now = Date.now();
    
    if (this.lastGesture === fingerCount) {
      if (now - this.gestureStartTime >= this.GESTURE_HOLD_TIME) {
        if (this.gestureSequence[this.gestureSequence.length - 1] !== fingerCount) {
          this.gestureSequence.push(fingerCount);
          this.updateSequenceDisplay();
          
          if (this.gestureSequence.length === 3) {
            this.processGestureSequence();
          }
        }
        this.gestureStartTime = now;
      }
    } else {
      this.lastGesture = fingerCount;
      this.gestureStartTime = now;
    }
  }

  /**
   * Réinitialiser le geste en cours
   */
  resetGesture() {
    this.lastGesture = null;
    this.gestureStartTime = null;
  }

  /**
   * Mettre à jour l'affichage de la séquence
   */
  updateSequenceDisplay() {
    const sequenceElement = document.getElementById('sequence-display');
    if (sequenceElement) {
      sequenceElement.textContent = this.gestureSequence.join(' - ');
    }
  }

  /**
   * Traiter la séquence de gestes complète
   */
  processGestureSequence() {
    console.log('🎯 Séquence de gestes détectée:', this.gestureSequence);
    
    const [hours, minutes, seconds] = this.gestureSequence;
    
    console.log(`⏱️ Temps configuré: ${hours}h ${minutes}m ${seconds}s`);
    
    // Envoyer un événement personnalisé
    const event = new CustomEvent('gestureTimeUpdate', {
      detail: { hours, minutes, seconds }
    });
    document.body.dispatchEvent(event);
    
    // Feedback visuel
    this.showSuccessAnimation();
    
    // Réinitialiser la séquence
    setTimeout(() => this.clearSequence(), 2000);
  }

  /**
   * Animation de succès
   */
  showSuccessAnimation() {
    const sequenceElement = document.getElementById('sequence-display');
    if (sequenceElement) {
      const originalColor = sequenceElement.style.color;
      sequenceElement.style.color = '#00ff00';
      sequenceElement.style.fontSize = '14px';
      sequenceElement.style.fontWeight = 'bold';
      
      setTimeout(() => {
        sequenceElement.style.color = originalColor;
        sequenceElement.style.fontSize = '12px';
        sequenceElement.style.fontWeight = 'normal';
      }, 1000);
    }
  }

  /**
   * Effacer la séquence de gestes
   */
  clearSequence() {
    this.gestureSequence = [];
    this.updateSequenceDisplay();
    console.log('🗑️ Séquence effacée');
  }
}

// Créer une instance globale
const gestureDetector = new GestureDetector();

// Fonctions globales pour l'interface
window.startGestureDetection = async () => {
  console.log('👋 Démarrage de la détection de gestes...');
  const success = await gestureDetector.start();
  if (!success) {
    console.error('Échec du démarrage de la détection');
  }
};

window.stopGestureDetection = () => {
  console.log('🛑 Arrêt de la détection de gestes...');
  gestureDetector.stop();
};

window.clearGestureSequence = () => {
  gestureDetector.clearSequence();
};

export default gestureDetector;
