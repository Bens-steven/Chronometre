@echo off
echo 🚀 Déploiement Timer App pour mobile...
echo.

cd /d "c:\Users\viotech\Documents\piscine python\frontend"

echo 📦 Construction de l'application...
call npm run build

echo.
echo ✅ Build terminé !
echo.
echo 📱 Pour tester sur mobile :
echo.
echo 1️⃣ Installation de serve (une seule fois) :
echo    npm install -g serve
echo.
echo 2️⃣ Démarrage du serveur :
echo    serve -s build -l 3000
echo.
echo 3️⃣ Trouvez votre IP locale :
echo    ipconfig
echo.
echo 4️⃣ Sur votre téléphone, allez sur :
echo    http://[VOTRE-IP]:3000
echo.
echo 📱 Installation PWA :
echo • Ouvrez dans Chrome/Safari mobile
echo • Menu "Ajouter à l'écran d'accueil"
echo • L'app s'installera comme une vraie app !
echo.
pause