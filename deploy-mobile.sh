#!/bin/bash
# Script de déploiement mobile pour Timer App

echo "🚀 Démarrage du build pour mobile..."

# Build de production
echo "📦 Construction de l'application..."
npm run build

# Vérification de la présence des fichiers PWA
echo "🔍 Vérification des fichiers PWA..."
if [ ! -f "public/manifest.json" ]; then
    echo "❌ Manifest PWA manquant!"
    exit 1
fi

echo "✅ Build terminé!"
echo ""
echo "📱 Options de déploiement mobile :"
echo ""
echo "1. 🌐 Serveur local (test mobile via IP):"
echo "   npm install -g serve"
echo "   serve -s build -l 3000"
echo "   Puis accédez via http://[VOTRE-IP]:3000"
echo ""
echo "2. 🔗 Déploiement gratuit avec Vercel:"
echo "   npm install -g vercel"
echo "   vercel --prod"
echo ""
echo "3. 📡 Déploiement avec Netlify:"
echo "   npm install -g netlify-cli"
echo "   netlify deploy --prod --dir=build"
echo ""
echo "4. 🏠 GitHub Pages:"
echo "   Pushes le code sur GitHub et active Pages"
echo ""
echo "Une fois déployé, les utilisateurs pourront:"
echo "• 📱 Installer l'app depuis leur navigateur mobile"
echo "• 🔔 Utiliser l'app hors ligne"
echo "• 🎵 Charger leurs propres sons d'alarme"