# Commandes Utiles - Smart Export Global Platform

## 🚀 Démarrage

### Démarrage automatique (Recommandé)
```bash
chmod +x start.sh
./start.sh
```

### Démarrage manuel

**Backend:**
```bash
mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## 📦 Installation

### Backend
```bash
# Installation des dépendances
mvn clean install

# Installation sans tests
mvn clean install -DskipTests
```

### Frontend
```bash
cd frontend
npm install
```

## 🧪 Tests

### Backend - Tous les tests
```bash
mvn test
```

### Backend - Tests spécifiques
```bash
# Tests du service de calcul
mvn test -Dtest=CalculationServiceTest

# Tests du controller des ports
mvn test -Dtest=PortControllerTest

# Tests du controller de calcul
mvn test -Dtest=CalculationControllerTest
```

### Backend - Tests d'intégration
```bash
mvn verify
```

### Backend - Couverture de tests
```bash
mvn test jacoco:report
# Rapport dans: target/site/jacoco/index.html
```

## 🏗️ Build

### Backend - Package JAR
```bash
mvn clean package

# JAR généré dans: target/smart-export-platform-1.0.0.jar
```

### Frontend - Build production
```bash
cd frontend
npm run build

# Fichiers dans: frontend/dist/
```

### Frontend - Preview du build
```bash
cd frontend
npm run preview
```

## 🗄️ Base de données

### Flyway - Informations
```bash
mvn flyway:info
```

### Flyway - Migration
```bash
mvn flyway:migrate
```

### Flyway - Nettoyage (⚠️ Supprime toutes les données)
```bash
mvn flyway:clean
```

### Flyway - Réparation
```bash
mvn flyway:repair
```

### PostgreSQL - Commandes utiles
```bash
# Se connecter à la base
psql -U smart_export_user -d smart_export_db

# Lister les tables
\dt

# Voir la structure d'une table
\d tarifs_douaniers
\d ports

# Compter les enregistrements
SELECT COUNT(*) FROM tarifs_douaniers;
SELECT COUNT(*) FROM ports;

# Voir les ports par pays
SELECT pays, COUNT(*) FROM ports GROUP BY pays;

# Quitter
\q
```

## 🔍 Vérification

### Backend - Santé de l'application
```bash
curl http://localhost:8080/api/ports
```

### Backend - Tester un calcul
```bash
curl -X POST http://localhost:8080/api/calculation/landed-cost \
  -H "Content-Type: application/json" \
  -d '{
    "codeHs": "0702.00",
    "paysDestination": "France",
    "valeurFob": 1000,
    "coutTransport": 100,
    "assurance": 50,
    "currency": "EUR",
    "portId": 1
  }'
```

### Frontend - Vérifier le build
```bash
cd frontend
npm run build
ls -lh dist/
```

## 📊 Logs

### Backend - Voir les logs en temps réel
```bash
tail -f backend.log
```

### Frontend - Voir les logs en temps réel
```bash
tail -f frontend.log
```

### Backend - Logs Spring Boot
```bash
# Avec Maven
mvn spring-boot:run | tee backend.log

# Avec JAR
java -jar target/smart-export-platform-1.0.0.jar | tee backend.log
```

## 🧹 Nettoyage

### Backend - Nettoyer les builds
```bash
mvn clean
```

### Frontend - Nettoyer node_modules et build
```bash
cd frontend
rm -rf node_modules dist
npm install
```

### Nettoyer les logs
```bash
rm -f backend.log frontend.log
```

## 🔧 Développement

### Backend - Recompilation automatique
```bash
mvn spring-boot:run -Dspring-boot.run.fork=false
```

### Frontend - Mode développement avec HMR
```bash
cd frontend
npm run dev
# Hot Module Replacement activé automatiquement
```

### Backend - Debug mode
```bash
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"
```

## 📝 Code Quality

### Backend - Formater le code
```bash
mvn formatter:format
```

### Backend - Vérifier le style
```bash
mvn checkstyle:check
```

### Frontend - Linter
```bash
cd frontend
npm run lint
```

## 🐳 Docker (Optionnel)

### Créer une image Docker
```bash
# Backend
docker build -t smart-export-backend .

# Frontend
cd frontend
docker build -t smart-export-frontend .
```

### Lancer avec Docker Compose
```bash
docker-compose up -d
```

## 📦 Dépendances

### Backend - Mettre à jour les dépendances
```bash
mvn versions:display-dependency-updates
```

### Frontend - Mettre à jour les dépendances
```bash
cd frontend
npm outdated
npm update
```

### Frontend - Audit de sécurité
```bash
cd frontend
npm audit
npm audit fix
```

## 🔄 Git

### Initialiser le repository
```bash
git init
git add .
git commit -m "Initial commit: Smart Export Global Platform"
```

### Créer une branche de développement
```bash
git checkout -b develop
```

### Pousser vers un remote
```bash
git remote add origin <url>
git push -u origin main
```

## 📊 Monitoring

### Backend - Activer Actuator (à ajouter dans pom.xml)
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

### Endpoints Actuator
```bash
# Health check
curl http://localhost:8080/actuator/health

# Métriques
curl http://localhost:8080/actuator/metrics

# Info
curl http://localhost:8080/actuator/info
```

## 🚀 Déploiement

### Production - Backend
```bash
# Build
mvn clean package -DskipTests

# Lancer
java -jar target/smart-export-platform-1.0.0.jar \
  --spring.profiles.active=prod
```

### Production - Frontend
```bash
cd frontend
npm run build

# Copier vers le backend
cp -r dist/* ../src/main/resources/static/
```

### Production - Avec profil
```bash
java -jar target/smart-export-platform-1.0.0.jar \
  --spring.profiles.active=prod \
  --server.port=8080 \
  --spring.datasource.url=jdbc:postgresql://prod-db:5432/smart_export_db
```

## 🔐 Sécurité

### Générer un secret pour JWT (futur)
```bash
openssl rand -base64 64
```

### Changer le mot de passe PostgreSQL
```bash
psql -U postgres
ALTER USER smart_export_user WITH PASSWORD 'new_password';
```

## 📈 Performance

### Backend - Profiling
```bash
java -agentlib:hprof=cpu=samples,depth=10 \
  -jar target/smart-export-platform-1.0.0.jar
```

### Frontend - Analyse du bundle
```bash
cd frontend
npm run build -- --mode analyze
```

## 🆘 Dépannage

### Port 8080 déjà utilisé
```bash
# Trouver le processus
lsof -i :8080

# Tuer le processus
kill -9 <PID>

# Ou changer le port
mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8081
```

### Port 3000 déjà utilisé
```bash
# Frontend sur un autre port
cd frontend
PORT=3001 npm run dev
```

### Réinitialiser complètement la base
```bash
psql -U postgres
DROP DATABASE smart_export_db;
CREATE DATABASE smart_export_db;
GRANT ALL PRIVILEGES ON DATABASE smart_export_db TO smart_export_user;
\q

# Relancer l'application (Flyway va recréer tout)
mvn spring-boot:run
```

### Problème de cache Maven
```bash
mvn dependency:purge-local-repository
mvn clean install
```

### Problème de cache npm
```bash
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## 📚 Documentation

### Générer la Javadoc
```bash
mvn javadoc:javadoc
# Documentation dans: target/site/apidocs/
```

### Générer le site Maven
```bash
mvn site
# Site dans: target/site/
```

## 🎯 Raccourcis utiles

### Tout nettoyer et redémarrer
```bash
# Backend
mvn clean install && mvn spring-boot:run

# Frontend
cd frontend && rm -rf node_modules && npm install && npm run dev
```

### Test rapide complet
```bash
mvn clean test && cd frontend && npm test && cd ..
```

### Build complet pour production
```bash
mvn clean package -DskipTests && \
cd frontend && npm run build && \
cp -r dist/* ../src/main/resources/static/ && \
cd ..
```

---

**💡 Astuce:** Ajoutez ces commandes à des alias dans votre `.bashrc` ou `.zshrc` pour un accès rapide !

```bash
alias smart-start="cd /path/to/smart-export-platform && ./start.sh"
alias smart-test="cd /path/to/smart-export-platform && mvn test"
alias smart-build="cd /path/to/smart-export-platform && mvn clean package"
```
