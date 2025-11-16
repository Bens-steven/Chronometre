// Configuration de l'URL de l'API selon l'environnement
const getApiBaseUrl = () => {
  // Si on est en développement local (localhost), utiliser localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }
  
  // Sinon, utiliser l'IP du serveur (pour accès depuis téléphone)
  // Remplacer l'IP si nécessaire
  return `http://${window.location.hostname}:8000`;
};

export const API_BASE_URL = getApiBaseUrl();
export const TIMER_API_URL = `${API_BASE_URL}/api/timers/1`;
export const PRESETS_API_URL = `${API_BASE_URL}/api/presets`;
