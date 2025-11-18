export const translations = {
  fr: {
    // Navigation et modes
    stopwatch: 'Chronomètre',
    countdown: 'Minuteur',
    
    // Boutons principaux
    start: 'Démarrer',
    pause: 'Pause',
    stop: 'Arrêter',
    reset: 'Réinitialiser',
    
    // Boutons secondaires
    presets: 'Presets',
    sounds: 'Sons',
    focus: 'Focus',
    gestures: 'Gestes',
    tempo: 'Tempo',
    settings: 'Régler',
    analog: 'Analogique',
    digital: 'Numérique',
    
    // Presets
    predefinedTimers: 'Minuteurs Prédéfinis',
    noPresets: 'Aucun preset pour le moment',
    createPreset: 'Créer un preset',
    presetName: 'Nom du preset (ex: Sport 15min)',
    presetDescription: 'Description (optionnel)',
    save: 'Sauvegarder',
    cancel: 'Annuler',
    use: 'Utiliser',
    delete: 'Supprimer',
    creating: 'Création...',
    presetNameRequired: 'Le nom du preset est requis',
    presetCreatedSuccess: 'Preset créé avec succès !',
    presetCreatedError: 'Erreur: Le timer doit être en mode minuteur avec une durée définie pour créer un preset.',
    confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce preset ?',
    
    // Éditeur de temps
    setTimer: 'Régler le minuteur',
    hours: 'Heures',
    minutes: 'Minutes',
    seconds: 'Secondes',
    validate: 'Valider',
    
    // Alarmes
    alarmManager: 'Gestionnaire d\'alarmes',
    selectAlarm: 'Sélectionner une alarme',
    defaultAlarms: 'Alarmes par défaut',
    customAlarms: 'Alarmes personnalisées',
    uploadCustomAlarm: 'Télécharger une alarme personnalisée',
    noCustomAlarms: 'Aucune alarme personnalisée',
    
    // Assistant Tempo
    tempoAssistant: 'Assistant Tempo IA',
    tempoDescription: 'Décrivez ce que vous voulez chronométrer',
    tempoPlaceholder: 'Ex: 25 minutes de travail concentré, 5 minutes de pause',
    createTimer: 'Créer le minuteur',
    analyzing: 'Analyse...',
    
    // Tempo Assistant - Interface
    tempoTitle: 'Tempo Assistant',
    tempoSubtitle: 'Ton assistant intelligent pour créer des minuteurs',
    tempoWelcome: 'Bonjour ! Je suis Tempo, ton assistant pour créer des minuteurs.\n\nDis-moi ce que tu veux faire et je vais t\'aider à configurer le minuteur parfait !',
    tempoExamples: 'Exemples :',
    tempoExample1: '• "Je veux méditer 15 minutes"',
    tempoExample2: '• "Cuire un gâteau pendant 35 minutes"',
    tempoExample3: '• "Pomodoro de 25 minutes"',
    tempoInputPlaceholder: 'Que veux-tu faire ?',
    tempoError: 'Erreur :',
    tempoErrorMessage: 'Désolé, j\'ai rencontré une erreur. Peux-tu reformuler ta demande ?',
    tempoApiHint: 'Astuce : Configure ta clé API OpenAI dans les paramètres pour une meilleure expérience.',
    
    // Tempo - Actions rapides
    tempoPomodoro: 'Pomodoro',
    tempoMeditation: 'Méditation',
    tempoNap: 'Sieste',
    tempoSport: 'Sport',
    
    // Tempo - Proposition
    tempoProposalTitle: 'Proposition de minuteur',
    tempoProposalSubtitle: 'Tu veux',
    tempoModify: '✕ Modifier',
    tempoConfirm: '✓ Créer le minuteur',
    tempoSuccess: 'Parfait ! Je crée ton minuteur de',
    
    // Tempo - Unités de temps
    tempoHours: 'heures',
    tempoMinutes: 'minutes',
    tempoSeconds: 'secondes',
    
    // Messages
    focusModeActive: 'Mode Focus actif - Contrôles limités pendant le minuteur',
    focusModeDisabled: 'Mode Focus désactivé - Tous les contrôles disponibles',
    clickToStop: 'Cliquez n\'importe où pour arrêter l\'alarme',
    
    // Détection de gestes
    gestureDetection: 'Détection de gestes',
    gestureMode: 'Mode',
    detection: 'Détection',
    learning: 'Apprentissage',
    calibrate: 'Calibrer',
    clearSequence: 'Effacer',
    fingers: 'doigts',
    confidence: 'Confiance',
    sequence: 'Séquence',
    gestureGuide: 'Guide des Gestes',
    tips: 'Conseils',
    
    // Gestes - Interface détaillée
    gestureFist: 'Poing fermé',
    gestureIndex: 'Index levé',
    gestureVictory: 'Victoire',
    gestureThree: 'Trois doigts',
    gestureFour: 'Quatre doigts',
    gestureOpen: 'Main ouverte',
    
    // Gestes - Conseils
    gestureTipsTitle: 'Conseils',
    gestureTip1: '• Gardez votre main bien éclairée',
    gestureTip2: '• Maintenez le geste 1 seconde',
    gestureTip3: '• Évitez les mouvements brusques',
    gestureTip4: '• Distance : 30-60cm de la caméra',
    
    // Calibration
    calibrationTitle: 'Calibration des Gestes',
    calibrationDesc: 'La calibration va améliorer la détection de vos gestes personnels.\nVous allez montrer chaque geste pendant 3 secondes.',
    calibrationStart: 'Commencer',
    calibrationCancel: 'Annuler',
    calibrationStop: 'Arrêter',
    calibrationShow: 'Montrez',
    calibrationPreparation: 'Préparation...',
    calibrationComplete: 'Calibration terminée !',
    calibrationUnderstood: 'Compris',
    calibrationMaintain: 'Maintenez ce geste pendant 1 seconde pour qu\'il soit détecté',
    
    // Gestes - Instructions
    gestureShowFist: 'Fermez tous vos doigts',
    gestureShowIndex: 'Levez seulement l\'index',
    gestureShowVictory: 'Index et majeur en V',
    gestureShowThree: 'Index, majeur et annulaire',
    gestureShowFour: 'Tous sauf le pouce',
    gestureShowOpen: 'Tous les doigts ouverts',
    
    // Langue
    changeLanguage: 'Changer de langue',
    
    // Alarmes - Gestionnaire
    alarmManager: 'Gestion des Sons d\'Alarme',
    selectAlarm: 'Sélectionner une alarme',
    defaultAlarms: 'Sons par défaut',
    customAlarms: 'Sons personnalisés',
    uploadCustomAlarm: 'Ajouter un fichier audio',
    noCustomAlarms: 'Aucun son personnalisé. Ajoutez vos propres fichiers audio !',
    uploading: 'Upload en cours...',
    uploadError: 'Erreur lors de l\'upload',
    supportedFormats: 'Formats supportés: MP3, WAV, OGG, M4A, WebM (max 5MB)',
    confirmDeleteAlarm: 'Êtes-vous sûr de vouloir supprimer cette alarme ?',
    selected: 'Sélectionné',
    select: 'Sélectionner',
    close: 'Fermer',
    
    // Noms des alarmes par défaut
    alarmClassic: 'Classique',
    alarmBeep: 'Bip',
    alarmChime: 'Carillon',
    alarmBell: 'Cloche',
    alarmSiren: 'Sirène',
    
    // Descriptions des alarmes
    alarmClassicDesc: 'Son d\'alarme standard',
    alarmBeepDesc: 'Bips rapides et répétitifs',
    alarmChimeDesc: 'Carillon doux et mélodieux',
    alarmBellDesc: 'Sonnerie de cloche traditionnelle',
    alarmSirenDesc: 'Sirène d\'urgence puissante',
    customFile: 'Fichier personnalisé',
  },
  
  en: {
    // Navigation and modes
    stopwatch: 'Stopwatch',
    countdown: 'Timer',
    
    // Main buttons
    start: 'Start',
    pause: 'Pause',
    stop: 'Stop',
    reset: 'Reset',
    
    // Secondary buttons
    presets: 'Presets',
    sounds: 'Sounds',
    focus: 'Focus',
    gestures: 'Gestures',
    tempo: 'Tempo',
    settings: 'Settings',
    analog: 'Analog',
    digital: 'Digital',
    
    // Presets
    predefinedTimers: 'Predefined Timers',
    noPresets: 'No presets yet',
    createPreset: 'Create preset',
    presetName: 'Preset name (e.g. Sport 15min)',
    presetDescription: 'Description (optional)',
    save: 'Save',
    cancel: 'Cancel',
    use: 'Use',
    delete: 'Delete',
    creating: 'Creating...',
    presetNameRequired: 'Preset name is required',
    presetCreatedSuccess: 'Preset created successfully!',
    presetCreatedError: 'Error: Timer must be in countdown mode with a defined duration to create a preset.',
    confirmDelete: 'Are you sure you want to delete this preset?',
    
    // Time editor
    setTimer: 'Set Timer',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds',
    validate: 'Validate',
    
    // Alarms
    alarmManager: 'Alarm Manager',
    selectAlarm: 'Select an alarm',
    defaultAlarms: 'Default alarms',
    customAlarms: 'Custom alarms',
    uploadCustomAlarm: 'Upload custom alarm',
    noCustomAlarms: 'No custom alarms',
    
    // Tempo Assistant
    tempoAssistant: 'Tempo AI Assistant',
    tempoDescription: 'Describe what you want to time',
    tempoPlaceholder: 'E.g. 25 minutes of focused work, 5 minutes break',
    createTimer: 'Create timer',
    analyzing: 'Analyzing...',
    
    // Tempo Assistant - Interface
    tempoTitle: 'Tempo Assistant',
    tempoSubtitle: 'Your smart assistant to create timers',
    tempoWelcome: 'Hello! I\'m Tempo, your assistant for creating timers.\n\nTell me what you want to do and I\'ll help you set up the perfect timer!',
    tempoExamples: 'Examples:',
    tempoExample1: '• "I want to meditate for 15 minutes"',
    tempoExample2: '• "Bake a cake for 35 minutes"',
    tempoExample3: '• "Pomodoro for 25 minutes"',
    tempoInputPlaceholder: 'What do you want to do?',
    tempoError: 'Error:',
    tempoErrorMessage: 'Sorry, I encountered an error. Can you rephrase your request?',
    tempoApiHint: 'Tip: Configure your OpenAI API key in settings for a better experience.',
    
    // Tempo - Quick actions
    tempoPomodoro: 'Pomodoro',
    tempoMeditation: 'Meditation',
    tempoNap: 'Nap',
    tempoSport: 'Workout',
    
    // Tempo - Proposal
    tempoProposalTitle: 'Timer proposal',
    tempoProposalSubtitle: 'You want to',
    tempoModify: '✕ Modify',
    tempoConfirm: '✓ Create timer',
    tempoSuccess: 'Perfect! Creating your timer of',
    
    // Tempo - Time units
    tempoHours: 'hours',
    tempoMinutes: 'minutes',
    tempoSeconds: 'seconds',
    
    // Messages
    focusModeActive: 'Focus mode active - Limited controls during timer',
    focusModeDisabled: 'Focus mode disabled - All controls available',
    clickToStop: 'Click anywhere to stop the alarm',
    
    // Gesture detection
    gestureDetection: 'Gesture Detection',
    gestureMode: 'Mode',
    detection: 'Detection',
    learning: 'Learning',
    calibrate: 'Calibrate',
    clearSequence: 'Clear',
    fingers: 'fingers',
    confidence: 'Confidence',
    sequence: 'Sequence',
    gestureGuide: 'Gesture Guide',
    tips: 'Tips',
    
    // Gestures - Detailed interface
    gestureFist: 'Closed fist',
    gestureIndex: 'Index finger up',
    gestureVictory: 'Victory',
    gestureThree: 'Three fingers',
    gestureFour: 'Four fingers',
    gestureOpen: 'Open hand',
    
    // Gestures - Tips
    gestureTipsTitle: 'Tips',
    gestureTip1: '• Keep your hand well lit',
    gestureTip2: '• Hold the gesture for 1 second',
    gestureTip3: '• Avoid sudden movements',
    gestureTip4: '• Distance: 30-60cm from camera',
    
    // Calibration
    calibrationTitle: 'Gesture Calibration',
    calibrationDesc: 'Calibration will improve the detection of your personal gestures.\nYou will show each gesture for 3 seconds.',
    calibrationStart: 'Start',
    calibrationCancel: 'Cancel',
    calibrationStop: 'Stop',
    calibrationShow: 'Show',
    calibrationPreparation: 'Preparation...',
    calibrationComplete: 'Calibration complete!',
    calibrationUnderstood: 'Got it',
    calibrationMaintain: 'Hold this gesture for 1 second to be detected',
    
    // Gestures - Instructions
    gestureShowFist: 'Close all your fingers',
    gestureShowIndex: 'Raise only the index finger',
    gestureShowVictory: 'Index and middle finger in V',
    gestureShowThree: 'Index, middle and ring finger',
    gestureShowFour: 'All except thumb',
    gestureShowOpen: 'All fingers open',
    
    // Language
    changeLanguage: 'Change language',
    
    // Alarms - Manager
    alarmManager: 'Alarm Sound Management',
    selectAlarm: 'Select an alarm',
    defaultAlarms: 'Default sounds',
    customAlarms: 'Custom sounds',
    uploadCustomAlarm: 'Add audio file',
    noCustomAlarms: 'No custom sounds. Add your own audio files!',
    uploading: 'Uploading...',
    uploadError: 'Upload error',
    supportedFormats: 'Supported formats: MP3, WAV, OGG, M4A, WebM (max 5MB)',
    confirmDeleteAlarm: 'Are you sure you want to delete this alarm?',
    selected: 'Selected',
    select: 'Select',
    close: 'Close',
    
    // Default alarm names
    alarmClassic: 'Classic',
    alarmBeep: 'Beep',
    alarmChime: 'Chime',
    alarmBell: 'Bell',
    alarmSiren: 'Siren',
    
    // Alarm descriptions
    alarmClassicDesc: 'Standard alarm sound',
    alarmBeepDesc: 'Fast repetitive beeps',
    alarmChimeDesc: 'Soft melodious chime',
    alarmBellDesc: 'Traditional bell ring',
    alarmSirenDesc: 'Powerful emergency siren',
    customFile: 'Custom file',
  },
  
  mg: {
    // Navigation et modes
    stopwatch: 'Chronometer',
    countdown: 'Timer',
    
    // Boutons principaux
    start: 'Manomboka',
    pause: 'Mijanona',
    stop: 'Mitsahatra',
    reset: 'Mamerina',
    
    // Boutons secondaires
    presets: 'Presets',
    sounds: 'Feo',
    focus: 'Fifantohana',
    gestures: 'Fihetsika',
    tempo: 'Tempo',
    settings: 'Fepetra',
    analog: 'Analog',
    digital: 'Digital',
    
    // Presets
    predefinedTimers: 'Timer efa voafetra',
    noPresets: 'Tsy misy preset',
    createPreset: 'Mamorona preset',
    presetName: 'Anaran\'ny preset (oh: Sport 15min)',
    presetDescription: 'Famaritana (tsy tsy maintsy)',
    save: 'Tahiry',
    cancel: 'Hanafoana',
    use: 'Ampiasao',
    delete: 'Fafao',
    creating: 'Mamorona...',
    presetNameRequired: 'Ilaina ny anaran\'ny preset',
    presetCreatedSuccess: 'Voaforona soa aman-tsara ny preset!',
    presetCreatedError: 'Lesoka: Tsy maintsy ao amin\'ny mode countdown ny timer miaraka amin\'ny faharetan-toerana voafaritra mba hamoronana preset.',
    confirmDelete: 'Tena te hamafa ity preset ity ve ianao?',
    
    // Éditeur de temps
    setTimer: 'Mametraka Timer',
    hours: 'Ora',
    minutes: 'Minitra',
    seconds: 'Segondra',
    validate: 'Hamarino',
    
    // Alarmes
    alarmManager: 'Fitantanana ny fanairana',
    selectAlarm: 'Safidio fanairana',
    defaultAlarms: 'Fanairana tsotra',
    customAlarms: 'Fanairana manokana',
    uploadCustomAlarm: 'Hampiditra fanairana manokana',
    noCustomAlarms: 'Tsy misy fanairana manokana',
    
    // Assistant Tempo
    tempoAssistant: 'Tempo AI Assistant',
    tempoDescription: 'Lazalazao izay tianao alaina ny fotoana',
    tempoPlaceholder: 'Oh: 25 minitra asa mahery, 5 minitra fitsaharana',
    createTimer: 'Mamorona timer',
    analyzing: 'Mandinika...',
    
    // Tempo Assistant - Interface
    tempoTitle: 'Tempo Assistant',
    tempoSubtitle: 'Mpanampy marani-tsaina hamoronana timer',
    tempoWelcome: 'Salama! Izaho dia Tempo, mpanampy anao hamoronana timer.\n\nLazao ahy izay tianao atao ary hanampy anao hametraka ny timer tonga lafatra aho!',
    tempoExamples: 'Ohatra:',
    tempoExample1: '• "Te-hisaintsaina 15 minitra aho"',
    tempoExample2: '• "Mahandro mofo mandritra ny 35 minitra"',
    tempoExample3: '• "Pomodoro 25 minitra"',
    tempoInputPlaceholder: 'Inona no tianao atao?',
    tempoError: 'Lesoka:',
    tempoErrorMessage: 'Miala tsiny, nisy lesoka. Afaka mamerina ny fangatahana ve ianao?',
    tempoApiHint: 'Torohevitra: Amboary ny lakilen\'ny OpenAI API ao amin\'ny Settings mba hahazoanao traikefa tsara kokoa.',
    
    // Tempo - Actions rapides
    tempoPomodoro: 'Pomodoro',
    tempoMeditation: 'Fisaintsainana',
    tempoNap: 'Torimaso fohy',
    tempoSport: 'Fanatanjahantena',
    
    // Tempo - Proposition
    tempoProposalTitle: 'Tolo-kevitra timer',
    tempoProposalSubtitle: 'Tianao',
    tempoModify: '✕ Ovao',
    tempoConfirm: '✓ Mamorona timer',
    tempoSuccess: 'Tsara! Mamorona ny timer-nao',
    
    // Tempo - Unités de temps
    tempoHours: 'ora',
    tempoMinutes: 'minitra',
    tempoSeconds: 'segondra',
    
    // Messages
    focusModeActive: 'Mode fifantohana mandeha - Fehezan-dalàna voafetra mandritra ny timer',
    focusModeDisabled: 'Mode fifantohana tsy mandeha - Fehezan-dalàna rehetra misy',
    clickToStop: 'Tsindrio na aiza na aiza hampitsaharana ny fanairana',
    
    // Détection de gestes
    gestureDetection: 'Fitadiavana Fihetsika',
    gestureMode: 'Mode',
    detection: 'Fitadiavana',
    learning: 'Fianarana',
    calibrate: 'Calibrer',
    clearSequence: 'Fafao',
    fingers: 'rantsan-tanana',
    confidence: 'Fahatokisana',
    sequence: 'Filaharana',
    gestureGuide: 'Toromarika momba ny fihetsika',
    tips: 'Torohevitra',
    
    // Gestes - Interface détaillée
    gestureFist: 'Totohondry mihidy',
    gestureIndex: 'Fanondro miakatra',
    gestureVictory: 'Fandresena',
    gestureThree: 'Rantsan-tanana telo',
    gestureFour: 'Rantsan-tanana efatra',
    gestureOpen: 'Tanana misokatra',
    
    // Gestes - Conseils
    gestureTipsTitle: 'Torohevitra',
    gestureTip1: '• Aoka hazava tsara ny tananao',
    gestureTip2: '• Tazonao 1 segondra ny fihetsika',
    gestureTip3: '• Fadio ny fihetsika tampoka',
    gestureTip4: '• Halavirana: 30-60cm amin\'ny fakantsary',
    
    // Calibration
    calibrationTitle: 'Calibration ny Fihetsika',
    calibrationDesc: 'Ny calibration dia hanatsara ny fitadiavana ny fihetsika manokana anao.\nHasehonao mandritra ny 3 segondra ny fihetsika tsirairay.',
    calibrationStart: 'Atombohy',
    calibrationCancel: 'Hanafoana',
    calibrationStop: 'Mitsahatra',
    calibrationShow: 'Asehoy',
    calibrationPreparation: 'Fiomanana...',
    calibrationComplete: 'Vita ny calibration!',
    calibrationUnderstood: 'Azoko',
    calibrationMaintain: 'Tazonao 1 segondra ity fihetsika ity mba ho hita',
    
    // Gestes - Instructions
    gestureShowFist: 'Hidio daholo ny rantsan-tananao',
    gestureShowIndex: 'Atsangano ny fanondro ihany',
    gestureShowVictory: 'Fanondro sy rantsantanana afovoany amin\'ny V',
    gestureShowThree: 'Fanondro, afovoany ary peratra',
    gestureShowFour: 'Daholo afa-tsy ny ankihibe',
    gestureShowOpen: 'Rantsan-tanana rehetra misokatra',
    
    // Langue
    changeLanguage: 'Ovao ny fiteny',
    
    // Alarmes - Gestionnaire
    alarmManager: 'Fitantanana ny Feon\'ny Fanairana',
    selectAlarm: 'Safidio fanairana',
    defaultAlarms: 'Feo tsotra',
    customAlarms: 'Feo manokana',
    uploadCustomAlarm: 'Hanampy rakitra audio',
    noCustomAlarms: 'Tsy misy feo manokana. Ampidiro ny rakitra audio anao!',
    uploading: 'Mampiditra...',
    uploadError: 'Lesoka tamin\'ny fampidirana',
    supportedFormats: 'Format azo: MP3, WAV, OGG, M4A, WebM (max 5MB)',
    confirmDeleteAlarm: 'Tena te hamafa ity fanairana ity ve ianao?',
    selected: 'Voafidy',
    select: 'Safidio',
    close: 'Hidio',
    
    // Noms des alarmes par défaut
    alarmClassic: 'Mahazatra',
    alarmBeep: 'Beep',
    alarmChime: 'Lakolosy',
    alarmBell: 'Lakolosy lehibe',
    alarmSiren: 'Siren',
    
    // Descriptions des alarmes
    alarmClassicDesc: 'Feon\'ny fanairana mahazatra',
    alarmBeepDesc: 'Beep haingana miverimberina',
    alarmChimeDesc: 'Lakolosy malefaka sy mahafinaritra',
    alarmBellDesc: 'Feon\'ny lakolosy nentin-drazana',
    alarmSirenDesc: 'Siren mahery vaika maika',
    customFile: 'Rakitra manokana',
  },
};

export const getTranslation = (language, key) => {
  return translations[language]?.[key] || translations['fr'][key] || key;
};
