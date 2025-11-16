import React, { useState, useEffect, useRef } from 'react';
import { AudioUtils } from '../utils/audioUtils';
import './AlarmManager.css';

function AlarmManager({ isOpen, onClose, selectedAlarm, onAlarmChange }) {
  const [defaultAlarms, setDefaultAlarms] = useState([]);
  const [customAlarms, setCustomAlarms] = useState([]);
  const [isPlaying, setIsPlaying] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    console.log('🔄 AlarmManager useEffect - Chargement des alarmes');
    // Charger les alarmes par défaut
    setDefaultAlarms(AudioUtils.getDefaultAlarms());
    
    // Charger les alarmes personnalisées depuis localStorage
    loadCustomAlarms();
  }, []);

  // Fonction pour charger les alarmes personnalisées
  const loadCustomAlarms = () => {
    const saved = localStorage.getItem('customAlarms');
    console.log('📂 Chargement des alarmes depuis localStorage:', saved);
    
    if (saved) {
      try {
        const parsedAlarms = JSON.parse(saved);
        console.log('✅ Alarmes personnalisées chargées:', parsedAlarms);
        setCustomAlarms(parsedAlarms);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des alarmes personnalisées:', error);
        setCustomAlarms([]);
      }
    } else {
      console.log('📭 Aucune alarme personnalisée sauvegardée');
      setCustomAlarms([]);
    }
  };

  const handlePlayAlarm = async (alarmId, isCustom = false) => {
    try {
      console.log('🎵 Tentative de lecture alarme:', alarmId, 'isCustom:', isCustom);
      
      // Si on reclique sur le même son qui joue actuellement, l'arrêter
      if (isPlaying === alarmId) {
        console.log('🔇 Arrêt du son en cours (même alarme)');
        AudioUtils.stopCurrentAudio();
        setIsPlaying(null);
        return;
      }
      
      // Si un autre son joue, l'arrêter d'abord
      if (isPlaying || AudioUtils.isAudioPlaying()) {
        console.log('🔇 Arrêt du son précédent');
        AudioUtils.stopCurrentAudio();
        setIsPlaying(null);
      }
      
      // Forcer l'activation audio avant de jouer
      const audioEnabled = await AudioUtils.enableAudio();
      if (!audioEnabled) {
        console.log('❌ Impossible d\'activer l\'audio');
        return;
      }
      
      setIsPlaying(alarmId);
      
      if (isCustom) {
        const customAlarm = customAlarms.find(a => a.id === alarmId);
        console.log('🔍 Alarme personnalisée trouvée:', customAlarm);
        
        if (customAlarm && customAlarm.audioData) {
          console.log('🎶 Lecture du son personnalisé');
          await AudioUtils.playCustomSound(customAlarm.audioData, false);
          
          // Arrêter automatiquement après la lecture
          setTimeout(() => {
            if (!AudioUtils.isAudioPlaying()) {
              setIsPlaying(null);
            }
          }, 1000);
        } else {
          console.log('❌ Pas de données audio disponibles');
          setIsPlaying(null);
        }
      } else {
        console.log('🎵 Lecture alarme par défaut:', alarmId);
        await AudioUtils.playAlarmSequence(alarmId);
        
        // Pour les alarmes par défaut, arrêter après 3 secondes (une séquence)
        setTimeout(() => {
          AudioUtils.stopCurrentAudio();
          setIsPlaying(null);
        }, 3000);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la lecture du son:', error);
      setIsPlaying(null);
      
      // Essayer de diagnostiquer le problème
      AudioUtils.diagnoseAudio();
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    try {
      // Valider le fichier
      AudioUtils.validateAudioFile(file);

      // Lire le fichier comme ArrayBuffer et le convertir en base64
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const binaryString = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
      const base64Data = btoa(binaryString);
      
      // Créer une data URL avec le contenu base64
      const audioDataUrl = `data:${file.type};base64,${base64Data}`;
      
      console.log('📁 Fichier converti en base64, taille:', base64Data.length, 'caractères');
      
      // Créer un nouvel élément d'alarme personnalisée
      const newAlarm = {
        id: `custom_${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ""), // Enlever l'extension
        description: `Fichier personnalisé (${(file.size / 1024 / 1024).toFixed(1)}MB)`,
        audioData: audioDataUrl, // Data URL persistante
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type
      };

      const updatedCustomAlarms = [...customAlarms, newAlarm];
      setCustomAlarms(updatedCustomAlarms);
      
      // Sauvegarder dans localStorage avec l'audioData persistante
      localStorage.setItem('customAlarms', JSON.stringify(updatedCustomAlarms));
      
      console.log('✅ Nouvelle alarme personnalisée créée avec data URL persistante:', newAlarm.id);

    } catch (error) {
      setUploadError(error.message);
      console.error('❌ Erreur lors de l\'upload:', error);
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteCustomAlarm = (alarmId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette alarme ?')) return;
    
    // Plus besoin de révoquer l'URL car on utilise des data URLs maintenant
    const updatedAlarms = customAlarms.filter(a => a.id !== alarmId);
    setCustomAlarms(updatedAlarms);
    localStorage.setItem('customAlarms', JSON.stringify(updatedAlarms));
    
    console.log('🗑️ Alarme personnalisée supprimée:', alarmId);
  };

  const handleSelectAlarm = (alarmId, isCustom = false) => {
    onAlarmChange({ id: alarmId, isCustom });
  };

  if (!isOpen) return null;

  return (
    <div className="alarm-manager-overlay">
      <div className="alarm-manager-panel">
        <div className="alarm-manager-header">
          <h3>Gestion des Sons d'Alarme</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="alarm-manager-content">
          {/* Alarmes par défaut */}
          <div className="alarm-section">
            <h4>Sons par défaut</h4>
            <div className="alarm-list">
              {defaultAlarms.map(alarm => (
                <div key={alarm.id} className={`alarm-item ${selectedAlarm?.id === alarm.id && !selectedAlarm?.isCustom ? 'selected' : ''}`}>
                  <div className="alarm-info">
                    <div className="alarm-name">{alarm.name}</div>
                    <div className="alarm-description">{alarm.description}</div>
                  </div>
                  <div className="alarm-actions">
                    <button 
                      className={`play-button ${isPlaying === alarm.id ? 'playing' : ''}`}
                      onClick={() => handlePlayAlarm(alarm.id)}
                    >
                      {isPlaying === alarm.id ? (
                        // Icône Stop
                        <svg width="24" height="24" viewBox="0 0 512 512" fill="currentColor">
                          <path d="M256 48C141.31 48 48 141.31 48 256s93.31 208 208 208 208-93.31 208-208S370.69 48 256 48zm80 288H176a16 16 0 01-16-16V192a16 16 0 0116-16h160a16 16 0 0116 16v128a16 16 0 01-16 16z"/>
                        </svg>
                      ) : (
                        // Icône Play
                        <svg width="24" height="24" viewBox="0 0 512 512" fill="currentColor">
                          <path d="M133 440a35.37 35.37 0 01-17.5-4.67c-12-6.8-19.46-20-19.46-34.33V111c0-14.37 7.46-27.53 19.46-34.33a35.13 35.13 0 0135.77.45l247.85 148.36a36 36 0 010 61l-247.89 148.4A35.5 35.5 0 01133 440z"/>
                        </svg>
                      )}
                    </button>
                    <button 
                      className={`select-button ${selectedAlarm?.id === alarm.id && !selectedAlarm?.isCustom ? 'selected' : ''}`}
                      onClick={() => handleSelectAlarm(alarm.id, false)}
                    >
                      {selectedAlarm?.id === alarm.id && !selectedAlarm?.isCustom ? '✓ Sélectionné' : 'Sélectionner'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alarmes personnalisées */}
          <div className="alarm-section">
            <h4>Sons personnalisés</h4>
            
            {/* Upload */}
            <div className="upload-section">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="audio/*"
                style={{ display: 'none' }}
              />
              <button 
                className="upload-button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? 'Upload en cours...' : 'Ajouter un fichier audio'}
              </button>
              {uploadError && <div className="upload-error">{uploadError}</div>}
              <div className="upload-info">
                Formats supportés: MP3, WAV, OGG, M4A, WebM (max 5MB)
              </div>
            </div>

            {/* Liste des alarmes personnalisées */}
            <div className="alarm-list">
              {customAlarms.map(alarm => (
                <div key={alarm.id} className={`alarm-item ${selectedAlarm?.id === alarm.id && selectedAlarm?.isCustom ? 'selected' : ''}`}>
                  <div className="alarm-info">
                    <div className="alarm-name">{alarm.name}</div>
                    <div className="alarm-description">{alarm.description}</div>
                  </div>
                  <div className="alarm-actions">
                    <button 
                      className={`play-button ${isPlaying === alarm.id ? 'playing' : ''}`}
                      onClick={() => handlePlayAlarm(alarm.id, true)}
                      disabled={!alarm.audioData}
                    >
                      {isPlaying === alarm.id ? (
                        // Icône Stop
                        <svg width="24" height="24" viewBox="0 0 512 512" fill="currentColor">
                          <path d="M256 48C141.31 48 48 141.31 48 256s93.31 208 208 208 208-93.31 208-208S370.69 48 256 48zm80 288H176a16 16 0 01-16-16V192a16 16 0 0116-16h160a16 16 0 0116 16v128a16 16 0 01-16 16z"/>
                        </svg>
                      ) : (
                        // Icône Play
                        <svg width="24" height="24" viewBox="0 0 512 512" fill="currentColor">
                          <path d="M133 440a35.37 35.37 0 01-17.5-4.67c-12-6.8-19.46-20-19.46-34.33V111c0-14.37 7.46-27.53 19.46-34.33a35.13 35.13 0 0135.77.45l247.85 148.36a36 36 0 010 61l-247.89 148.4A35.5 35.5 0 01133 440z"/>
                        </svg>
                      )}
                    </button>
                    <button 
                      className={`select-button ${selectedAlarm?.id === alarm.id && selectedAlarm?.isCustom ? 'selected' : ''}`}
                      onClick={() => handleSelectAlarm(alarm.id, true)}
                      disabled={!alarm.audioData}
                    >
                      {selectedAlarm?.id === alarm.id && selectedAlarm?.isCustom ? 'Sélectionné' : 'Sélectionner'}
                    </button>
                    <button 
                      className="delete-button"
                      onClick={() => handleDeleteCustomAlarm(alarm.id)}
                    >
                      <svg width="20" height="20" viewBox="0 0 512 512" fill="currentColor">
                        <path d="M112 112l20 320c.95 18.49 14.4 32 32 32h184c17.67 0 30.87-13.51 32-32l20-320" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/>
                        <path stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32" d="M80 112h352"/>
                        <path d="M192 112V72h0a23.93 23.93 0 0124-24h80a23.93 23.93 0 0124 24h0v40M256 176v224M184 176l8 224M328 176l-8 224" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              {customAlarms.length === 0 && (
                <div className="no-custom-alarms">
                  Aucun son personnalisé. Ajoutez vos propres fichiers audio !
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="alarm-manager-footer">
          <button className="close-footer-button" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

export default AlarmManager;