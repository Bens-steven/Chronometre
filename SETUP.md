# Guide d'installation et de démarrage

## 🔧 Installation initiale

### 1. Backend Django

```bash
# Aller dans le dossier backend
cd backend

# Créer un environnement virtuel
python -m venv venv

# Activer l'environnement virtuel
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Créer la base de données
python manage.py makemigrations
python manage.py migrate

# (Optionnel) Créer un superutilisateur pour l'admin
python manage.py createsuperuser
```

### 2. Frontend React

```bash
# Aller dans le dossier frontend
cd frontend

# Installer les dépendances
npm install
```

## 🚀 Démarrage

### Option 1 : Scripts de démarrage (Windows)

1. Double-cliquez sur `start_backend.bat` pour démarrer le backend
2. Dans un autre terminal, double-cliquez sur `start_frontend.bat` pour démarrer le frontend

### Option 2 : Commandes manuelles

**Terminal 1 - Backend:**
```bash
cd backend
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Option 3 : Scripts shell (Linux/Mac)

```bash
# Terminal 1
chmod +x start_backend.sh
./start_backend.sh

# Terminal 2
chmod +x start_frontend.sh
./start_frontend.sh
```

## 🌐 Accès à l'application

- **Frontend React**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Django**: http://localhost:8000/admin

## 📝 Première utilisation

1. Ouvrez votre navigateur et allez sur http://localhost:3000
2. L'application devrait se charger automatiquement
3. Le timer démarre en mode chronomètre par défaut
4. Cliquez sur "Fenêtre" pour basculer en mode minuteur

## 🐛 Dépannage

### Erreur: "Module not found"
- Vérifiez que vous avez installé toutes les dépendances
- Backend: `pip install -r requirements.txt`
- Frontend: `npm install`

### Erreur: "Port already in use"
- Le backend utilise le port 8000
- Le frontend utilise le port 3000
- Changez les ports ou arrêtez les processus qui les utilisent

### Erreur CORS
- Vérifiez que le backend est bien lancé
- Vérifiez que CORS est configuré dans `backend/timer_project/settings.py`

### Erreur de base de données
- Supprimez `backend/db.sqlite3` si elle existe
- Relancez `python manage.py migrate`

## 📚 Commandes utiles

### Backend
```bash
# Créer les migrations
python manage.py makemigrations

# Appliquer les migrations
python manage.py migrate

# Créer un superutilisateur
python manage.py createsuperuser

# Lancer le serveur de développement
python manage.py runserver

# Accéder au shell Django
python manage.py shell
```

### Frontend
```bash
# Démarrer le serveur de développement
npm start

# Créer une build de production
npm run build

# Lancer les tests
npm test
```

