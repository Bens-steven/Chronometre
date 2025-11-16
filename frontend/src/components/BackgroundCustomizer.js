import React, { useState, useEffect } from 'react';
import './BackgroundCustomizer.css';

function BackgroundCustomizer({ isOpen, onClose, currentGradient, onGradientChange, currentMode }) {
  const [color1, setColor1] = useState(currentGradient?.color1 || '#667eea');
  const [color2, setColor2] = useState(currentGradient?.color2 || '#764ba2');
  const [angle, setAngle] = useState(currentGradient?.angle || 135);

  // Mettre à jour les valeurs quand le mode change
  useEffect(() => {
    if (currentGradient) {
      setColor1(currentGradient.color1);
      setColor2(currentGradient.color2);
      setAngle(currentGradient.angle);
    } else {
      // Réinitialiser avec les valeurs par défaut selon le mode
      if (currentMode === 'stopwatch') {
        setColor1('#667eea');
        setColor2('#764ba2');
      } else {
        setColor1('#4facfe');
        setColor2('#00f2fe');
      }
      setAngle(135);
    }
  }, [currentGradient, currentMode]);

  // Dégradés prédéfinis
  const presetGradients = [
    { name: 'Violet Classique', color1: '#667eea', color2: '#764ba2', angle: 135 },
    { name: 'Sunset', color1: '#ff6b6b', color2: '#feca57', angle: 135 },
    { name: 'Ocean', color1: '#00d2ff', color2: '#3a7bd5', angle: 135 },
    { name: 'Forest', color1: '#11998e', color2: '#38ef7d', angle: 135 },
    { name: 'Rose', color1: '#f093fb', color2: '#f5576c', angle: 135 },
    { name: 'Purple Dream', color1: '#a8c0ff', color2: '#3f2b96', angle: 135 },
    { name: 'Fire', color1: '#ff9a56', color2: '#ee5a6f', angle: 135 },
    { name: 'Sky', color1: '#4facfe', color2: '#00f2fe', angle: 135 },
  ];

  const handleApply = () => {
    onGradientChange({ color1, color2, angle });
    onClose();
  };

  const handleReset = () => {
    onGradientChange(null);
    if (currentMode === 'stopwatch') {
      localStorage.removeItem('stopwatchGradient');
    } else {
      localStorage.removeItem('countdownGradient');
    }
    onClose();
  };

  const handlePresetClick = (preset) => {
    setColor1(preset.color1);
    setColor2(preset.color2);
    setAngle(preset.angle);
  };

  if (!isOpen) return null;

  return (
    <div className="background-customizer-overlay" onClick={(e) => {
      if (e.target.className === 'background-customizer-overlay') {
        onClose();
      }
    }}>
      <div className="background-customizer-panel">
        <div className="background-customizer-header">
          <h3>Personnaliser le fond - {currentMode === 'stopwatch' ? 'Chronomètre' : 'Minuteur'}</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="background-customizer-content">
          {/* Aperçu */}
          <div className="gradient-preview" style={{
            background: `linear-gradient(${angle}deg, ${color1}, ${color2})`
          }}>
            <div className="preview-label">Aperçu</div>
          </div>

          {/* Contrôles personnalisés */}
          <div className="custom-controls">
            <h4>Couleurs personnalisées</h4>
            
            <div className="color-controls">
              <div className="color-picker-group">
                <label>Couleur 1</label>
                <div className="color-input-wrapper">
                  <input 
                    type="color" 
                    value={color1} 
                    onChange={(e) => setColor1(e.target.value)}
                    className="color-picker"
                  />
                  <input 
                    type="text" 
                    value={color1} 
                    onChange={(e) => setColor1(e.target.value)}
                    className="color-text-input"
                  />
                </div>
              </div>

              <div className="color-picker-group">
                <label>Couleur 2</label>
                <div className="color-input-wrapper">
                  <input 
                    type="color" 
                    value={color2} 
                    onChange={(e) => setColor2(e.target.value)}
                    className="color-picker"
                  />
                  <input 
                    type="text" 
                    value={color2} 
                    onChange={(e) => setColor2(e.target.value)}
                    className="color-text-input"
                  />
                </div>
              </div>
            </div>

            <div className="angle-control">
              <label>Angle: {angle}°</label>
              <input 
                type="range" 
                min="0" 
                max="360" 
                value={angle} 
                onChange={(e) => setAngle(parseInt(e.target.value))}
                className="angle-slider"
              />
            </div>
          </div>

          {/* Dégradés prédéfinis */}
          <div className="preset-gradients">
            <h4>Dégradés prédéfinis</h4>
            <div className="preset-grid">
              {presetGradients.map((preset, index) => (
                <button
                  key={index}
                  className="preset-gradient-item"
                  style={{
                    background: `linear-gradient(${preset.angle}deg, ${preset.color1}, ${preset.color2})`
                  }}
                  onClick={() => handlePresetClick(preset)}
                >
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="background-customizer-footer">
          <button className="reset-button" onClick={handleReset}>
            Réinitialiser
          </button>
          <button className="apply-button" onClick={handleApply}>
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
}

export default BackgroundCustomizer;