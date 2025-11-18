import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import './TempoAssistant.css';

const SYSTEM_PROMPT = `Tu es "Tempo", l'assistant intelligent intégré dans une application de minuteur universel.

Ton rôle est d'interpréter les demandes de l'utilisateur en langage naturel et de les transformer en minuteurs clairs et précis.

L'utilisateur peut demander n'importe quel type d'activité, par exemple :
- "Fais-moi un minuteur pour étudier."
- "Je veux cuire un poulet de 1,2 kg à 180 degrés."
- "Je veux faire une sieste."
- "Préviens-moi de sortir le pain."
- "Je veux faire du sport."
- "Retourne la viande."
- "Je veux méditer."
- "Lance un pomodoro."

## TES RESPONSABILITÉS

### 1. Comprendre l'intention
Identifie le type d'action : cuisine, sommeil/sieste, sport, études/travail, soins personnels, tâches ménagères, rappels simples, minuteurs généraux

### 2. Extraire les paramètres utiles
- durée (si mentionnée)
- quantité ou poids (si cuisine)
- température (si cuisine)
- contexte (étude, sport, repos, etc.)
- étapes intermédiaires (ex : "retourne dans 10 minutes")

### 3. Estimer automatiquement une durée appropriée
**RÈGLE IMPORTANTE : Ne JAMAIS demander la durée à l'utilisateur.**

Si aucune durée n'est fournie, estime automatiquement une durée moyenne appropriée selon l'activité :

**Bien-être & Repos :**
- Méditation : 10-15 minutes
- Sieste : 20 minutes
- Relaxation : 15 minutes
- Pause : 5-10 minutes

**Sport & Activité physique :**
- Sport léger/modéré : 30 minutes
- Cardio : 20-30 minutes
- Musculation : 45 minutes
- Étirements : 10 minutes
- Yoga : 30-45 minutes

**Travail & Études :**
- Pomodoro : 25 minutes
- Session d'étude : 45-60 minutes
- Pause de travail : 5 minutes
- Concentration intense : 50 minutes

**Cuisine (estimations selon le type) :**
- Poulet entier (1-1,5kg) à 180°C : 1h15-1h30
- Pâtes : 10-12 minutes
- Riz : 15-20 minutes
- Gâteau : 30-40 minutes
- Pizza : 15-20 minutes
- Œuf à la coque : 3-4 minutes
- Légumes vapeur : 10-15 minutes
- Viande (retourner) : 5-10 minutes

**Tâches ménagères :**
- Lessive : 30-40 minutes
- Ménage rapide : 15 minutes
- Ménage complet : 60 minutes

**Autres :**
- Temps de trajet moyen : 30 minutes
- Rappel général : 15 minutes
- Charge de téléphone : 60 minutes

### 4. Format de réponse (OBLIGATOIRE)
Tu dois toujours répondre avec ce format exact :

**Analyse :**  
- Résumé de ce que veut l'utilisateur.  
- Paramètres extraits ou déduits.

**Proposition de minuteur :**  
- Durée proposée : [XX heures] [YY minutes] [ZZ secondes]
- Justification : [Une phrase courte expliquant pourquoi cette durée]

**Question :**  
"Souhaites-tu que je crée ce minuteur ? (oui / non)"

### 5. Confirmation
Ne lance jamais le minuteur automatiquement.

Si l'utilisateur dit "oui", "ok", "j'accepte", "lance", "go" ou équivalent :  
→ Réponds uniquement :  
"CRÉER_MINUTEUR: XX heures YY minutes ZZ secondes"

### 6. Ajustement
Si l'utilisateur dit "non", "trop court", "trop long", "plus court", "plus long" :  
→ Propose un ajustement (±5-10 minutes selon le contexte).

Si l'utilisateur donne une durée précise après avoir dit non :
→ Utilise cette nouvelle durée.

## RÈGLES IMPORTANTES
- Réponses concises et structurées.
- **NE JAMAIS** demander "combien de temps" ou "quelle durée".
- Toujours estimer automatiquement si la durée n'est pas fournie.
- Justifier brièvement le choix de durée (1 phrase max).
- Toujours demander confirmation avant de créer un minuteur.`;

function TempoAssistant({ isOpen, onClose, onCreateTimer }) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState('');
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Charger la clé API depuis localStorage
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Message de bienvenue traduit
      setMessages([
        {
          role: 'assistant',
          content: `${t('tempoWelcome')}\n\n${t('tempoExamples')}\n${t('tempoExample1')}\n${t('tempoExample2')}\n${t('tempoExample3')}`
        }
      ]);
    }
  }, [isOpen, messages.length, t]);

  useEffect(() => {
    // Scroll automatique vers le bas
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Focus sur l'input quand on ouvre
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  const parseTimerCommand = (text) => {
    // Chercher le pattern "CRÉER_MINUTEUR: XX heures YY minutes ZZ secondes"
    const match = text.match(/CRÉER_MINUTEUR:\s*(?:(\d+)\s*heure?s?)?\s*(?:(\d+)\s*minute?s?)?\s*(?:(\d+)\s*seconde?s?)?/i);
    
    if (match) {
      const hours = parseInt(match[1] || 0);
      const minutes = parseInt(match[2] || 0);
      const seconds = parseInt(match[3] || 0);
      
      return { hours, minutes, seconds };
    }
    
    return null;
  };

  const callOpenAI = async (userMessage) => {
    if (!apiKey) {
      throw new Error('Clé API OpenAI manquante. Configure-la dans les paramètres.');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Erreur API OpenAI');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setError('');

    // Ajouter le message de l'utilisateur
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Si pas de clé API, utiliser un mode "démo" simple
      let assistantResponse;
      
      if (apiKey) {
        assistantResponse = await callOpenAI(userMessage);
      } else {
        // Mode démo sans API
        assistantResponse = handleDemoMode(userMessage);
      }

      // Vérifier si c'est une commande de création de minuteur
      const timerData = parseTimerCommand(assistantResponse);
      
      if (timerData) {
        // Créer le minuteur avec animation de succès
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: JSON.stringify({
            type: 'success',
            hours: timerData.hours,
            minutes: timerData.minutes,
            seconds: timerData.seconds
          })
        }]);
        
        // Appeler la fonction de création
        setTimeout(() => {
          onCreateTimer(timerData);
          onClose();
        }, 1500);
      } else {
        // Ajouter la réponse de l'assistant
        setMessages(prev => [...prev, { role: 'assistant', content: assistantResponse }]);
      }
    } catch (err) {
      console.error('Erreur Tempo:', err);
      setError(err.message || 'Erreur lors de la communication avec l\'assistant');
      
      // Message d'erreur alternatif
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Désolé, j'ai rencontré une erreur. Peux-tu reformuler ta demande ?\n\nAstuce : Configure ta clé API OpenAI dans les paramètres pour une meilleure expérience." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour afficher une proposition de minuteur
  const renderProposal = (proposal) => {
    const { activity, hours, minutes, seconds, reason, emoji } = proposal;
    
    return (
      <div className="timer-proposal-card">
        <div className="proposal-header">
          <div className="proposal-icon">{emoji}</div>
          <div className="proposal-title">
            <h4>{t('tempoProposalTitle')}</h4>
            <p className="proposal-subtitle">{t('tempoProposalSubtitle')} {activity}</p>
          </div>
        </div>
        
        <div className="timer-display-card">
          <div className="timer-value">
            {hours > 0 && (
              <>
                <div className="timer-unit">
                  <span className="timer-number">{String(hours).padStart(2, '0')}</span>
                  <span className="timer-label">{t('tempoHours')}</span>
                </div>
                <span className="timer-separator">:</span>
              </>
            )}
            <div className="timer-unit">
              <span className="timer-number">{String(minutes).padStart(2, '0')}</span>
              <span className="timer-label">{t('tempoMinutes')}</span>
            </div>
            {seconds > 0 && (
              <>
                <span className="timer-separator">:</span>
                <div className="timer-unit">
                  <span className="timer-number">{String(seconds).padStart(2, '0')}</span>
                  <span className="timer-label">{t('tempoSeconds')}</span>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="proposal-reason">
          <p className="proposal-reason-text">{reason}</p>
        </div>
        
        <div className="proposal-actions">
          <button 
            className="proposal-btn proposal-btn-cancel"
            onClick={() => handleQuickAction('non')}
          >
            <span>{t('tempoModify')}</span>
          </button>
          <button 
            className="proposal-btn proposal-btn-confirm"
            onClick={() => handleQuickAction('oui')}
          >
            <span>{t('tempoConfirm')}</span>
          </button>
        </div>
      </div>
    );
  };

  // Fonction pour afficher un message de succès
  const renderSuccess = (data) => {
    const { hours, minutes, seconds } = data;
    return (
      <div className="success-message">
        <div className="success-icon">✅</div>
        <div className="success-text">
          {t('tempoSuccess')} {hours}h {minutes}min {seconds}s
        </div>
      </div>
    );
  };

  // Fonction pour rendre le contenu du message
  const renderMessageContent = (content) => {
    // Essayer de parser comme JSON
    try {
      const data = JSON.parse(content);
      
      if (data.type === 'proposal') {
        return renderProposal(data);
      } else if (data.type === 'success') {
        return renderSuccess(data);
      }
    } catch (e) {
      // Pas du JSON, afficher comme texte normal
    }
    
    // Affichage texte par défaut
    return content.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const handleDemoMode = (userMessage) => {
    const lower = userMessage.toLowerCase();
    // Normaliser le texte pour gérer les accents (é → e, etc.)
    const normalized = lower.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Cas spécial oeuf sur plat
    if (normalized.includes('oeuf sur plat')) {
      return JSON.stringify({
        type: 'proposal',
        activity: 'cuire un œuf sur plat',
        hours: 0,
        minutes: 3,
        seconds: 0,
        reason: 'Temps idéal pour un œuf sur plat',
        emoji: '🍳'
      });
    }

    // Cas spécial oeuf dur
    if (normalized.includes('oeuf dur')) {
      return JSON.stringify({
        type: 'proposal',
        activity: 'cuire un œuf dur',
        hours: 0,
        minutes: 10,
        seconds: 0,
        reason: 'Temps idéal pour un œuf dur',
        emoji: '🥚'
      });
    }

    // Détection marathon avec allure
    const marathonRegex = /(marathon).*?(allure|vitesse|pace|\bkm\/h\b|\bkmh\b)[^\d]*(\d+(?:[\.,]\d+)?)/i;
    if (marathonRegex.test(normalized)) {
      // Distance marathon officielle
      const MARATHON_KM = 42.195;
      const match = normalized.match(marathonRegex);
      let speed = parseFloat(match[3].replace(',', '.'));
      if (speed > 0) {
        // Calcul durée
        const totalHours = MARATHON_KM / speed;
        const hours = Math.floor(totalHours);
        const minutes = Math.floor((totalHours - hours) * 60);
        const seconds = Math.round((((totalHours - hours) * 60) - minutes) * 60);
        return JSON.stringify({
          type: 'proposal',
          activity: `marathon à ${speed} km/h`,
          hours,
          minutes,
          seconds,
          reason: `Durée calculée pour parcourir 42,195 km à ${speed} km/h`,
          emoji: '🏃'
        });
      }
    }

    // Détection de confirmation
    if (lower.includes('oui') || lower.includes('ok') || lower.includes('d\'accord') || lower.includes('lance') || lower.includes('go')) {
      // Cherche la dernière proposition assistant
      const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
      if (lastAssistant) {
        try {
          const proposalData = JSON.parse(lastAssistant.content);
          if (proposalData.type === 'proposal') {
            return `CRÉER_MINUTEUR: ${proposalData.hours} heures ${proposalData.minutes} minutes ${proposalData.seconds} secondes`;
          }
        } catch (e) {
          // Si pas JSON, ignore
        }
      }
      return null;
    }

    // Détection de refus ou ajustement
    if (lower.includes('non') || lower.includes('trop court') || lower.includes('trop long')) {
      // ...existing code...
    }

    // Patterns de durée explicite
    // ...existing code...

    // Mapping des activités avec emojis
    const activityEmojis = {
      'meditation': '🧘',
      'mediter': '🧘',
      'sieste': '😴',
      'repos': '🛋️',
      'relaxation': '🌸',
      'pause': '☕',
      'detente': '🌸',
      'sport': '💪',
      'exercice': '🏃',
      'cardio': '❤️',
      'musculation': '🏋️',
      'yoga': '🧘',
      'etirement': '🤸',
      'course': '🏃',
      'marche': '🚶',
      'pomodoro': '🍅',
      'etude': '📚',
      'etudier': '📚',
      'travail': '💼',
      'travailler': '💼',
      'revision': '📖',
      'lecture': '📕',
      'poulet': '🍗',
      'gateau': '🎂',
      'pates': '🍝',
      'riz': '🍚',
      'pizza': '🍕',
      'viande': '🥩',
      'retourne': '🔄',
      'pain': '🍞',
      'oeuf': '🥚',
      'legumes': '🥦',
      'lessive': '👕',
      'menage': '🧹',
      'nettoyage': '🧽',
      'charge': '🔋',
      'batterie': '🔋',
      'trajet': '🚗'
    };
    
    // Estimation automatique selon l'activité (AMÉLIORÉ avec normalisation)
    const activityEstimates = {
      // Bien-être & Repos (avec et sans accents)
      'meditation': { minutes: 15, reason: 'Durée idéale pour une session de méditation complète', activity: 'méditer' },
      'mediter': { minutes: 15, reason: 'Durée idéale pour une session de méditation complète', activity: 'méditer' },
      'sieste': { minutes: 20, reason: 'Durée optimale pour une sieste réparatrice sans inertie du sommeil', activity: 'faire une sieste' },
      'repos': { minutes: 15, reason: 'Pause de récupération standard', activity: 'te reposer' },
      'relaxation': { minutes: 15, reason: 'Temps suffisant pour se détendre', activity: 'te relaxer' },
      'pause': { minutes: 10, reason: 'Pause courte recommandée', activity: 'faire une pause' },
      'detente': { minutes: 15, reason: 'Temps de détente recommandé', activity: 'te détendre' },
      
      // Sport & Activité
      'sport': { minutes: 30, reason: 'Durée standard pour une session d\'exercice efficace', activity: 'faire du sport' },
      'exercice': { minutes: 30, reason: 'Durée standard pour une session d\'exercice efficace', activity: 'faire de l\'exercice' },
      'cardio': { minutes: 25, reason: 'Session de cardio modérée recommandée', activity: 'faire du cardio' },
      'musculation': { minutes: 45, reason: 'Temps nécessaire pour un entraînement complet', activity: 'faire de la musculation' },
      'yoga': { minutes: 30, reason: 'Durée standard pour une séance de yoga', activity: 'faire du yoga' },
      'etirement': { minutes: 10, reason: 'Temps pour étirer les principaux groupes musculaires', activity: 'faire des étirements' },
      'course': { minutes: 30, reason: 'Session de course à pied standard', activity: 'courir' },
      'marche': { minutes: 30, reason: 'Marche active recommandée', activity: 'marcher' },
      
      // Travail & Études
      'pomodoro': { minutes: 25, reason: 'Technique Pomodoro classique pour concentration optimale', activity: 'faire un Pomodoro' },
      'etude': { minutes: 50, reason: 'Session d\'étude efficace avec concentration soutenue', activity: 'étudier' },
      'etudier': { minutes: 50, reason: 'Session d\'étude efficace avec concentration soutenue', activity: 'étudier' },
      'travail': { minutes: 50, reason: 'Session de travail concentré', activity: 'travailler' },
      'travailler': { minutes: 50, reason: 'Session de travail concentré', activity: 'travailler' },
      'revision': { minutes: 45, reason: 'Temps pour réviser efficacement', activity: 'réviser' },
      'lecture': { minutes: 30, reason: 'Session de lecture concentrée', activity: 'lire' },
      
      // Cuisine
      'poulet': { hours: 1, minutes: 20, reason: 'Temps de cuisson standard pour un poulet de 1,2kg à 180°C', activity: 'cuire le poulet' },
      'gateau': { minutes: 35, reason: 'Temps de cuisson moyen pour un gâteau', activity: 'cuire le gâteau' },
      'pates': { minutes: 11, reason: 'Temps de cuisson al dente', activity: 'cuire les pâtes' },
      'riz': { minutes: 18, reason: 'Cuisson parfaite du riz', activity: 'cuire le riz' },
      'pizza': { minutes: 18, reason: 'Cuisson pizza au four standard', activity: 'cuire la pizza' },
      'viande': { minutes: 8, reason: 'Temps avant de retourner la viande', activity: 'retourner la viande' },
      'retourne': { minutes: 10, reason: 'Rappel pour retourner la cuisson', activity: 'retourner' },
      'pain': { minutes: 25, reason: 'Cuisson pain standard', activity: 'cuire le pain' },
      'oeuf': { minutes: 4, reason: 'Œuf à la coque parfait', activity: 'cuire l\'œuf' },
      'legumes': { minutes: 12, reason: 'Cuisson vapeur des légumes', activity: 'cuire les légumes' },
      
      // Tâches ménagères
      'lessive': { minutes: 35, reason: 'Cycle de lavage standard', activity: 'faire la lessive' },
      'menage': { minutes: 30, reason: 'Ménage rapide et efficace', activity: 'faire le ménage' },
      'nettoyage': { minutes: 20, reason: 'Nettoyage ciblé', activity: 'nettoyer' },
      
      // Autres
      'charge': { minutes: 60, reason: 'Charge complète d\'un appareil', activity: 'charger' },
      'batterie': { minutes: 60, reason: 'Charge de batterie standard', activity: 'charger la batterie' },
      'trajet': { minutes: 30, reason: 'Temps de trajet moyen', activity: 'faire le trajet' }
    };
    
    // Chercher une correspondance d'activité (avec texte normalisé sans accents)
    for (const [keyword, estimate] of Object.entries(activityEstimates)) {
      if (normalized.includes(keyword)) {
        const h = estimate.hours || 0;
        const m = estimate.minutes || 0;
        const s = estimate.seconds || 0;
        const emoji = activityEmojis[keyword] || '⏱️';
        
        return JSON.stringify({
          type: 'proposal',
          activity: estimate.activity,
          hours: h,
          minutes: m,
          seconds: s,
          reason: estimate.reason,
          emoji: emoji
        });
      }
    }
    
    // Si aucune correspondance, proposition générale
    return JSON.stringify({
      type: 'proposal',
      activity: 'activité générale',
      hours: 0,
      minutes: 20,
      seconds: 0,
      reason: 'Durée polyvalente pour la plupart des activités courtes',
      emoji: '⏱️'
    });
  };

  const handleQuickAction = async (text) => {
    // Au lieu de juste remplir l'input, on envoie directement le message
    setInputValue(text);
    
    // Ajouter le message de l'utilisateur
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsLoading(true);
    setError('');

    try {
      // Si pas de clé API, utiliser un mode "démo" simple
      let assistantResponse;
      
      if (apiKey) {
        assistantResponse = await callOpenAI(text);
      } else {
        // Mode démo sans API
        assistantResponse = handleDemoMode(text);
      }

      // Vérifier si c'est une commande de création de minuteur
      const timerData = parseTimerCommand(assistantResponse);
      
      if (timerData) {
        // Créer le minuteur avec animation de succès
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: JSON.stringify({
            type: 'success',
            hours: timerData.hours,
            minutes: timerData.minutes,
            seconds: timerData.seconds
          })
        }]);
        
        // Appeler la fonction de création
        setTimeout(() => {
          onCreateTimer(timerData);
          onClose();
        }, 1500);
      } else {
        // Ajouter la réponse de l'assistant
        setMessages(prev => [...prev, { role: 'assistant', content: assistantResponse }]);
      }
    } catch (err) {
      console.error('Erreur Tempo:', err);
      setError(err.message || 'Erreur lors de la communication avec l\'assistant');
      
      // Message d'erreur alternatif
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Désolé, j'ai rencontré une erreur. Peux-tu reformuler ta demande ?\n\nAstuce : Configure ta clé API OpenAI dans les paramètres pour une meilleure expérience." 
      }]);
    } finally {
      setIsLoading(false);
      setInputValue(''); // Vider l'input après envoi
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="tempo-assistant-overlay" onClick={(e) => e.target.className === 'tempo-assistant-overlay' && onClose()}>
      <div className="tempo-assistant-panel">
        {/* Header */}
        <div className="tempo-header">
          <div className="tempo-title">
            <div className="tempo-icon">🤖</div>
            <div>
              <h3>{t('tempoTitle')}</h3>
              <p className="tempo-subtitle">{t('tempoSubtitle')}</p>
            </div>
          </div>
          <button className="tempo-close-btn" onClick={onClose}>×</button>
        </div>

        {/* Chat Container */}
        <div className="tempo-chat-container" ref={chatContainerRef}>
          {messages.map((message, index) => (
            <div key={index} className={`tempo-message ${message.role}`}>
              <div className="message-bubble">
                {renderMessageContent(message.content)}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="tempo-message assistant">
              <div className="message-bubble">
                <div className="tempo-loading">
                  <div className="tempo-loading-dot"></div>
                  <div className="tempo-loading-dot"></div>
                  <div className="tempo-loading-dot"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Container */}
        <div className="tempo-input-container">
          {/* Actions rapides */}
          <div className="tempo-quick-actions">
            <button className="quick-action-btn" onClick={() => handleQuickAction(t('tempoPomodoro') + ' 25 minutes')}>
              {t('tempoPomodoro')}
            </button>
            <button className="quick-action-btn" onClick={() => handleQuickAction(t('tempoMeditation') + ' 10 minutes')}>
              {t('tempoMeditation')}
            </button>
            <button className="quick-action-btn" onClick={() => handleQuickAction(t('tempoNap') + ' 20 minutes')}>
              {t('tempoNap')}
            </button>
            <button className="quick-action-btn" onClick={() => handleQuickAction(t('tempoSport') + ' 30 minutes')}>
              {t('tempoSport')}
            </button>
          </div>

          {error && <div className="tempo-error">{t('tempoError')} {error}</div>}

          <div className="tempo-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              className="tempo-input"
              placeholder={t('tempoInputPlaceholder')}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button 
              className="tempo-send-btn" 
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TempoAssistant;
