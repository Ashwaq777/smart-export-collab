#!/bin/bash

# Smart Export Global Platform - Script de démarrage
# Ce script lance le backend et le frontend en parallèle

echo "🚀 Smart Export Global Platform - Démarrage"
echo "=========================================="

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "pom.xml" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis la racine du projet"
    exit 1
fi

# Vérifier Java
if ! command -v java &> /dev/null; then
    echo "❌ Java n'est pas installé. Veuillez installer Java 17+"
    exit 1
fi

# Vérifier Maven
if ! command -v mvn &> /dev/null; then
    echo "❌ Maven n'est pas installé. Veuillez installer Maven 3.8+"
    exit 1
fi

# Vérifier Node
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez installer Node.js 18+"
    exit 1
fi

echo ""
echo "📦 Vérification des dépendances..."

# Installer les dépendances frontend si nécessaire
if [ ! -d "frontend/node_modules" ]; then
    echo "📥 Installation des dépendances frontend..."
    cd frontend
    npm install
    cd ..
fi

echo ""
echo "🔧 Compilation du backend..."
mvn clean install -DskipTests

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de la compilation du backend"
    exit 1
fi

echo ""
echo "✅ Compilation réussie!"
echo ""
echo "🚀 Lancement de l'application..."
echo ""
echo "Backend: http://localhost:8080"
echo "Frontend: http://localhost:3000"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter l'application"
echo ""

# Fonction pour nettoyer les processus à l'arrêt
cleanup() {
    echo ""
    echo "🛑 Arrêt de l'application..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Lancer le backend en arrière-plan
echo "🔵 Démarrage du backend Spring Boot..."
mvn spring-boot:run > backend.log 2>&1 &
BACKEND_PID=$!

# Attendre que le backend démarre
sleep 10

# Lancer le frontend en arrière-plan
echo "🟢 Démarrage du frontend React..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Application démarrée avec succès!"
echo ""
echo "📋 Logs:"
echo "  - Backend: tail -f backend.log"
echo "  - Frontend: tail -f frontend.log"
echo ""

# Attendre que l'utilisateur arrête l'application
wait
