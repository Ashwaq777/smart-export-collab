# Smart Export Global Platform - Guide de Déploiement

## 📋 Table des matières
- [Vue d'ensemble](#vue-densemble)
- [Prérequis](#prérequis)
- [Installation Backend](#installation-backend)
- [Installation Frontend](#installation-frontend)
- [Configuration Base de données](#configuration-base-de-données)
- [Lancement de l'application](#lancement-de-lapplication)
- [Tests](#tests)
- [Fonctionnalités](#fonctionnalités)

## 🎯 Vue d'ensemble

Smart Export Global Platform est une application complète de calcul des coûts d'importation (Landed Cost) incluant:
- Calcul automatique des droits de douane, TVA, taxes parafiscales et frais portuaires
- Support multi-devises (EUR, USD, MAD)
- Gestion des ports (Europe et USA)
- Génération de PDF détaillés
- Interface d'administration complète
- API REST documentée

## 📦 Prérequis

### Backend
- Java 17 ou supérieur
- Maven 3.8+
- PostgreSQL 14+

### Frontend
- Node.js 18+ et npm 9+

## 🔧 Installation Backend

### 1. Configuration de la base de données

Créez une base de données PostgreSQL:

```sql
CREATE DATABASE smart_export_db;
CREATE USER smart_export_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE smart_export_db TO smart_export_user;
```

### 2. Configuration de l'application

Modifiez `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/smart_export_db
    username: smart_export_user
    password: your_password
  jpa:
    hibernate:
      ddl-auto: validate
  flyway:
    enabled: true
```

### 3. Installation des dépendances

```bash
cd /Users/user/CascadeProjects/smart-export-platform
mvn clean install
```

### 4. Lancement du backend

```bash
mvn spring-boot:run
```

Le backend sera accessible sur `http://localhost:8080`

## 🎨 Installation Frontend

### 1. Installation des dépendances

```bash
cd frontend
npm install
```

### 2. Lancement du serveur de développement

```bash
npm run dev
```

Le frontend sera accessible sur `http://localhost:3000`

### 3. Build pour la production

```bash
npm run build
```

Les fichiers de production seront dans le dossier `frontend/dist`

## 🗄️ Configuration Base de données

Les migrations Flyway s'exécutent automatiquement au démarrage. Elles incluent:

### V6 - Ports et USA
- Création de la table `ports`
- Ajout des ports européens (Rotterdam, Hambourg, Anvers, Marseille)
- Ajout des ports USA (New York, Los Angeles, Miami, Houston)
- Ajout des tarifs douaniers pour les USA

### Structure des tables principales

**tarifs_douaniers**
- `id` (PK)
- `code_hs` (VARCHAR 10)
- `nom_produit` (VARCHAR 255)
- `categorie` (VARCHAR 100)
- `pays_destination` (VARCHAR 255)
- `taux_douane` (NUMERIC 5,2)
- `taux_tva` (NUMERIC 5,2)
- `taxe_parafiscale` (NUMERIC 5,2)

**ports**
- `id` (PK)
- `nom_port` (VARCHAR 255)
- `pays` (VARCHAR 255)
- `type_port` (VARCHAR 50) - Maritime/Aérien
- `frais_portuaires` (NUMERIC 10,2)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## 🚀 Lancement de l'application

### Mode développement

**Terminal 1 - Backend:**
```bash
cd /Users/user/CascadeProjects/smart-export-platform
mvn spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd /Users/user/CascadeProjects/smart-export-platform/frontend
npm run dev
```

Accédez à l'application sur `http://localhost:3000`

### Mode production

1. Build du frontend:
```bash
cd frontend
npm run build
```

2. Copiez les fichiers du dossier `dist` dans `src/main/resources/static`

3. Lancez le backend:
```bash
mvn clean package
java -jar target/smart-export-platform-1.0.0.jar
```

## 🧪 Tests

### Tests unitaires backend

```bash
mvn test
```

### Tests d'intégration

```bash
mvn verify
```

### Tests spécifiques

```bash
# Test du CalculationService
mvn test -Dtest=CalculationServiceTest

# Test des endpoints Ports
mvn test -Dtest=PortControllerTest

# Test des calculs avec ports et USD
mvn test -Dtest=CalculationControllerTest
```

## ✨ Fonctionnalités

### 1. Calculateur de Landed Cost

**Formulaire dynamique:**
- Sélection Catégorie → Produit (filtrage automatique)
- Saisie CIF (FOB + Transport + Assurance)
- Sélection Pays → Port (filtrage par pays)
- Choix de devise (EUR, USD, MAD)

**Calculs automatiques:**
- Valeur CAF (CIF)
- Droits de douane (selon pays et produit)
- TVA (base: CAF + Douane)
- Taxe parafiscale (si applicable, ex: Maroc 0.25%)
- Frais portuaires (si port sélectionné)
- **Grand Total (Landed Cost)**

**Conversions de devises:**
- Conversion automatique EUR/USD si devise différente
- Taux de change en temps réel via ExchangeRate-API

### 2. Dashboard de résultats

Affichage détaillé:
- Informations produit (Code HS, nom, pays, port)
- Cartes statistiques (Douane, TVA, Parafiscale, Frais portuaires)
- Grand Total mis en évidence
- Détail ligne par ligne des coûts
- Conversions de devises
- Disclaimer et source des taux

### 3. Génération PDF

**Contenu du PDF:**
- Logo "Smart Export Global"
- Informations produit complètes
- Tableau récapitulatif des coûts
- Conversions de devises
- Disclaimer automatique
- Date de génération
- Source des taux de change

**Téléchargement:**
Bouton "Télécharger le PDF" après calcul

### 4. Back-office Administration

**Onglet Produits:**
- Liste complète des produits avec recherche
- Création/Modification/Suppression
- Gestion des taux (douane, TVA, parafiscale)

**Onglet Ports:**
- Liste des ports avec filtres
- Ajout de nouveaux ports
- Modification des frais portuaires
- Type: Maritime ou Aérien

**Onglet Tarifs Douaniers:**
- Vue consolidée de tous les tarifs
- Filtrage par pays
- Recherche par produit/code HS/catégorie

## 📡 API Endpoints

### Ports
- `GET /api/ports` - Liste tous les ports
- `GET /api/ports?pays={pays}` - Ports par pays
- `GET /api/ports/{id}` - Détails d'un port
- `POST /api/ports` - Créer un port
- `PUT /api/ports/{id}` - Modifier un port
- `DELETE /api/ports/{id}` - Supprimer un port

### Tarifs Douaniers
- `GET /api/tarifs-douaniers` - Liste tous les tarifs
- `GET /api/tarifs-douaniers/categories` - Liste des catégories
- `GET /api/tarifs-douaniers/pays` - Liste des pays
- `GET /api/tarifs-douaniers/categorie/{categorie}` - Produits par catégorie
- `POST /api/tarifs-douaniers` - Créer un tarif
- `PUT /api/tarifs-douaniers/{id}` - Modifier un tarif
- `DELETE /api/tarifs-douaniers/{id}` - Supprimer un tarif

### Calculs
- `POST /api/calculation/landed-cost` - Calculer le landed cost
- `GET /api/calculation/alerte-seuil` - Vérifier seuil EPS

### PDF
- `POST /api/pdf/landed-cost` - Générer PDF du landed cost

### Forex
- `GET /api/forex/rates?base={currency}` - Taux de change
- `GET /api/forex/convert?amount={amount}&from={from}&to={to}` - Conversion

## 🌍 Pays et Ports supportés

### Europe
- **France:** Marseille (Maritime, 380 EUR)
- **Pays-Bas:** Rotterdam (Maritime, 450 EUR)
- **Allemagne:** Hambourg (Maritime, 420 EUR)
- **Belgique:** Anvers (Maritime, 400 EUR)

### USA
- **New York** (Maritime, 550 USD)
- **Los Angeles** (Maritime, 520 USD)
- **Miami** (Maritime, 500 USD)
- **Houston** (Maritime, 480 USD)

## 💱 Devises supportées

- **EUR** - Euro (devise par défaut)
- **USD** - Dollar américain
- **MAD** - Dirham marocain

Conversion automatique entre devises via ExchangeRate-API.

## 🔍 Exemple de calcul

**Entrée:**
- Produit: Tomates (0702.00)
- Pays: France
- Port: Marseille
- FOB: 1000 EUR
- Transport: 100 EUR
- Assurance: 50 EUR

**Sortie:**
- Valeur CAF: 1150 EUR
- Douane (10.4%): 119.60 EUR
- TVA (20%): 253.92 EUR
- Frais portuaires: 380 EUR
- **Total: 1903.52 EUR**

## 🛠️ Technologies utilisées

### Backend
- Spring Boot 3.2.0
- PostgreSQL + Flyway
- iText 7 (génération PDF)
- Lombok
- JUnit 5 + Mockito

### Frontend
- React 18.2
- Vite
- TailwindCSS 3.3
- Axios
- React Router 6
- Lucide React (icônes)

## 📝 Notes importantes

1. **Taux de change:** L'application utilise ExchangeRate-API. Assurez-vous d'avoir une connexion internet.

2. **Taxes parafiscales:** Actuellement configurées uniquement pour le Maroc (0.25%). Autres pays: 0%.

3. **TVA USA:** Les USA n'ont pas de TVA fédérale, donc taux TVA = 0%.

4. **Frais portuaires:** Optionnels. Si aucun port n'est sélectionné, les frais = 0.

5. **Disclaimer:** Tous les calculs sont des estimations non contractuelles.

## 🐛 Dépannage

### Backend ne démarre pas
- Vérifiez que PostgreSQL est lancé
- Vérifiez les credentials dans `application.yml`
- Vérifiez que le port 8080 est libre

### Frontend ne se connecte pas au backend
- Vérifiez que le backend est lancé sur le port 8080
- Vérifiez la configuration du proxy dans `vite.config.js`

### Erreurs de migration Flyway
- Supprimez la table `flyway_schema_history` et relancez
- Ou exécutez `mvn flyway:repair`

## 📧 Support

Pour toute question ou problème, consultez la documentation ou créez une issue sur le repository.

---

**Version:** 1.0.0  
**Date:** Février 2026  
**Auteur:** Smart Export Global Team
