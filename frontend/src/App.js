import React, { useState, useEffect } from 'react';
import Stopwatch from './components/Stopwatch';
import BackgroundCustomizer from './components/BackgroundCustomizer';
import './App.css';

function App() {
  const [mode, setMode] = useState('stopwatch');
  const [stopwatchGradient, setStopwatchGradient] = useState(null);
  const [countdownGradient, setCountdownGradient] = useState(null);
  const [showCustomizer, setShowCustomizer] = useState(false);

  // Charger les dégradés personnalisés depuis localStorage
  useEffect(() => {
    const savedStopwatch = localStorage.getItem('stopwatchGradient');
    const savedCountdown = localStorage.getItem('countdownGradient');
    
    if (savedStopwatch) {
      try {
        setStopwatchGradient(JSON.parse(savedStopwatch));
      } catch (error) {
        console.error('Erreur lors du chargement du dégradé chronomètre:', error);
      }
    }
    
    if (savedCountdown) {
      try {
        setCountdownGradient(JSON.parse(savedCountdown));
      } catch (error) {
        console.error('Erreur lors du chargement du dégradé minuteur:', error);
      }
    }
  }, []);

  const handleModeChange = (newMode) => {
    setMode(newMode);
  };

  const handleGradientChange = (gradient) => {
    if (mode === 'stopwatch') {
      setStopwatchGradient(gradient);
      if (gradient) {
        localStorage.setItem('stopwatchGradient', JSON.stringify(gradient));
      } else {
        localStorage.removeItem('stopwatchGradient');
      }
    } else {
      setCountdownGradient(gradient);
      if (gradient) {
        localStorage.setItem('countdownGradient', JSON.stringify(gradient));
      } else {
        localStorage.removeItem('countdownGradient');
      }
    }
  };

  const getCurrentGradient = () => {
    return mode === 'stopwatch' ? stopwatchGradient : countdownGradient;
  };

  const getBackgroundStyle = () => {
    const currentGradient = getCurrentGradient();
    if (currentGradient) {
      return {
        background: `linear-gradient(${currentGradient.angle}deg, ${currentGradient.color1}, ${currentGradient.color2})`,
        backgroundSize: '400% 400%',
        animation: 'gradientShift 15s ease infinite'
      };
    }
    return {};
  };

  return (
    <div className={`App ${getCurrentGradient() ? '' : `${mode}-mode`}`} style={getBackgroundStyle()}>
      <button 
        className="customize-button" 
        onClick={() => setShowCustomizer(true)}
        title="Personnaliser le fond"
      >
        <svg width="24" height="24" viewBox="0 0 512 512" fill="currentColor">
          <path d="M430.11,347.9c-6.6-6.1-16.3-7.6-24.6-9-11.5-1.9-15.9-4-22.6-10-14.3-12.7-14.3-31.1,0-43.8l30.3-26.9c46.4-41,46.4-108.2,0-149.2-34.2-30.1-80.1-45-127.8-45-55.7,0-113.9,20.3-158.8,60.1-83.5,73.8-83.5,194.7,0,268.5,41.5,36.7,97.5,55,152.9,55.4h1.7c55.4,0,110.3-18.7,152.9-55.4,36.3-31.5,57.4-74.2,57.4-120.5A90.77,90.77,0,0,0,430.11,347.9ZM160,225c17.7,0,32,14.3,32,32s-14.3,32-32,32-32-14.3-32-32S142.3,225,160,225Zm-32,160c-17.7,0-32-14.3-32-32s14.3-32,32-32,32,14.3,32,32S145.7,385,128,385Zm128,64c-17.7,0-32-14.3-32-32s14.3-32,32-32,32,14.3,32,32S273.7,449,256,449Zm0-192c-17.7,0-32-14.3-32-32s14.3-32,32-32,32,14.3,32,32S273.7,257,256,257Zm128,128c-17.7,0-32-14.3-32-32s14.3-32,32-32,32,14.3,32,32S401.7,385,384,385Z"/>
        </svg>
      </button>

      <BackgroundCustomizer
        isOpen={showCustomizer}
        onClose={() => setShowCustomizer(false)}
        currentGradient={getCurrentGradient()}
        onGradientChange={handleGradientChange}
        currentMode={mode}
      />

      <Stopwatch onModeChange={handleModeChange} />
    </div>
  );
}

export default App;

