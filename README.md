
# Chronometre
=======
# Chronomètre et Minuteur - Django REST + React

Application web de chronomètre et minuteur avec backend Django REST Framework et frontend React.

## 🚀 Installation

### Prérequis
- Python 3.8+
- Node.js 16+
- npm ou yarn

### Backend (Django)

1. Naviguez vers le dossier backend :
```bash
cd backend
```

2. Créez un environnement virtuel :
```bash
python -m venv venv
```

3. Activez l'environnement virtuel :
- Windows :
```bash
venv\Scripts\activate
```
- Linux/Mac :
```bash
source venv/bin/activate
```

4. Installez les dépendances :
```bash
pip install -r requirements.txt
```

5. Créez les migrations :
```bash
python manage.py makemigrations
python manage.py migrate
```

6. Créez un superutilisateur (optionnel) :
```bash
python manage.py createsuperuser
```

7. Lancez le serveur Django :
```bash
python manage.py runserver
```

Le backend sera accessible sur `http://localhost:8000`

### Frontend (React)

1. Dans un nouveau terminal, naviguez vers le dossier frontend :
```bash
cd frontend
```

2. Installez les dépendances :
```bash
npm install
```

3. Lancez le serveur de développement :
```bash
npm start
```

Le frontend sera accessible sur `http://localhost:3000`

## 📖 Utilisation

1. **Chronomètre** : Par défaut, l'application démarre en mode chronomètre. Cliquez sur "Start" pour démarrer le comptage, "Stop" pour arrêter, et "Reset" pour remettre à zéro.

2. **Minuteur** : Cliquez sur le bouton "Fenêtre" en haut à droite pour basculer en mode minuteur. Entrez les heures, minutes et secondes, puis cliquez sur "Définir" pour configurer le temps. Cliquez sur "Start" pour démarrer le compte à rebours.

3. **Basculement** : Cliquez sur "Fenêtre" à tout moment pour basculer entre le mode chronomètre et minuteur.

## 🔧 API Endpoints

### Timer
- `GET /api/timers/1/current/` - Obtenir l'état actuel du timer
- `POST /api/timers/1/action/` - Effectuer une action (start, stop, reset, toggle_mode)
- `POST /api/timers/1/set_time/` - Définir le temps initial du minuteur

### Exemples de requêtes

**Démarrer le timer** :
```bash
POST /api/timers/1/action/
{
  "action": "start"
}
```

**Arrêter le timer** :
```bash
POST /api/timers/1/action/
{
  "action": "stop"
}
```

**Réinitialiser le timer** :
```bash
POST /api/timers/1/action/
{
  "action": "reset"
}
```

**Basculer de mode** :
```bash
POST /api/timers/1/action/
{
  "action": "toggle_mode"
}
```

**Définir le temps du minuteur** :
```bash
POST /api/timers/1/set_time/
{
  "hours": 0,
  "minutes": 5,
  "seconds": 30
}
```

## 🗂️ Structure du Projet

```
.
├── backend/                 # Backend Django
│   ├── timer/              # Application timer
│   │   ├── models.py       # Modèles de données
│   │   ├── serializers.py  # Serializers DRF
│   │   ├── views.py        # Vues API
│   │   └── urls.py         # URLs de l'application
│   ├── timer_project/      # Configuration du projet
│   │   ├── settings.py     # Paramètres Django
│   │   └── urls.py         # URLs principales
│   └── manage.py           # Script de gestion Django
├── frontend/               # Frontend React
│   ├── src/
│   │   ├── components/     # Composants React
│   │   │   └── Stopwatch.js
│   │   ├── App.js          # Composant principal
│   │   └── index.js        # Point d'entrée
│   └── package.json        # Dépendances npm
├── main_pyqt5_backup.py    # Ancienne version PyQt5 (sauvegarde)
└── README.md               # Ce fichier
```

## 🎨 Fonctionnalités

- ✅ Chronomètre (compte vers le haut)
- ✅ Minuteur (compte à rebours)
- ✅ Basculement entre les modes
- ✅ Interface utilisateur moderne et responsive
- ✅ API REST complète
- ✅ Mise à jour en temps réel
- ✅ Persistance des données

## 🔐 Sécurité

⚠️ **Note** : Cette application est configurée pour le développement. Pour la production :
- Changez `SECRET_KEY` dans `settings.py`
- Activez les vérifications de sécurité Django
- Configurez CORS correctement
- Utilisez une base de données de production (PostgreSQL, MySQL, etc.)
- Ajoutez l'authentification utilisateur

## 📝 Notes

- L'application utilise un seul timer (ID=1) par défaut
- Pour une utilisation multi-utilisateurs, ajoutez l'authentification Django
- Le timer se met à jour toutes les 100ms côté serveur et 10ms côté client

## 🐛 Dépannage

**Erreur CORS** : Assurez-vous que le backend Django est lancé et que CORS est configuré dans `settings.py`

**Erreur de connexion API** : Vérifiez que le backend est accessible sur `http://localhost:8000`

**Erreur npm** : Supprimez `node_modules` et `package-lock.json`, puis relancez `npm install`

## 📄 Licence

Ce projet est libre d'utilisation.

