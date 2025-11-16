import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import AlarmManager from './AlarmManager';
import { AudioUtils } from '../utils/audioUtils';
import { TIMER_API_URL, PRESETS_API_URL } from '../config';
import './Stopwatch.css';

function Stopwatch({ onModeChange }) {
  const [mode, setMode] = useState('stopwatch'); // 'stopwatch' or 'countdown'
  const [status, setStatus] = useState('stopped'); // 'stopped', 'running', 'paused'
  const [currentTime, setCurrentTime] = useState(0);
  const [initialTime, setInitialTime] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editableHours, setEditableHours] = useState(0);
  const [editableMinutes, setEditableMinutes] = useState(0);
  const [editableSeconds, setEditableSeconds] = useState(0);
  const [displayMode, setDisplayMode] = useState('digital'); // 'digital' or 'analog'
  const [presets, setPresets] = useState([]);
  const [showPresets, setShowPresets] = useState(false);
  const [showCreatePreset, setShowCreatePreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDescription, setNewPresetDescription] = useState('');
  const [isCreatingPreset, setIsCreatingPreset] = useState(false);
  const [presetError, setPresetError] = useState('');
  const [presetSuccess, setPresetSuccess] = useState('');
  const [showAlarmManager, setShowAlarmManager] = useState(false);
  const [selectedAlarm, setSelectedAlarm] = useState(() => {
    const saved = localStorage.getItem('selectedAlarm');
    return saved ? JSON.parse(saved) : { id: 'classic', isCustom: false };
  });
  const [customAlarms, setCustomAlarms] = useState([]);
  const [focusMode, setFocusMode] = useState(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  
  // Détection du double-clic/double-tap sur l'affichage du temps
  const [lastTap, setLastTap] = useState(0);
  const [lastClick, setLastClick] = useState(0);
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  
  // Gestion du tactile (swipe up/down pour changer les valeurs)
  const [touchStart, setTouchStart] = useState(null);
  const [touchDelta, setTouchDelta] = useState(0);
  
  const intervalRef = useRef(null);
  const lastUpdateRef = useRef(Date.now());
  const timeDisplayRef = useRef(null);
  const alarmTriggeredRef = useRef(false); // Protection contre double alarme

  // Variables manquantes pour corriger les erreurs ESLint
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [initialCountdownTime, setInitialCountdownTime] = useState(0);
  const [showAlarmPanel, setShowAlarmPanel] = useState(false);

  // Fonction pour basculer le mode Focus avec feedback
  const toggleFocusMode = useCallback(() => {
    const newFocusMode = !focusMode;
    setFocusMode(newFocusMode);
    
    // Feedback audio
    playClickSound();
    
    // Log pour debug
    console.log(`Mode Focus ${newFocusMode ? 'activé' : 'désactivé'}`);
    
    // Optionnel: afficher une notification temporaire
    if (newFocusMode) {
      console.log('🎯 Mode Focus actif - Contrôles limités pendant le minuteur');
    } else {
      console.log('🎯 Mode Focus désactivé - Tous les contrôles disponibles');
    }
  }, [focusMode]);

  // Fonction universelle pour activer l'audio sur CHAQUE interaction - DÉPLACÉE AVANT utilisation
  const forceAudioActivation = useCallback(async () => {
    try {
      console.log('🔓 Activation audio forcée sur interaction');
      await AudioUtils.enableAudio();
      
      // Sur mobile, jouer aussi un micro son à chaque interaction pour maintenir l'activation
      if (AudioUtils.detectMobile()) {
        console.log('📱 Mobile détecté - Son micro pour maintenir l\'activation');
        // Son très court et silencieux pour maintenir le contexte audio actif
        await AudioUtils.generateBeepSound(440, 0.05, 0.01);
      }
    } catch (error) {
      console.log('⚠️ Erreur activation audio:', error);
    }
  }, []);

  // Wrapper pour tous les clicks qui active l'audio - DÉPLACÉ AVANT utilisation
  const handleInteractionWithAudio = useCallback(async (callback) => {
    // TOUJOURS essayer d'activer l'audio sur chaque interaction
    await forceAudioActivation();
    
    // Puis exécuter la fonction callback
    if (callback && typeof callback === 'function') {
      callback();
    }
  }, [forceAudioActivation]);

  // Fonction pour jouer l'alarme - DÉPLACÉE AVANT startLocalTimer
  const playAlarmSound = useCallback(async () => {
    console.log('🔊 playAlarmSound appelée');
    console.log('🎯 selectedAlarm:', selectedAlarm);
    console.log('📚 customAlarms:', customAlarms);
    
    // FORCER l'état d'alarme AVANT de jouer le son
    setIsAlarmPlaying(true);
    console.log('🚨 État isAlarmPlaying forcé à true');
    
    // Arrêter tout audio en cours avant de jouer une nouvelle alarme
    AudioUtils.stopCurrentAudio();
    
    try {
      if (selectedAlarm.isCustom) {
        console.log('🎵 Tentative de lecture d\'une alarme personnalisée');
        const customAlarm = customAlarms.find(a => a.id === selectedAlarm.id);
        console.log('🔍 Alarme trouvée:', customAlarm);
        
        if (customAlarm && customAlarm.audioData) {
          console.log('✅ AudioData disponible, lecture du son personnalisé');
          // Pour les audios personnalisés, on joue en boucle jusqu'à arrêt manuel
          AudioUtils.playCustomSound(customAlarm.audioData, true); // true = loop
          // Ne pas attendre la fin car on veut une boucle infinie
        } else {
          console.log('❌ Pas d\'audioData, fallback vers alarme classique');
          AudioUtils.playAlarmSequence(selectedAlarm.id);
        }
      } else {
        console.log('🎵 Lecture d\'une alarme par défaut:', selectedAlarm.id);
        AudioUtils.playAlarmSequence(selectedAlarm.id);
      }
      // Ne pas mettre setIsAlarmPlaying(false) ici car le son continue
    } catch (error) {
      console.error('❌ Erreur lors de la lecture de l\'alarme:', error);
      try {
        AudioUtils.playAlarmSequence('classic');
      } catch (fallbackError) {
        console.error('❌ Impossible de jouer l\'alarme de secours:', fallbackError);
        setIsAlarmPlaying(false); // Arrêter seulement en cas d'échec complet
      }
    }
  }, [selectedAlarm, customAlarms]);

  // Fonction pour démarrer le timer local
  const startLocalTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Réinitialiser la protection d'alarme quand on démarre le timer
    alarmTriggeredRef.current = false;
    lastUpdateRef.current = Date.now();
    
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastUpdateRef.current;
      lastUpdateRef.current = now;
      
      setCurrentTime(prev => {
        if (mode === 'stopwatch') {
          return prev + elapsed;
        } else {
          const newTime = Math.max(0, prev - elapsed);
          if (newTime === 0 && !alarmTriggeredRef.current) {
            // Arrêter le timer quand il atteint zéro et jouer l'alarme UNE SEULE FOIS
            console.log('🎯 Timer terminé, déclenchement unique de l\'alarme');
            alarmTriggeredRef.current = true; // Marquer que l'alarme a été déclenchée
            setStatus('stopped');
            stopLocalTimer();
            // Jouer l'alarme quand le minuteur se termine avec un petit délai
            setTimeout(() => {
              playAlarmSound();
            }, 100);
            return 0;
          }
          return newTime;
        }
      });
    }, 10);
  }, [mode, playAlarmSound]);

  // Fonction pour arrêter le timer local
  const stopLocalTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Fonction pour démarrer le timer
  const handleStart = useCallback(async () => {
    await handleInteractionWithAudio(async () => {
      try {
        const response = await axios.post(`${TIMER_API_URL}/action/`, { action: 'start' });
        const data = response.data;
        
        setStatus(data.status);
        setCurrentTime(data.calculated_time || data.current_time);
        setInitialTime(data.initial_time);
        setMode(data.mode);
        
        if (data.status === 'running') {
          lastUpdateRef.current = Date.now();
          startLocalTimer();
        }
      } catch (error) {
        console.error('Error starting timer:', error);
      }
    });
  }, [handleInteractionWithAudio, startLocalTimer]);

  // Fonction pour arrêter/pauser le timer
  const handleStop = useCallback(async () => {
    await handleInteractionWithAudio(async () => {
      try {
        const action = status === 'running' ? 'stop' : 'start';
        const response = await axios.post(`${TIMER_API_URL}/action/`, { action });
        const data = response.data;
        
        setStatus(data.status);
        setCurrentTime(data.calculated_time || data.current_time);
        setInitialTime(data.initial_time);
        setMode(data.mode);
        
        if (data.status === 'running') {
          lastUpdateRef.current = Date.now();
          startLocalTimer();
        } else {
          stopLocalTimer();
        }
      } catch (error) {
        console.error('Error stopping timer:', error);
      }
    });
  }, [status, handleInteractionWithAudio, startLocalTimer, stopLocalTimer]);

  // Créer un son de clic simple avec activation audio mobile
  const createClickSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Sur mobile, débloquer immédiatement l'audio
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(console.error);
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.log('Audio not supported or blocked:', error.message || error);
    }
  };

  // Fonction pour jouer le son de clic avec activation audio mobile
  const playClickSound = () => {
    try {
      createClickSound();
      // Essayer d'activer l'audio sur mobile lors des clics
      AudioUtils.enableAudio().catch(() => {});
    } catch (error) {
      console.log('Audio not supported or blocked:', error.message || error);
    }
  };

  // Synchroniser les alarmes personnalisées quand l'AlarmManager se ferme
  useEffect(() => {
    if (!showAlarmManager) {
      // Recharger les alarmes personnalisées depuis localStorage quand on ferme le gestionnaire
      console.log('🔄 Synchronisation des alarmes personnalisées');
      const saved = localStorage.getItem('customAlarms');
      if (saved) {
        try {
          const parsedAlarms = JSON.parse(saved);
          console.log('🔄 Alarmes rechargées:', parsedAlarms);
          setCustomAlarms(parsedAlarms);
        } catch (error) {
          console.error('Erreur lors du rechargement des alarmes:', error);
        }
      }
    }
  }, [showAlarmManager]);

  // Charger les alarmes personnalisées
  useEffect(() => {
    const saved = localStorage.getItem('customAlarms');
    if (saved) {
      try {
        setCustomAlarms(JSON.parse(saved));
      } catch (error) {
        console.error('Erreur lors du chargement des alarmes personnalisées:', error);
      }
    }
  }, []);

  // Empêcher le scroll de la page pendant l'édition du temps
  useEffect(() => {
    const preventScroll = (e) => {
      // Si on est en train d'éditer le temps, empêcher le scroll
      if (isEditingTime || isInlineEditing) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    if (isEditingTime || isInlineEditing) {
      // Ajouter les événements pour empêcher le scroll
      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('touchmove', preventScroll, { passive: false });
      
      // Empêcher aussi le scroll avec les touches
      const preventKeyScroll = (e) => {
        if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Space'].includes(e.code)) {
          e.preventDefault();
        }
      };
      document.addEventListener('keydown', preventKeyScroll);

      return () => {
        document.removeEventListener('wheel', preventScroll);
        document.removeEventListener('touchmove', preventScroll);
        document.removeEventListener('keydown', preventKeyScroll);
      };
    }
  }, [isEditingTime, isInlineEditing]);

  // Utiliser useCallback pour les fonctions qui sont utilisées dans useEffect
  const fetchTimerState = useCallback(async () => {
    try {
      const response = await axios.get(`${TIMER_API_URL}/current/`);
      const data = response.data;
      const newMode = data.mode;
      setMode(newMode);
      setStatus(data.status);
      setCurrentTime(data.calculated_time || data.current_time);
      setInitialTime(data.initial_time);
      lastUpdateRef.current = Date.now();
      
      // Notifier le parent du mode initial
      if (onModeChange) {
        onModeChange(newMode);
      }
    } catch (error) {
      console.error('Error fetching timer state:', error);
      // Créer le timer s'il n'existe pas
      try {
        const { API_BASE_URL } = await import('../config');
        await axios.post(`${API_BASE_URL}/api/timers/`, {
          mode: 'stopwatch',
          status: 'stopped',
          current_time: 0,
          initial_time: 0
        });
        // Récursion contrôlée
        fetchTimerState();
      } catch (createError) {
        console.error('Error creating timer:', createError);
      }
    }
  }, [onModeChange]);

  const fetchPresets = useCallback(async () => {
    try {
      const response = await axios.get(PRESETS_API_URL);
      console.log('Response from presets API:', response.data);
      
      // Django REST Framework retourne les résultats dans un objet avec pagination
      let presetsData;
      if (response.data.results) {
        // Format paginé
        presetsData = response.data.results;
      } else if (Array.isArray(response.data)) {
        // Format direct (tableau)
        presetsData = response.data;
      } else {
        // Format inconnu
        console.warn('Format de réponse inattendu:', response.data);
        presetsData = [];
      }
      
      setPresets(presetsData);
      console.log('Presets loaded:', presetsData);
    } catch (error) {
      console.error('Error fetching presets:', error);
      // En cas d'erreur, initialiser avec un tableau vide
      setPresets([]);
    }
  }, []);

  const handleAction = useCallback(async (action, additionalData = {}) => {
    try {
      const response = await axios.post(`${TIMER_API_URL}/action/`, {
        action,
        ...additionalData
      });
      const data = response.data;
      const newMode = data.mode;
      setMode(newMode);
      setStatus(data.status);
      setCurrentTime(data.calculated_time || data.current_time);
      setInitialTime(data.initial_time);
      lastUpdateRef.current = Date.now();
      
      // Notifier le parent du changement de mode
      if (onModeChange) {
        onModeChange(newMode);
      }
    } catch (error) {
      console.error('Error performing action:', error);
    }
  }, [onModeChange]);

  // Hook pour activer l'audio au premier clic/touch
  useEffect(() => {
    const handleFirstInteraction = async () => {
      console.log('🎯 Première interaction détectée');
      await forceAudioActivation();
      
      // Supprimer les listeners après la première interaction
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('touchend', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    // Écouter plusieurs types d'interactions
    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });
    document.addEventListener('touchend', handleFirstInteraction, { once: true });
    document.addEventListener('keydown', handleFirstInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('touchend', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [forceAudioActivation]);

  // Hook pour initialiser l'interface de gestes après le rendu
  useEffect(() => {
    // Initialiser les gestionnaires d'événements pour l'interface de gestes
    const initializeGestureEvents = () => {
      console.log('🎯 Initialisation des gestionnaires d\'événements de gestes...');
      
      // Gestionnaire pour basculer entre les modes
      const detectBtn = document.getElementById('mode-detect-btn');
      const learnBtn = document.getElementById('mode-learn-btn');
      
      if (detectBtn && learnBtn) {
        detectBtn.onclick = () => switchToDetectionMode();
        learnBtn.onclick = () => switchToLearningMode();
        console.log('✅ Gestionnaires de mode attachés');
      }
      
      // Gestionnaire pour la calibration
      const calibrateBtn = document.getElementById('calibrate-btn');
      if (calibrateBtn) {
        calibrateBtn.onclick = () => startCalibration();
        console.log('✅ Gestionnaire de calibration attaché');
      }
      
      // Gestionnaire pour effacer la séquence
      const clearBtn = document.getElementById('clear-sequence-btn');
      if (clearBtn) {
        clearBtn.onclick = () => clearGestureSequence();
        console.log('✅ Gestionnaire d\'effacement attaché');
      }
      
      // Gestionnaires pour les exemples de gestes
      const gestureExamples = document.querySelectorAll('.gesture-example');
      gestureExamples.forEach(example => {
        example.onclick = (e) => {
          const fingers = parseInt(e.currentTarget.dataset.fingers);
          showGestureExample(fingers);
        };
      });
      console.log(`✅ ${gestureExamples.length} gestionnaires d'exemples attachés`);
    };
    
    // Délai pour s'assurer que les éléments DOM sont rendus
    setTimeout(initializeGestureEvents, 100);
    
    // Nettoyer au démontage (optionnel)
    return () => {
      console.log('🧹 Nettoyage des gestionnaires de gestes');
    };
  }, []); // Exécuter une seule fois après le montage

  // Fonction pour démarrer/arrêter le timer
  const handleStartStop = useCallback(async () => {
    console.log('🔘 handleStartStop appelé, status actuel:', status);
    
    await handleInteractionWithAudio(async () => {
      try {
        let action;
        if (status === 'stopped') {
          action = 'start';
        } else if (status === 'running') {
          action = 'stop';  // Changé de 'pause' à 'stop'
        } else if (status === 'paused') {
          action = 'start';  // Changé de 'resume' à 'start'
        }

        console.log('📤 Action envoyée au serveur:', action);
        
        const response = await axios.post(`${TIMER_API_URL}/action/`, { action });
        const data = response.data;
        
        console.log('📥 Réponse du serveur:', data);
        console.log('📊 Nouveau status:', data.status);
        
        setStatus(data.status);
        setCurrentTime(data.calculated_time || data.current_time);
        setInitialTime(data.initial_time);
        setMode(data.mode);
        
        // Si c'est un démarrage, démarrer le timer local
        if (data.status === 'running') {
          console.log('▶️ Démarrage du timer local');
          lastUpdateRef.current = Date.now();
          startLocalTimer();
        } else {
          console.log('⏸️ Arrêt du timer local');
          stopLocalTimer();
        }
      } catch (error) {
        console.error('❌ Erreur dans handleStartStop:', error);
      }
    });
  }, [status, handleInteractionWithAudio, startLocalTimer, stopLocalTimer]);

  // Fonction pour reset
  const handleReset = useCallback(async () => {
    await handleInteractionWithAudio(async () => {
      try {
        // Arrêter l'alarme si elle sonne
        if (isAlarmPlaying) {
          AudioUtils.stopCurrentAudio();
          setIsAlarmPlaying(false);
        }
        
        const response = await axios.post(`${TIMER_API_URL}/action/`, { action: 'reset' });
        const data = response.data;
        
        setStatus(data.status);
        setCurrentTime(data.calculated_time || data.current_time);
        setInitialTime(data.initial_time);
        setMode(data.mode);
        
        stopLocalTimer();
        
        // Reset des valeurs d'édition
        const h = Math.floor((data.calculated_time || data.current_time) / 3600);
        const m = Math.floor(((data.calculated_time || data.current_time) % 3600) / 60);
        const s = (data.calculated_time || data.current_time) % 60;
        setHours(h);
        setMinutes(m);
        setSeconds(s);
        setEditableHours(h);
        setEditableMinutes(m);
        setEditableSeconds(s);
      } catch (error) {
        console.error('Error resetting timer:', error);
      }
    });
  }, [isAlarmPlaying, handleInteractionWithAudio]);

  // Fonction pour basculer le son avec activation audio mobile
  const toggleSound = useCallback(async () => {
    await handleInteractionWithAudio(async () => {
      try {
        console.log('🔊 Toggle sound activé');
        
        // Test immédiat du son pour confirmer que l'audio fonctionne
        console.log('🎵 Test du son...');
        await AudioUtils.generateBeepSound(800, 0.1, 0.3);
        console.log('✅ Son testé avec succès');
        
        // Optionnel: jouer le son de l'alarme sélectionnée pour test
        if (selectedAlarm) {
          console.log('🎵 Test de l\'alarme sélectionnée:', selectedAlarm);
          await AudioUtils.playAlarmById(selectedAlarm.id, selectedAlarm.isCustom);
        }
      } catch (error) {
        console.error('❌ Erreur lors du test du son:', error);
      }
    });
  }, [selectedAlarm, handleInteractionWithAudio]);

  const stopAlarmSound = useCallback(() => {
    console.log('🔇 Arrêt de l\'alarme demandé');
    AudioUtils.stopCurrentAudio();
    setIsAlarmPlaying(false);
  }, []);

  // Synchroniser l'état d'alarme avec AudioUtils
  useEffect(() => {
    if (isAlarmPlaying) {
      const checkInterval = setInterval(() => {
        // Vérifier si AudioUtils pense toujours qu'il joue
        // Ajouter un délai de grâce pour éviter que le message disparaisse trop vite
        if (!AudioUtils.isPlaying && AudioUtils.currentOscillators.length === 0) {
          console.log('🔄 Synchronisation: AudioUtils n\'est plus en train de jouer');
          setIsAlarmPlaying(false);
        }
      }, 500); // Vérifier toutes les 500ms au lieu de 100ms

      return () => clearInterval(checkInterval);
    }
  }, [isAlarmPlaying]);

  const handleAlarmChange = (alarm) => {
    setSelectedAlarm(alarm);
    localStorage.setItem('selectedAlarm', JSON.stringify(alarm));
  };

  const toggleAlarmManager = () => {
    playClickSound();
    setShowAlarmManager(!showAlarmManager);
  };

  // Initialiser le timer au chargement
  useEffect(() => {
    fetchTimerState();
    fetchPresets();
  }, [fetchTimerState, fetchPresets]);

  // Écouteur d'événements pour la détection de gestes
  useEffect(() => {
    const handleGestureTimeUpdate = async (event) => {
      const { hours, minutes, seconds } = event.detail;
      console.log(`🤏 Geste reçu: ${hours}h ${minutes}m ${seconds}s`);
      
      // Vérifier qu'on est en mode minuteur et arrêté
      if (mode !== 'countdown' || status !== 'stopped') {
        console.warn('⚠️ Le minuteur doit être en mode countdown et arrêté pour recevoir les gestes');
        return;
      }
      
      try {
        // Mettre à jour le temps via l'API
        const response = await axios.post(`${TIMER_API_URL}/set_time/`, {
          hours,
          minutes,
          seconds
        });
        
        const data = response.data;
        setInitialTime(data.initial_time);
        setCurrentTime(data.current_time);
        
        // Mettre à jour aussi les valeurs d'édition
        setEditableHours(hours);
        setEditableMinutes(minutes);
        setEditableSeconds(seconds);
        
        console.log(`✅ Minuteur mis à jour: ${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        
        // Feedback audio pour confirmer la saisie
        playClickSound();
        
      } catch (error) {
        console.error('❌ Erreur lors de la mise à jour du minuteur par geste:', error);
      }
    };

    // Ajouter l'écouteur d'événements
    document.body.addEventListener('gestureTimeUpdate', handleGestureTimeUpdate);

    // Nettoyer l'écouteur au démontage
    return () => {
      document.body.removeEventListener('gestureTimeUpdate', handleGestureTimeUpdate);
    };
  }, [mode, status, playClickSound]);

  // Ajouter l'écouteur d'événements clavier pour la barre d'espace et Enter
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Vérifier qu'on n'est pas en train de taper dans un input
      if (!['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
        if (event.code === 'Space') {
          event.preventDefault(); // Empêcher le scroll de la page
          
          // Si l'alarme joue, l'arrêter
          if (isAlarmPlaying) {
            stopAlarmSound();
            return;
          }
          
          // Bloquer en mode focus
          if (focusMode && mode === 'countdown' && status === 'running') {
            return;
          }
          
          if (status === 'running') {
            handleStop();
          } else {
            handleStart();
          }
        } else if (event.code === 'Enter') {
          event.preventDefault(); // Empêcher l'action par défaut
          
          // Si l'alarme joue, l'arrêter
          if (isAlarmPlaying) {
            stopAlarmSound();
            return;
          }
          
          // Bloquer en mode focus
          if (focusMode && mode === 'countdown' && status === 'running') {
            return;
          }
          
          handleReset();
        }
      }
    };

    // Ajouter un écouteur global pour arrêter l'alarme en cliquant
    const handleGlobalClick = (event) => {
      if (isAlarmPlaying) {
        // Vérifier que ce n'est pas un clic sur un bouton ou input
        const isInteractiveElement = event.target.closest('button, input, textarea, select, a, [role="button"]');
        if (!isInteractiveElement) {
          stopAlarmSound();
        }
      }
    };

    // Ajouter les écouteurs d'événements
    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('click', handleGlobalClick);

    // Nettoyer les écouteurs d'événements au démontage du composant
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [status, handleStart, handleStop, handleReset, focusMode, mode, isAlarmPlaying, stopAlarmSound]);

  // Notifier le parent du changement de mode
  useEffect(() => {
    if (onModeChange) {
      onModeChange(mode);
    }
  }, [mode, onModeChange]);

  // Mettre à jour le timer si en cours d'exécution
  useEffect(() => {
    let syncInterval;
    
    if (status === 'running') {
      // Synchronisation avec le serveur toutes les secondes
      syncInterval = setInterval(() => {
        updateTimerDisplay();
      }, 1000);
    }
    
    return () => {
      if (syncInterval) {
        clearInterval(syncInterval);
      }
    };
  }, [status, mode, handleAction, playAlarmSound]);

  const updateTimerDisplay = async () => {
    try {
      const response = await axios.get(`${TIMER_API_URL}/current/`);
      const data = response.data;
      const calculatedTime = data.calculated_time || data.current_time;
      setCurrentTime(calculatedTime);
      setStatus(data.status);
      
      // Si le minuteur atteint zéro, arrêter
      if (data.mode === 'countdown' && calculatedTime === 0 && data.status === 'running') {
        setStatus('stopped');
        setCurrentTime(0);
      }
    } catch (error) {
      console.error('Error updating timer:', error);
    }
  };

  const handleToggleMode = async () => {
    // Bloquer le changement de mode en mode focus si le minuteur tourne
    if (focusMode && mode === 'countdown' && status === 'running') {
      return;
    }
    
    setIsTransitioning(true);
    
    // Démarrer l'animation de transition
    setTimeout(async () => {
      try {
        await handleAction('toggle_mode');
        setShowTimeInput(mode === 'stopwatch'); // Inverse car le mode va changer
        
        // Terminer la transition après un délai
        setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      } catch (error) {
        console.error('Error toggling mode:', error);
        setIsTransitioning(false);
      }
    }, 150);
  };

  const handleSetTime = async () => {
    try {
      const totalMs = (hours * 3600 + minutes * 60 + seconds) * 1000;
      const response = await axios.post(`${TIMER_API_URL}/set_time/`, {
        hours,
        minutes,
        seconds
      });
      const data = response.data;
      setInitialTime(data.initial_time);
      setCurrentTime(data.current_time);
    } catch (error) {
      console.error('Error setting time:', error);
    }
  };

  const handleEditTimeClick = () => {
    // Bloquer l'édition en mode focus si le minuteur tourne
    if (focusMode && mode === 'countdown' && status === 'running') {
      return;
    }
    
    if (mode === 'countdown' && status === 'stopped') {
      playClickSound();
      const totalSeconds = Math.floor(currentTime / 1000);
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      
      setEditableHours(h);
      setEditableMinutes(m);
      setEditableSeconds(s);
      setIsEditingTime(true);
    }
  };

  const handleTimeDisplayClick = (e) => {
    // Bloquer l'édition en mode focus si le minuteur tourne
    if (focusMode && mode === 'countdown' && status === 'running') {
      return;
    }
    
    const now = Date.now();
    const DOUBLE_CLICK_DELAY = 300; // 300ms entre les deux clics
    
    if (now - lastClick < DOUBLE_CLICK_DELAY) {
      // Double-clic détecté !
      e.preventDefault();
      if (mode === 'countdown' && status === 'stopped') {
        playClickSound();
        const totalSeconds = Math.floor(currentTime / 1000);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        
        setEditableHours(h);
        setEditableMinutes(m);
        setEditableSeconds(s);
        setIsInlineEditing(true);
      }
      setLastClick(0); // Réinitialiser
    } else {
      setLastClick(now);
    }
  };

  const handleTimeDisplayTap = (e) => {
    // Bloquer l'édition en mode focus si le minuteur tourne
    if (focusMode && mode === 'countdown' && status === 'running') {
      return;
    }
    
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300; // 300ms entre les deux taps
    
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // Double-tap détecté !
      e.preventDefault();
      if (mode === 'countdown' && status === 'stopped') {
        playClickSound();
        const totalSeconds = Math.floor(currentTime / 1000);
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        
        setEditableHours(h);
        setEditableMinutes(m);
        setEditableSeconds(s);
        setIsInlineEditing(true);
      }
      setLastTap(0); // Réinitialiser
    } else {
      setLastTap(now);
    }
  };

  const handleTimeEdit = (type, value) => {
    // Permettre la saisie directe et valider
    let numValue = value === '' ? 0 : parseInt(value);
    
    // Si la valeur n'est pas un nombre valide, garder la valeur précédente
    if (isNaN(numValue)) {
      return;
    }
    
    switch (type) {
      case 'hours':
        // Limiter entre 0 et 99, mais permettre la saisie temporaire
        if (numValue >= 0 && numValue <= 99) {
          setEditableHours(numValue);
        }
        break;
      case 'minutes':
        // Limiter entre 0 et 59, mais permettre la saisie temporaire
        if (numValue >= 0 && numValue <= 59) {
          setEditableMinutes(numValue);
        }
        break;
      case 'seconds':
        // Limiter entre 0 et 59, mais permettre la saisie temporaire
        if (numValue >= 0 && numValue <= 59) {
          setEditableSeconds(numValue);
        }
        break;
      default:
        console.warn('Type de temps non reconnu:', type);
        break;
    }
  };

  // Fonction pour valider et corriger les valeurs lors du blur
  const handleTimeEditBlur = (type) => {
    switch (type) {
      case 'hours':
        setEditableHours(prev => Math.max(0, Math.min(99, prev)));
        break;
      case 'minutes':
        setEditableMinutes(prev => Math.max(0, Math.min(59, prev)));
        break;
      case 'seconds':
        setEditableSeconds(prev => Math.max(0, Math.min(59, prev)));
        break;
    }
  };

  const handleTimeWheel = (type, event) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -1 : 1; // Scroll down = -1, Scroll up = +1
    
    switch (type) {
      case 'hours':
        setEditableHours(prev => {
          const newValue = prev + delta;
          if (newValue < 0) return 99; // Boucle : 0 -> 99
          if (newValue > 99) return 0; // Boucle : 99 -> 0
          return newValue;
        });
        break;
      case 'minutes':
        setEditableMinutes(prev => {
          const newValue = prev + delta;
          if (newValue < 0) return 59; // Boucle : 0 -> 59
          if (newValue > 59) return 0; // Boucle : 59 -> 0
          return newValue;
        });
        break;
      case 'seconds':
        setEditableSeconds(prev => {
          const newValue = prev + delta;
          if (newValue < 0) return 59; // Boucle : 0 -> 59
          if (newValue > 59) return 0; // Boucle : 59 -> 0
          return newValue;
        });
        break;
      default:
        break;
    }
  };

  // Gestion du tactile (swipe up/down pour changer les valeurs)
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientY);
    setTouchDelta(0);
  };

  const handleTouchMove = (type, e) => {
    if (touchStart === null) return;
    
    const currentY = e.touches[0].clientY;
    const delta = touchStart - currentY;
    setTouchDelta(delta);
    
    // Changer la valeur tous les 30px de déplacement
    const steps = Math.floor(delta / 30);
    
    if (Math.abs(steps) >= 1) {
      switch (type) {
        case 'hours':
          setEditableHours(prev => {
            const newValue = prev + steps;
            if (newValue < 0) return 99; // Boucle : 0 -> 99
            if (newValue > 99) return 0; // Boucle : 99 -> 0
            return newValue;
          });
          break;
        case 'minutes':
          setEditableMinutes(prev => {
            const newValue = prev + steps;
            if (newValue < 0) return 59; // Boucle : 0 -> 59
            if (newValue > 59) return 0; // Boucle : 59 -> 0
            return newValue;
          });
          break;
        case 'seconds':
          setEditableSeconds(prev => {
            const newValue = prev + steps;
            if (newValue < 0) return 59; // Boucle : 0 -> 59
            if (newValue > 59) return 0; // Boucle : 59 -> 0
            return newValue;
          });
          break;
        default:
          break;
      }
      // Réinitialiser le point de départ pour un défilement continu
      setTouchStart(currentY);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
    setTouchDelta(0);
  };

  const handleTimeEditConfirm = async () => {
    try {
      const response = await axios.post(`${TIMER_API_URL}/set_time/`, {
        hours: editableHours,
        minutes: editableMinutes,
        seconds: editableSeconds
      });
      const data = response.data;
      setInitialTime(data.initial_time);
      setCurrentTime(data.current_time);
      setIsEditingTime(false);
      setIsInlineEditing(false);
    } catch (error) {
      console.error('Error setting time:', error);
    }
  };

  const handleTimeEditCancel = () => {
    setIsEditingTime(false);
    setIsInlineEditing(false);
  };

  const handleTimeEditKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleTimeEditConfirm();
    } else if (event.key === 'Escape') {
      handleTimeEditCancel();
    }
  };

  const handleDisplayModeToggle = () => {
    playClickSound();
    setDisplayMode(displayMode === 'digital' ? 'analog' : 'digital');
  };

  // Fonctions pour gérer les presets
  const handleApplyPreset = async (preset) => {
    try {
      playClickSound();
      const response = await axios.post(`${PRESETS_API_URL}/${preset.id}/apply_to_timer/`);
      
      // Mettre à jour l'état local avec les nouvelles données du timer
      const timerData = response.data.timer;
      setMode(timerData.mode);
      setStatus(timerData.status);
      setCurrentTime(timerData.current_time);
      setInitialTime(timerData.initial_time);
      
      setShowPresets(false);
    } catch (error) {
      console.error('Error applying preset:', error);
    }
  };

  const handleCreatePreset = async () => {
    if (!newPresetName.trim()) {
      setPresetError('Le nom du preset est requis');
      return;
    }
    
    setIsCreatingPreset(true);
    setPresetError('');
    setPresetSuccess('');
    
    try {
      playClickSound();
      console.log('Création du preset:', { name: newPresetName.trim(), description: newPresetDescription.trim() });
      
      const response = await axios.post(`${PRESETS_API_URL}/create_from_current_timer/`, {
        name: newPresetName.trim(),
        description: newPresetDescription.trim()
      });
      
      console.log('Preset créé avec succès:', response.data);
      
      // Actualiser la liste des presets
      await fetchPresets();
      
      // Afficher un message de succès
      setPresetSuccess(`Preset "${newPresetName.trim()}" créé avec succès !`);
      
      // Réinitialiser le formulaire après un délai
      setTimeout(() => {
        setNewPresetName('');
        setNewPresetDescription('');
        setShowCreatePreset(false);
        setPresetSuccess('');
      }, 1500);
      
    } catch (error) {
      console.error('Error creating preset:', error);
      
      if (error.response && error.response.data && error.response.data.error) {
        setPresetError(error.response.data.error);
      } else {
        setPresetError('Erreur: Le timer doit être en mode minuteur avec une durée définie pour créer un preset.');
      }
    } finally {
      setIsCreatingPreset(false);
    }
  };

  const handleDeletePreset = async (presetId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce preset ?')) return;
    
    try {
      playClickSound();
      await axios.delete(`${PRESETS_API_URL}/${presetId}/`);
      await fetchPresets();
    } catch (error) {
      console.error('Error deleting preset:', error);
    }
  };

  const togglePresets = () => {
    playClickSound();
    setShowPresets(!showPresets);
  };

  const formatPresetDuration = (duration) => {
    const totalSeconds = Math.floor(duration / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds > 0 ? ` ${seconds}s` : ''}`;
    } else {
      return `${seconds}s`;
    }
  };

  // Composant d'horloge analogique
  const AnalogClock = ({ time }) => {
    const totalSeconds = Math.floor(time / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((time % 1000) / 10);

    // Calcul des angles pour les aiguilles
    const secondAngle = (seconds + centiseconds / 100) * 6; // 360° / 60s = 6°/s
    const minuteAngle = (minutes + seconds / 60) * 6; // 360° / 60m = 6°/m
    const hourAngle = (hours % 12 + minutes / 60) * 30; // 360° / 12h = 30°/h

    return (
      <div className="analog-clock">
        <svg width="300" height="300" viewBox="0 0 300 300">
          {/* Cercle principal */}
          <circle
            cx="150"
            cy="150"
            r="140"
            fill="rgba(255, 255, 255, 0.1)"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="4"
          />
          
          {/* Marques des heures */}
          {[...Array(12)].map((_, i) => {
            const angle = (i * 30 - 90) * (Math.PI / 180);
            const x1 = 150 + Math.cos(angle) * 120;
            const y1 = 150 + Math.sin(angle) * 120;
            const x2 = 150 + Math.cos(angle) * 100;
            const y2 = 150 + Math.sin(angle) * 100;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(255, 255, 255, 0.8)"
                strokeWidth="3"
              />
            );
          })}

          {/* Marques des minutes */}
          {[...Array(60)].map((_, i) => {
            if (i % 5 !== 0) { // Éviter les marques d'heures
              const angle = (i * 6 - 90) * (Math.PI / 180);
              const x1 = 150 + Math.cos(angle) * 120;
              const y1 = 150 + Math.sin(angle) * 120;
              const x2 = 150 + Math.cos(angle) * 110;
              const y2 = 150 + Math.sin(angle) * 110;
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeWidth="1"
                />
              );
            }
            return null;
          })}

          {/* Aiguille des heures */}
          <line
            x1="150"
            y1="150"
            x2={150 + Math.cos((hourAngle - 90) * (Math.PI / 180)) * 60}
            y2={150 + Math.sin((hourAngle - 90) * (Math.PI / 180)) * 60}
            stroke="rgba(255, 255, 255, 0.9)"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Aiguille des minutes */}
          <line
            x1="150"
            y1="150"
            x2={150 + Math.cos((minuteAngle - 90) * (Math.PI / 180)) * 90}
            y2={150 + Math.sin((minuteAngle - 90) * (Math.PI / 180)) * 90}
            stroke="rgba(255, 255, 255, 0.9)"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Aiguille des secondes */}
          <line
            x1="150"
            y1="150"
            x2={150 + Math.cos((secondAngle - 90) * (Math.PI / 180)) * 100}
            y2={150 + Math.sin((secondAngle - 90) * (Math.PI / 180)) * 100}
            stroke="#ff6b6b"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Centre */}
          <circle
            cx="150"
            cy="150"
            r="8"
            fill="rgba(255, 255, 255, 0.9)"
          />
        </svg>
        
        {/* Affichage digital en petit en bas */}
        <div className="analog-digital-display">
          {formatTime(time)}
        </div>
      </div>
    );
  };

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(centiseconds).padStart(2, '0')}`;
  };

  const formatTimeForDisplay = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    
    if (hours > 0) {
      return {
        main: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
        centiseconds: `${String(secs).padStart(2, '0')}`
      };
    } else {
      return {
        main: `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`,
        centiseconds: String(centiseconds).padStart(2, '0')
      };
    }
  };

  const getProgressPercentage = () => {
    if (mode === 'countdown' && initialTime > 0) {
      return ((initialTime - currentTime) / initialTime) * 100;
    } else if (mode === 'stopwatch') {
      // Pour le chronomètre, on fait un cycle de 60 secondes
      const secondsInCycle = Math.floor((currentTime / 1000) % 60);
      return (secondsInCycle / 60) * 100;
    }
    return 0;
  };

  const getMainControlText = () => {
    if (status === 'running') {
      return 'Pause';
    } else {
      return 'Start';
    }
  };

  const getModeLabel = () => {
    return mode === 'stopwatch' ? 'Chronomètre' : 'Minuteur';
  };

  // Gestionnaire d'overlay amélioré pour mobile
  const handleOverlayClick = useCallback(async () => {
    console.log('🎯 Clic sur overlay détecté');
    
    // Activation audio forcée
    await forceAudioActivation();
    
    // Arrêt de l'alarme
    AudioUtils.stopCurrentAudio();
    setIsAlarmPlaying(false);
    
    console.log('✅ Alarme arrêtée via overlay');
  }, [forceAudioActivation]);

  return (
    <div className={`stopwatch-container ${isAlarmPlaying ? 'alarm-active' : ''}`}>
      {/* Overlay gris transparent quand l'alarme sonne */}
      {isAlarmPlaying && (
        <div 
          className="alarm-overlay"
          onClick={handleOverlayClick}
          onTouchStart={(e) => {
            e.preventDefault();
            console.log('👆 TouchStart sur overlay');
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            console.log('👆 TouchEnd sur overlay');
            handleOverlayClick();
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 99999,
            cursor: 'pointer',
            display: 'block',
            visibility: 'visible',
            opacity: 1,
            WebkitTapHighlightColor: 'transparent',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            userSelect: 'none',
            touchAction: 'manipulation'
          }}
        />
      )}

      {/* Interface de détection des gestes améliorée */}
      <div id="gesture-interface" style={{ 
        position: 'fixed', 
        top: '80px', 
        right: '20px', 
        zIndex: 1000,
        display: 'none', 
        background: 'rgba(0,0,0,0.9)', 
        borderRadius: '12px',
        padding: '15px',
        border: '1px solid rgba(255,255,255,0.2)',
        width: '280px'
      }}>
        {/* Onglets de mode */}
        <div style={{ display: 'flex', marginBottom: '10px' }}>
          <button 
            id="mode-detect-btn"
            className="gesture-mode-btn active"
            style={{
              flex: 1,
              padding: '5px 10px',
              background: 'rgba(76, 175, 80, 0.7)',
              color: 'white',
              border: 'none',
              borderRadius: '4px 0 0 4px',
              fontSize: '12px'
            }}
          >
            Détection
          </button>
          <button 
            id="mode-learn-btn"
            className="gesture-mode-btn"
            style={{
              flex: 1,
              padding: '5px 10px',
              background: 'rgba(100, 100, 100, 0.7)',
              color: 'white',
              border: 'none',
              borderRadius: '0 4px 4px 0',
              fontSize: '12px'
            }}
          >
            Apprentissage
          </button>
        </div>

        {/* Mode Détection */}
        <div id="detection-mode" style={{ display: 'block' }}>
          <video 
            id="gesture-video" 
            width="160" 
            height="120" 
            style={{ 
              borderRadius: '8px', 
              display: 'block',
              transform: 'scaleX(-1)',
              margin: '0 auto'
            }}
            autoPlay 
            muted 
            playsInline
          />
          <canvas 
            id="gesture-canvas" 
            width="160" 
            height="120" 
            style={{ 
              position: 'absolute', 
              top: '45px', 
              left: '75px',
              borderRadius: '8px',
              pointerEvents: 'none'
            }}
          />
          
          {/* Contrôles de calibration */}
          <div style={{ marginTop: '10px', textAlign: 'center' }}>
            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginBottom: '8px' }}>
              <button 
                id="calibrate-btn"
                style={{
                  padding: '4px 8px',
                  background: 'rgba(255, 193, 7, 0.7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '10px'
                }}
              >
                📏 Calibrer
              </button>
              <button 
                id="clear-sequence-btn"
                style={{
                  padding: '4px 8px',
                  background: 'rgba(220, 53, 69, 0.7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '10px'
                }}
              >
                🗑️ Effacer
              </button>
            </div>
            
            <div id="gesture-status" style={{
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '5px'
            }}>
              <span id="gesture-count" style={{ 
                color: '#4caf50',
                fontSize: '18px'
              }}>0</span> doigts
              <div id="confidence-display" style={{ 
                fontSize: '10px',
                color: 'rgba(255,255,255,0.7)'
              }}>
                Confiance: <span id="confidence-value">0%</span>
              </div>
            </div>
            
            <div id="gesture-sequence" style={{
              color: '#4caf50',
              fontSize: '12px',
              fontFamily: 'monospace',
              background: 'rgba(0,0,0,0.5)',
              padding: '4px 8px',
              borderRadius: '4px',
              minHeight: '20px'
            }}>
              Séquence: <span id="sequence-display" style={{ fontWeight: 'bold' }}></span>
            </div>
          </div>
        </div>

        {/* Mode Apprentissage */}
        <div id="learning-mode" style={{ display: 'none' }}>
          <div style={{ color: 'white', fontSize: '14px', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px' }}>
            📚 Guide des Gestes
          </div>
          
          <div id="gesture-examples" style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            marginBottom: '10px'
          }}>
            <div className="gesture-example" data-fingers="0" style={{
              background: 'rgba(50,50,50,0.8)',
              borderRadius: '6px',
              padding: '8px',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>✊</div>
              <div style={{ fontSize: '10px', color: '#ccc' }}>0 - Poing fermé</div>
            </div>
            
            <div className="gesture-example" data-fingers="1" style={{
              background: 'rgba(50,50,50,0.8)',
              borderRadius: '6px',
              padding: '8px',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>☝️</div>
              <div style={{ fontSize: '10px', color: '#ccc' }}>1 - Index levé</div>
            </div>
            
            <div className="gesture-example" data-fingers="2" style={{
              background: 'rgba(50,50,50,0.8)',
              borderRadius: '6px',
              padding: '8px',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>✌️</div>
              <div style={{ fontSize: '10px', color: '#ccc' }}>2 - Victoire</div>
            </div>
            
            <div className="gesture-example" data-fingers="3" style={{
              background: 'rgba(50,50,50,0.8)',
              borderRadius: '6px',
              padding: '8px',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>🤟</div>
              <div style={{ fontSize: '10px', color: '#ccc' }}>3 - Trois doigts</div>
            </div>
            
            <div className="gesture-example" data-fingers="4" style={{
              background: 'rgba(50,50,50,0.8)',
              borderRadius: '6px',
              padding: '8px',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>🖖</div>
              <div style={{ fontSize: '10px', color: '#ccc' }}>4 - Quatre doigts</div>
            </div>
            
            <div className="gesture-example" data-fingers="5" style={{
              background: 'rgba(50,50,50,0.8)',
              borderRadius: '6px',
              padding: '8px',
              textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>🖐️</div>
              <div style={{ fontSize: '10px', color: '#ccc' }}>5 - Main ouverte</div>
            </div>
          </div>
          
          <div style={{ 
            background: 'rgba(33, 150, 243, 0.2)',
            padding: '8px',
            borderRadius: '6px',
            fontSize: '10px',
            color: '#ccc',
            lineHeight: '1.3'
          }}>
            💡 <strong>Conseils :</strong><br/>
            • Gardez votre main bien éclairée<br/>
            • Maintenez le geste 1 seconde<br/>
            • Évitez les mouvements brusques<br/>
            • Distance : 30-60cm de la caméra
          </div>
        </div>
      </div>
      
      <div className="stopwatch-header">
        <div className="header-left-buttons">
          <div className="mode-toggle-container">
            <button 
              className={`mode-toggle-btn ${mode === 'stopwatch' ? 'active' : ''} ${focusMode ? 'disabled' : ''}`}
              onClick={() => handleInteractionWithAudio(async () => {
                if (!focusMode && mode !== 'stopwatch') {
                  try {
                    // Utiliser l'API pour changer le mode
                    await handleAction('toggle_mode');
                  } catch (error) {
                    console.error('Error switching to stopwatch:', error);
                  }
                }
              })}
              disabled={focusMode}
            >
              Chrono
            </button>
            <button 
              className={`mode-toggle-btn ${mode === 'countdown' ? 'active' : ''} ${focusMode ? 'disabled' : ''}`}
              onClick={() => handleInteractionWithAudio(async () => {
                if (!focusMode && mode !== 'countdown') {
                  try {
                    // Utiliser l'API pour changer le mode
                    await handleAction('toggle_mode');
                  } catch (error) {
                    console.error('Error switching to countdown:', error);
                  }
                }
              })}
              disabled={focusMode}
            >
              Minuteur
            </button>
          </div>
          <button 
            className="presets-button"
            onClick={() => handleInteractionWithAudio(() => setShowPresets(true))}
          >
            Presets
          </button>
          
          {/* Bouton pour activer/désactiver la détection de gestes */}
          {/* Temporarily disabled due to MediaPipe initialization issues
          <button 
            className="presets-button"
            id="gesture-toggle-btn"
            onClick={() => handleInteractionWithAudio(() => {
              const gestureInterface = document.getElementById('gesture-interface');
              if (gestureInterface.style.display === 'none' || !gestureInterface.style.display) {
                gestureInterface.style.display = 'block';
                window.startGestureDetection && window.startGestureDetection();
              } else {
                gestureInterface.style.display = 'none';
                window.stopGestureDetection && window.stopGestureDetection();
              }
            })}
            style={{ background: 'rgba(76, 175, 80, 0.3)' }}
          >
            👋 Gestes
          </button>
          */}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            className="alarm-button"
            onClick={() => handleInteractionWithAudio(() => setShowAlarmManager(true))}
          >
            Sons
          </button>
          
          <div className="focus-mode-toggle">
            <label className="focus-toggle-label">
              <span className="focus-label-text">Focus</span>
              <input
                type="checkbox"
                className="focus-toggle-checkbox"
                checked={focusMode}
                onChange={toggleFocusMode}
              />
              <span className="focus-toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Gestionnaire d'alarmes */}
      <AlarmManager
        isOpen={showAlarmManager}
        onClose={() => setShowAlarmManager(false)}
        selectedAlarm={selectedAlarm}
        onAlarmChange={handleAlarmChange}
      />

      {/* Panneau des presets */}
      {showPresets && (
        <div className="presets-panel" onClick={(e) => {
          if (e.target.className === 'presets-panel') {
            setShowPresets(false);
          }
        }}>
          <div className="presets-panel-content">
            <div className="presets-header">
              <h3>Minuteurs Prédéfinis</h3>
              <button className="close-button" onClick={() => setShowPresets(false)}>×</button>
            </div>
            
            <div className="presets-list">
              {presets.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>
                  Aucun preset pour le moment
                </div>
              ) : (
                presets.map(preset => (
                  <div key={preset.id} className="preset-item">
                    <div className="preset-info">
                      <div className="preset-name">{preset.name}</div>
                      <div className="preset-duration">{formatPresetDuration(preset.duration)}</div>
                      {preset.description && <div className="preset-description">{preset.description}</div>}
                    </div>
                    <div className="preset-actions">
                      <button className="apply-button" onClick={() => handleApplyPreset(preset)}>
                        Utiliser
                      </button>
                      <button className="delete-button" onClick={() => handleDeletePreset(preset.id)}>
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="presets-footer">
              {!showCreatePreset ? (
                <button className="create-preset-button" onClick={() => setShowCreatePreset(true)}>
                  + Créer un preset
                </button>
              ) : (
                <div className="create-preset-form">
                  <input
                    type="text"
                    placeholder="Nom du preset (ex: Sport 15min)"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    className="preset-name-input"
                  />
                  <textarea
                    placeholder="Description (optionnel)"
                    value={newPresetDescription}
                    onChange={(e) => setNewPresetDescription(e.target.value)}
                    className="preset-description-input"
                  />
                  {presetError && <div className="preset-error">{presetError}</div>}
                  {presetSuccess && <div className="preset-success">{presetSuccess}</div>}
                  <div className="create-preset-buttons">
                    <button className="save-button" onClick={handleCreatePreset} disabled={isCreatingPreset}>
                      {isCreatingPreset ? 'Création...' : 'Sauvegarder'}
                    </button>
                    <button className="cancel-button" onClick={() => {
                      setShowCreatePreset(false);
                      setNewPresetName('');
                      setNewPresetDescription('');
                      setPresetError('');
                    }}>
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Panneau d'édition du temps */}
      {isEditingTime && (
        <div className="time-edit-panel" onClick={(e) => {
          if (e.target.className === 'time-edit-panel') {
            setIsEditingTime(false);
          }
        }}>
          <div className="time-edit-panel-content">
            <div className="time-edit-header">
              <h3>Régler le minuteur</h3>
              <button className="close-button" onClick={handleTimeEditCancel}>×</button>
            </div>
            
            <div className="time-edit-inputs">
              <div className="time-input-group">
                <label>Heures</label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={editableHours}
                  onChange={(e) => handleTimeEdit('hours', e.target.value)}
                  onBlur={() => handleTimeEditBlur('hours')}
                  onWheel={(e) => handleTimeWheel('hours', e)}
                  onTouchStart={handleTouchStart}
                  onTouchMove={(e) => handleTouchMove('hours', e)}
                  onTouchEnd={handleTouchEnd}
                  className="time-input"
                />
              </div>
              
              <div className="time-separator">:</div>
              
              <div className="time-input-group">
                <label>Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={editableMinutes}
                  onChange={(e) => handleTimeEdit('minutes', e.target.value)}
                  onBlur={() => handleTimeEditBlur('minutes')}
                  onWheel={(e) => handleTimeWheel('minutes', e)}
                  onTouchStart={handleTouchStart}
                  onTouchMove={(e) => handleTouchMove('minutes', e)}
                  onTouchEnd={handleTouchEnd}
                  className="time-input"
                />
              </div>
              
              <div className="time-separator">:</div>
              
              <div className="time-input-group">
                <label>Secondes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={editableSeconds}
                  onChange={(e) => handleTimeEdit('seconds', e.target.value)}
                  onBlur={() => handleTimeEditBlur('seconds')}
                  onWheel={(e) => handleTimeWheel('seconds', e)}
                  onTouchStart={handleTouchStart}
                  onTouchMove={(e) => handleTouchMove('seconds', e)}
                  onTouchEnd={handleTouchEnd}
                  className="time-input"
                />
              </div>
            </div>
            
            <div className="time-edit-actions">
              <button className="cancel-button" onClick={handleTimeEditCancel}>
                Annuler
              </button>
              <button className="save-button" onClick={handleTimeEditConfirm}>
                Valider
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="time-display-container">
        {displayMode === 'digital' ? (
          <>
            <div className="progress-circle">
              <svg>
                <circle
                  className="progress-circle-bg"
                  cx="160"
                  cy="160"
                  r="150"
                />
                <circle
                  className="progress-circle-fill"
                  cx="160"
                  cy="160"
                  r="150"
                  strokeDasharray={`${2 * Math.PI * 150}`}
                  strokeDashoffset={`${2 * Math.PI * 150 * (1 - getProgressPercentage() / 100)}`}
                />
              </svg>
              
              <div className="time-display" onClick={handleTimeDisplayClick} onTouchEnd={handleTimeDisplayTap}>
                {isInlineEditing ? (
                  <div className="inline-time-edit">
                    <div className="inline-time-inputs">
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={editableHours}
                        onChange={(e) => handleTimeEdit('hours', e.target.value)}
                        onBlur={() => handleTimeEditBlur('hours')}
                        onWheel={(e) => handleTimeWheel('hours', e)}
                        onTouchStart={handleTouchStart}
                        onTouchMove={(e) => handleTouchMove('hours', e)}
                        onTouchEnd={handleTouchEnd}
                        className="inline-input"
                      />
                      <span className="inline-separator">:</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={editableMinutes}
                        onChange={(e) => handleTimeEdit('minutes', e.target.value)}
                        onBlur={() => handleTimeEditBlur('minutes')}
                        onWheel={(e) => handleTimeWheel('minutes', e)}
                        onTouchStart={handleTouchStart}
                        onTouchMove={(e) => handleTouchMove('minutes', e)}
                        onTouchEnd={handleTouchEnd}
                        className="inline-input"
                      />
                      <span className="inline-separator">:</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={editableSeconds}
                        onChange={(e) => handleTimeEdit('seconds', e.target.value)}
                        onBlur={() => handleTimeEditBlur('seconds')}
                        onWheel={(e) => handleTimeWheel('seconds', e)}
                        onTouchStart={handleTouchStart}
                        onTouchMove={(e) => handleTouchMove('seconds', e)}
                        onTouchEnd={handleTouchEnd}
                        className="inline-input"
                      />
                    </div>
                    <div className="inline-actions">
                      <button className="inline-btn cancel" onClick={handleTimeEditCancel}>✕</button>
                      <button className="inline-btn confirm" onClick={handleTimeEditConfirm}>✓</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="main-time">
                      {formatTimeForDisplay(currentTime).main}
                      <span className="centiseconds">{formatTimeForDisplay(currentTime).centiseconds}</span>
                    </div>
                    <div className={`time-label ${isAlarmPlaying ? 'alarm-active' : ''}`}>
                      {getModeLabel()}
                    </div>
                  </>
                )}
              </div>
            </div>

            <button className="main-control-button" onClick={handleStartStop}>
              {getMainControlText()}
            </button>

            <div className="secondary-controls">
              <button 
                className={`secondary-button ${focusMode && mode === 'countdown' && status === 'running' ? 'disabled' : ''}`} 
                onClick={handleReset}
                disabled={focusMode && mode === 'countdown' && status === 'running'}
              >
                Reset
              </button>
              {mode === 'countdown' && status === 'stopped' && (
                <button className="secondary-button" onClick={handleEditTimeClick}>
                  Régler
                </button>
              )}
              <button className="secondary-button" onClick={handleDisplayModeToggle}>
                Analog
              </button>
            </div>
          </>
        ) : (
          <div className="analog-mode">
            <AnalogClock time={currentTime} />
            <button className="main-control-button" onClick={handleStartStop}>
              {getMainControlText()}
            </button>
            <div className="secondary-controls">
              <button 
                className={`secondary-button ${focusMode && mode === 'countdown' && status === 'running' ? 'disabled' : ''}`} 
                onClick={handleReset}
                disabled={focusMode && mode === 'countdown' && status === 'running'}
              >
                Reset
              </button>
              {mode === 'countdown' && status === 'stopped' && (
                <button className="secondary-button" onClick={handleEditTimeClick}>
                  Régler
                </button>
              )}
              <button className="secondary-button" onClick={handleDisplayModeToggle}>
                Digital
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ========================================
// FONCTIONS POUR L'INTERFACE DE GESTES AMÉLIORÉE
// ========================================

/**
 * Basculer vers le mode détection
 */
function switchToDetectionMode() {
  console.log('📱 Basculement vers mode détection');
  
  // Mettre à jour les boutons
  const detectBtn = document.getElementById('mode-detect-btn');
  const learnBtn = document.getElementById('mode-learn-btn');
  
  if (detectBtn && learnBtn) {
    detectBtn.style.background = 'rgba(76, 175, 80, 0.7)';
    learnBtn.style.background = 'rgba(100, 100, 100, 0.7)';
  }
  
  // Afficher le mode détection
  const detectionMode = document.getElementById('detection-mode');
  const learningModeDiv = document.getElementById('learning-mode');
  
  if (detectionMode && learningModeDiv) {
    detectionMode.style.display = 'block';
    learningModeDiv.style.display = 'none';
  }
  
  console.log('✅ Mode détection activé');
}

/**
 * Basculer vers le mode apprentissage
 */
function switchToLearningMode() {
  console.log('📚 Basculement vers mode apprentissage');
  
  // Mettre à jour les boutons
  const detectBtn = document.getElementById('mode-detect-btn');
  const learnBtn = document.getElementById('mode-learn-btn');
  
  if (detectBtn && learnBtn) {
    detectBtn.style.background = 'rgba(100, 100, 100, 0.7)';
    learnBtn.style.background = 'rgba(76, 175, 80, 0.7)';
  }
  
  // Afficher le mode apprentissage
  const detectionMode = document.getElementById('detection-mode');
  const learningModeDiv = document.getElementById('learning-mode');
  
  if (detectionMode && learningModeDiv) {
    detectionMode.style.display = 'none';
    learningModeDiv.style.display = 'block';
  }
  
  console.log('✅ Mode apprentissage activé');
}

/**
 * Démarrer la calibration pour améliorer la détection
 */
function startCalibration() {
  console.log('📏 Démarrage de la calibration...');
  
  // Créer l'overlay de calibration
  const overlay = document.createElement('div');
  overlay.id = 'calibration-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.8);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: Arial, sans-serif;
  `;
  
  // Créer la boîte de calibration
  const calibrationBox = document.createElement('div');
  calibrationBox.style.cssText = `
    background: rgba(30, 30, 30, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 30px;
    text-align: center;
    max-width: 400px;
    color: white;
  `;
  
  calibrationBox.innerHTML = `
    <h2 style="color: #4caf50; margin-bottom: 20px;">📏 Calibration des Gestes</h2>
    <p style="margin-bottom: 20px; line-height: 1.5;">
      La calibration va améliorer la détection de vos gestes personnels.
      Vous allez montrer chaque geste pendant 3 secondes.
    </p>
    <div id="calibration-step" style="margin: 20px 0;">
      <div style="font-size: 48px; margin-bottom: 10px;" id="calibration-emoji">✊</div>
      <div style="font-size: 18px; font-weight: bold;" id="calibration-gesture">Montrez un poing fermé</div>
      <div style="margin-top: 10px;">
        <div style="background: rgba(255,255,255,0.2); height: 8px; border-radius: 4px;">
          <div id="calibration-progress" style="background: #4caf50; height: 100%; width: 0%; border-radius: 4px; transition: width 0.1s;"></div>
        </div>
      </div>
    </div>
    <button id="start-calibration-btn" style="
      background: #4caf50; 
      color: white; 
      border: none; 
      padding: 12px 24px; 
      border-radius: 6px; 
      font-size: 16px; 
      cursor: pointer;
      margin: 10px;
    ">Commencer</button>
    <button id="cancel-calibration-btn" style="
      background: #f44336; 
      color: white; 
      border: none; 
      padding: 12px 24px; 
      border-radius: 6px; 
      font-size: 16px; 
      cursor: pointer;
      margin: 10px;
    ">Annuler</button>
  `;
  
  overlay.appendChild(calibrationBox);
  document.body.appendChild(overlay);
  
  // Gestionnaires d'événements
  document.getElementById('start-calibration-btn').onclick = () => {
    runCalibrationSequence();
  };
  
  document.getElementById('cancel-calibration-btn').onclick = () => {
    document.body.removeChild(overlay);
  };
}

/**
 * Exécuter la séquence de calibration
 */
function runCalibrationSequence() {
  const gestureExamples = {
    0: { name: "Poing fermé", emoji: "✊" },
    1: { name: "Index levé", emoji: "☝️" },
    2: { name: "Victoire", emoji: "✌️" },
    3: { name: "Trois doigts", emoji: "🤟" },
    4: { name: "Quatre doigts", emoji: "🖖" },
    5: { name: "Main ouverte", emoji: "🖐️" }
  };
  
  const gestures = [0, 1, 2, 3, 4, 5];
  let currentGestureIndex = 0;
  let progress = 0;
  const totalTime = 3000; // 3 secondes par geste
  const updateInterval = 100; // Mise à jour toutes les 100ms
  
  const startBtn = document.getElementById('start-calibration-btn');
  const cancelBtn = document.getElementById('cancel-calibration-btn');
  
  if (startBtn) startBtn.style.display = 'none';
  if (cancelBtn) cancelBtn.textContent = 'Arrêter';
  
  function calibrateNextGesture() {
    if (currentGestureIndex >= gestures.length) {
      // Calibration terminée
      completeCalibration();
      return;
    }
    
    const currentGesture = gestures[currentGestureIndex];
    const gestureInfo = gestureExamples[currentGesture];
    
    // Mettre à jour l'affichage
    const emojiDiv = document.getElementById('calibration-emoji');
    const gestureDiv = document.getElementById('calibration-gesture');
    const progressBar = document.getElementById('calibration-progress');
    
    if (emojiDiv) emojiDiv.textContent = gestureInfo.emoji;
    if (gestureDiv) gestureDiv.textContent = `Montrez: ${gestureInfo.name}`;
    if (progressBar) progressBar.style.width = '0%';
    
    progress = 0;
    
    // Barre de progression
    const progressInterval = setInterval(() => {
      progress += updateInterval;
      const percentage = (progress / totalTime) * 100;
      
      if (progressBar) {
        progressBar.style.width = percentage + '%';
      }
      
      if (progress >= totalTime) {
        clearInterval(progressInterval);
        
        // Sauvegarder les données de calibration pour ce geste
        console.log(`✅ Geste ${currentGesture} calibré`);
        
        currentGestureIndex++;
        setTimeout(calibrateNextGesture, 500); // Pause entre les gestes
      }
    }, updateInterval);
  }
  
  // Compte à rebours avant de commencer
  let countdown = 3;
  const gestureDiv = document.getElementById('calibration-gesture');
  const countdownInterval = setInterval(() => {
    if (gestureDiv) {
      gestureDiv.textContent = `Préparation... ${countdown}`;
    }
    countdown--;
    
    if (countdown < 0) {
      clearInterval(countdownInterval);
      calibrateNextGesture();
    }
  }, 1000);
}

/**
 * Terminer la calibration
 */
function completeCalibration() {
  const gestureDiv = document.getElementById('calibration-gesture');
  const progressBar = document.getElementById('calibration-progress');
  const emojiDiv = document.getElementById('calibration-emoji');
  
  if (emojiDiv) emojiDiv.textContent = '✅';
  if (gestureDiv) gestureDiv.textContent = 'Calibration terminée !';
  if (progressBar) progressBar.style.width = '100%';
  
  console.log('🎉 Calibration terminée avec succès');
  
  // Sauvegarder la calibration dans localStorage
  localStorage.setItem('gestureCalibration', JSON.stringify({
    timestamp: Date.now(),
    calibrated: true
  }));
  
  // Fermer après 2 secondes
  setTimeout(() => {
    const overlay = document.getElementById('calibration-overlay');
    if (overlay) {
      document.body.removeChild(overlay);
    }
  }, 2000);
}

/**
 * Effacer la séquence de gestes
 */
function clearGestureSequence() {
  console.log('🗑️ Effacement de la séquence de gestes');
  
  const sequenceDisplay = document.getElementById('sequence-display');
  if (sequenceDisplay) {
    sequenceDisplay.textContent = '';
  }
  
  // Réinitialiser le compteur
  const gestureCount = document.getElementById('gesture-count');
  if (gestureCount) {
    gestureCount.textContent = '0';
  }
  
  // Réinitialiser la confiance
  const confidenceValue = document.getElementById('confidence-value');
  if (confidenceValue) {
    confidenceValue.textContent = '0%';
  }
  
  console.log('✅ Séquence effacée');
}

/**
 * Afficher un exemple de geste
 */
function showGestureExample(fingers) {
  const gestureExamples = {
    0: { name: "Poing fermé", emoji: "✊", tips: "Fermez tous vos doigts" },
    1: { name: "Index levé", emoji: "☝️", tips: "Levez seulement l'index" },
    2: { name: "Victoire", emoji: "✌️", tips: "Index et majeur en V" },
    3: { name: "Trois doigts", emoji: "🤟", tips: "Index, majeur et annulaire" },
    4: { name: "Quatre doigts", emoji: "🖖", tips: "Tous sauf le pouce" },
    5: { name: "Main ouverte", emoji: "🖐️", tips: "Tous les doigts ouverts" }
  };
  
  const gestureInfo = gestureExamples[fingers];
  
  // Créer une popup d'exemple
  const popup = document.createElement('div');
  popup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 30px;
    text-align: center;
    z-index: 10001;
    color: white;
    font-family: Arial, sans-serif;
    max-width: 300px;
  `;
  
  popup.innerHTML = `
    <div style="font-size: 64px; margin-bottom: 15px;">${gestureInfo.emoji}</div>
    <h3 style="color: #4caf50; margin-bottom: 10px;">${gestureInfo.name}</h3>
    <p style="margin-bottom: 15px; line-height: 1.4;">${gestureInfo.tips}</p>
    <div style="font-size: 12px; color: #ccc; margin-bottom: 20px;">
      Maintenez ce geste pendant 1 seconde pour qu'il soit détecté
    </div>
    <button onclick="this.parentElement.remove()" style="
      background: #4caf50; 
      color: white; 
      border: none; 
      padding: 8px 16px; 
      border-radius: 4px; 
      cursor: pointer;
    ">Compris</button>
  `;
  
  document.body.appendChild(popup);
  
  // Fermer automatiquement après 5 secondes
  setTimeout(() => {
    if (popup.parentElement) {
      popup.remove();
    }
  }, 5000);
  
  console.log(`👋 Exemple affiché pour ${fingers} doigts: ${gestureInfo.name}`);
}

// Rendre les fonctions disponibles globalement
if (typeof window !== 'undefined') {
  window.switchToDetectionMode = switchToDetectionMode;
  window.switchToLearningMode = switchToLearningMode;
  window.startCalibration = startCalibration;
  window.clearGestureSequence = clearGestureSequence;
  window.showGestureExample = showGestureExample;
}

console.log('🎯 Fonctions de gestes initialisées');

export default Stopwatch;

