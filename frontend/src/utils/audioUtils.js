class AudioUtilsClass {
  constructor() {
    this.audioContext = null;
    this.isPlaying = false;
    this.currentOscillators = [];
    this.currentGainNodes = [];
    this.currentAudioElements = [];
    this.isAudioEnabled = false;
    this.isMobile = this.detectMobile();
    this.audioActivationAttempts = 0;
    this.maxActivationAttempts = 10;
    
    console.log('🎵 AudioUtils initialisé, mobile détecté:', this.isMobile);
    
    // Sur mobile, essayer d'activer l'audio dès que possible
    if (this.isMobile) {
      this.setupMobileAudioActivation();
    }
  }

  detectMobile() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isMobileUserAgent = /android|ipad|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    
    const mobile = isMobileUserAgent || (isTouchDevice && isSmallScreen);
    console.log('📱 Détection mobile:', {
      userAgent: isMobileUserAgent,
      touch: isTouchDevice,
      smallScreen: isSmallScreen,
      result: mobile
    });
    
    return mobile;
  }

  setupMobileAudioActivation() {
    console.log('📱 Configuration de l\'activation audio mobile');
    
    // Écouter TOUS les types d'événements possibles
    const events = ['touchstart', 'touchend', 'click', 'mousedown', 'keydown', 'scroll', 'focus'];
    
    const activateOnInteraction = async (event) => {
      if (this.audioActivationAttempts < this.maxActivationAttempts) {
        console.log(`🎯 Tentative d'activation audio ${this.audioActivationAttempts + 1}/${this.maxActivationAttempts} via ${event.type}`);
        
        try {
          await this.enableAudio();
          this.audioActivationAttempts++;
          
          // Si réussi, jouer un son test très court
          if (this.isAudioEnabled) {
            console.log('✅ Audio activé avec succès sur mobile');
            // Son test ultra-court pour confirmer l'activation
            await this.generateBeepSound(440, 0.01, 0.001);
          }
        } catch (error) {
          console.log('⚠️ Échec activation audio:', error);
          this.audioActivationAttempts++;
        }
      }
    };

    // Ajouter les écouteurs pour tous les événements
    events.forEach(eventType => {
      document.addEventListener(eventType, activateOnInteraction, { 
        once: false, // Pas "once" pour permettre plusieurs tentatives
        passive: true 
      });
    });

    // Nettoyage après un certain temps
    setTimeout(() => {
      events.forEach(eventType => {
        document.removeEventListener(eventType, activateOnInteraction);
      });
      console.log('🧹 Nettoyage des écouteurs d\'activation audio mobile');
    }, 30000); // 30 secondes
  }

  async enableAudio() {
    try {
      console.log('🔓 Tentative d\'activation du contexte audio...');
      
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('🆕 Nouveau contexte audio créé');
      }

      if (this.audioContext.state === 'suspended') {
        console.log('⏸️ Contexte suspendu, tentative de reprise...');
        await this.audioContext.resume();
        console.log('▶️ Contexte audio repris');
      }

      // Vérification de l'état final
      if (this.audioContext.state === 'running') {
        this.isAudioEnabled = true;
        console.log('✅ Audio activé avec succès, état:', this.audioContext.state);
        
        // Sur mobile, créer et jouer immédiatement un son test silencieux
        if (this.isMobile) {
          console.log('📱 Test audio mobile...');
          const testOscillator = this.audioContext.createOscillator();
          const testGain = this.audioContext.createGain();
          
          testOscillator.connect(testGain);
          testGain.connect(this.audioContext.destination);
          
          // Son ultra-court et silencieux
          testOscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
          testGain.gain.setValueAtTime(0.001, this.audioContext.currentTime);
          testGain.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + 0.01);
          
          testOscillator.start(this.audioContext.currentTime);
          testOscillator.stop(this.audioContext.currentTime + 0.01);
          
          console.log('🔊 Test audio mobile effectué');
        }
        
        return true;
      } else {
        console.log('❌ Impossible d\'activer l\'audio, état:', this.audioContext.state);
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'activation audio:', error);
      return false;
    }
  }

  async generateBeepSound(frequency = 800, duration = 0.2, volume = 0.3) {
    if (!await this.enableAudio()) {
      console.log('⚠️ Audio non disponible pour le beep');
      
      // Fallback vibration sur mobile
      if (this.isMobile && navigator.vibrate) {
        console.log('📳 Fallback vibration');
        navigator.vibrate(100);
      }
      return;
    }

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.8, this.audioContext.currentTime + duration);

      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);

      // Garder une référence pour pouvoir l'arrêter
      this.currentOscillators.push(oscillator);
      this.currentGainNodes.push(gainNode);

      // Nettoyer après la fin du son
      oscillator.onended = () => {
        this.currentOscillators = this.currentOscillators.filter(osc => osc !== oscillator);
        this.currentGainNodes = this.currentGainNodes.filter(gain => gain !== gainNode);
      };

    } catch (error) {
      console.error('❌ Erreur génération beep:', error);
      
      // Fallback vibration sur mobile
      if (this.isMobile && navigator.vibrate) {
        console.log('📳 Fallback vibration pour beep');
        navigator.vibrate(duration * 1000);
      }
    }
  }

  async playAlarmSequence(alarmType = 'classic') {
    console.log('🚨 Démarrage séquence d\'alarme:', alarmType);
    
    if (!await this.enableAudio()) {
      console.log('⚠️ Audio non disponible pour l\'alarme');
      
      // Fallback vibration intensive sur mobile
      if (this.isMobile && navigator.vibrate) {
        console.log('📳 Fallback vibration d\'alarme');
        const vibrateAlarm = () => {
          if (this.isPlaying) {
            navigator.vibrate([500, 200, 500, 200, 500]);
            setTimeout(vibrateAlarm, 2000);
          }
        };
        this.isPlaying = true;
        vibrateAlarm();
      }
      return;
    }

    this.stopCurrentAudio();
    this.isPlaying = true;

    const playAlarmLoop = () => {
      if (!this.isPlaying) return;

      try {
        switch (alarmType) {
          case 'classic':
            this.playClassicAlarm();
            break;
          case 'gentle':
            this.playGentleAlarm();
            break;
          case 'urgent':
            this.playUrgentAlarm();
            break;
          case 'digital':
            this.playDigitalAlarm();
            break;
          case 'nature':
            this.playNatureAlarm();
            break;
          default:
            this.playClassicAlarm();
        }

        // Répéter l'alarme toutes les 3 secondes
        setTimeout(playAlarmLoop, 3000);
      } catch (error) {
        console.error('❌ Erreur dans la boucle d\'alarme:', error);
        
        // Fallback vibration si le son échoue
        if (this.isMobile && navigator.vibrate && this.isPlaying) {
          navigator.vibrate([300, 100, 300]);
          setTimeout(playAlarmLoop, 2000);
        }
      }
    };

    playAlarmLoop();
  }

  playClassicAlarm() {
    if (!this.audioContext) return;
    
    console.log('🔔 Alarme classique');
    
    // Double bip caractéristique
    const frequencies = [800, 1000];
    
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        if (this.isPlaying) {
          this.createAlarmTone(freq, 0.4, 0.5);
        }
      }, index * 500);
    });
  }

  playGentleAlarm() {
    if (!this.audioContext) return;
    
    console.log('🌸 Alarme douce');
    
    // Montée progressive douce
    const frequencies = [400, 450, 500, 550, 600];
    
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        if (this.isPlaying) {
          this.createAlarmTone(freq, 0.3, 0.2);
        }
      }, index * 200);
    });
  }

  playUrgentAlarm() {
    if (!this.audioContext) return;
    
    console.log('🚨 Alarme urgente');
    
    // Sirène rapide
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        if (this.isPlaying) {
          this.createAlarmTone(1200 - (i % 2) * 400, 0.6, 0.2);
        }
      }, i * 250);
    }
  }

  playDigitalAlarm() {
    if (!this.audioContext) return;
    
    console.log('💻 Alarme digitale');
    
    // Séquence digitale
    const pattern = [880, 1760, 880, 1760, 1320];
    
    pattern.forEach((freq, index) => {
      setTimeout(() => {
        if (this.isPlaying) {
          this.createAlarmTone(freq, 0.4, 0.15);
        }
      }, index * 150);
    });
  }

  playNatureAlarm() {
    if (!this.audioContext) return;
    
    console.log('🌿 Alarme nature');
    
    // Simulation d'oiseaux
    const frequencies = [1500, 1800, 1200, 1600, 1400];
    
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        if (this.isPlaying) {
          this.createAlarmTone(freq, 0.3, 0.3, 'sine');
        }
      }, index * 300);
    });
  }

  createAlarmTone(frequency, volume, duration, waveType = 'square') {
    if (!this.audioContext || !this.isPlaying) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.type = waveType;
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      const startTime = this.audioContext.currentTime;
      const stopTime = startTime + duration;

      oscillator.start(startTime);
      oscillator.stop(stopTime);

      this.currentOscillators.push(oscillator);
      this.currentGainNodes.push(gainNode);

      oscillator.onended = () => {
        this.currentOscillators = this.currentOscillators.filter(osc => osc !== oscillator);
        this.currentGainNodes = this.currentGainNodes.filter(gain => gain !== gainNode);
      };

    } catch (error) {
      console.error('❌ Erreur création ton d\'alarme:', error);
    }
  }

  async playCustomSound(audioData, loop = false) {
    console.log('🎵 Lecture son personnalisé, loop:', loop);
    
    if (!await this.enableAudio()) {
      console.log('⚠️ Audio non disponible pour le son personnalisé');
      return;
    }

    try {
      this.stopCurrentAudio();
      this.isPlaying = true;

      let audioBuffer;
      
      if (typeof audioData === 'string') {
        // Base64 data URL
        const response = await fetch(audioData);
        const arrayBuffer = await response.arrayBuffer();
        audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      } else if (audioData instanceof ArrayBuffer) {
        audioBuffer = await this.audioContext.decodeAudioData(audioData);
      } else {
        throw new Error('Format audio non supporté');
      }

      const playSound = () => {
        if (!this.isPlaying) return;

        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = audioBuffer;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        gainNode.gain.setValueAtTime(0.7, this.audioContext.currentTime);
        
        this.currentAudioElements.push(source);
        this.currentGainNodes.push(gainNode);

        source.onended = () => {
          this.currentAudioElements = this.currentAudioElements.filter(src => src !== source);
          this.currentGainNodes = this.currentGainNodes.filter(gain => gain !== gainNode);
          
          if (loop && this.isPlaying) {
            setTimeout(playSound, 500); // Pause de 500ms entre les répétitions
          }
        };

        source.start();
      };

      playSound();

    } catch (error) {
      console.error('❌ Erreur lecture son personnalisé:', error);
      this.isPlaying = false;
      
      // Fallback sur alarme classique
      console.log('🔄 Fallback sur alarme classique');
      this.playAlarmSequence('classic');
    }
  }

  async toggleCustomSound(audioData) {
    console.log('🔄 Toggle son personnalisé');
    
    if (this.isPlaying) {
      this.stopCurrentAudio();
      return false; // Son arrêté
    } else {
      await this.playCustomSound(audioData, false);
      return true; // Son lancé
    }
  }

  isAudioPlaying() {
    return this.isPlaying || this.currentOscillators.length > 0 || this.currentAudioElements.length > 0;
  }

  async playAlarmById(alarmId, isCustom = false) {
    console.log('🎵 Lecture alarme par ID:', alarmId, 'isCustom:', isCustom);
    
    if (isCustom) {
      // Pour les alarmes personnalisées, nous avons besoin des données audio
      console.log('⚠️ Alarme personnalisée demandée mais pas de données audio fournies');
      return;
    } else {
      // Pour les alarmes par défaut
      await this.playAlarmSequence(alarmId);
    }
  }

  validateAudioFile(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const supportedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm'];
    
    if (file.size > maxSize) {
      throw new Error('Le fichier est trop volumineux (max 5MB)');
    }
    
    if (!supportedTypes.includes(file.type)) {
      throw new Error('Format de fichier non supporté. Utilisez MP3, WAV, OGG, M4A ou WebM');
    }
    
    console.log('✅ Fichier audio valide:', file.name, file.type, (file.size / 1024 / 1024).toFixed(1) + 'MB');
    return true;
  }

  stopCurrentAudio() {
    console.log('🔇 Arrêt de tous les sons');
    
    this.isPlaying = false;

    // Arrêter tous les oscillateurs
    this.currentOscillators.forEach(oscillator => {
      try {
        oscillator.stop();
      } catch (error) {
        console.log('⚠️ Erreur arrêt oscillateur:', error);
      }
    });

    // Arrêter tous les gains
    this.currentGainNodes.forEach(gainNode => {
      try {
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
      } catch (error) {
        console.log('⚠️ Erreur fade out gain:', error);
      }
    });

    // Arrêter tous les éléments audio
    this.currentAudioElements.forEach(element => {
      try {
        element.stop();
      } catch (error) {
        console.log('⚠️ Erreur arrêt élément audio:', error);
      }
    });

    // Vider les tableaux
    this.currentOscillators = [];
    this.currentGainNodes = [];
    this.currentAudioElements = [];

    console.log('✅ Tous les sons arrêtés');
  }

  // Méthodes utilitaires pour l'interface
  isAudioContextAvailable() {
    return !!(window.AudioContext || window.webkitAudioContext);
  }

  getAudioState() {
    return {
      isEnabled: this.isAudioEnabled,
      isPlaying: this.isPlaying,
      contextState: this.audioContext ? this.audioContext.state : 'none',
      isMobile: this.isMobile,
      activationAttempts: this.audioActivationAttempts
    };
  }

  // Diagnostic pour debug
  diagnoseAudio() {
    console.log('🔍 Diagnostic audio:', {
      isContextAvailable: this.isAudioContextAvailable(),
      audioContext: this.audioContext,
      contextState: this.audioContext?.state,
      isEnabled: this.isAudioEnabled,
      isPlaying: this.isPlaying,
      isMobile: this.isMobile,
      oscillators: this.currentOscillators.length,
      gainNodes: this.currentGainNodes.length,
      audioElements: this.currentAudioElements.length,
      activationAttempts: this.audioActivationAttempts
    });
  }

  // Get default alarm configurations
  getDefaultAlarms() {
    return [
      {
        id: 'classic',
        name: 'Classique',
        description: 'Son d\'alarme traditionnel',
        isCustom: false
      },
      {
        id: 'gentle',
        name: 'Douce',
        description: 'Alarme progressive et douce',
        isCustom: false
      },
      {
        id: 'urgent',
        name: 'Urgente',
        description: 'Alarme forte et insistante',
        isCustom: false
      },
      {
        id: 'digital',
        name: 'Digitale',
        description: 'Son électronique moderne',
        isCustom: false
      },
      {
        id: 'nature',
        name: 'Nature',
        description: 'Sons naturels apaisants',
        isCustom: false
      }
    ];
  }
}

// Instance singleton
export const AudioUtils = new AudioUtilsClass();

// Export par défaut pour compatibilité
export default AudioUtils;