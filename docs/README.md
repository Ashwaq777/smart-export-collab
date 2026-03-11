# Smart Export Platform - Documentation

## Vue d'ensemble du projet

Smart Export Platform est une solution web complète pour la gestion des exportations agricoles, intégrant traçabilité, calcul des coûts d'exportation et gestion des réglementations mondiales. La plateforme permet aux entreprises d'optimiser leurs processus d'exportation tout en assurant la conformité réglementaire.

## Stack technique

### Backend
- **Framework** : Java Spring Boot 3.2.0
- **Base de données** : PostgreSQL
- **Génération PDF** : iText 7
- **Sécurité** : JWT Token, Spring Security
- **Build** : Maven 3.11.0
- **Java** : JDK 17

### Frontend
- **Framework** : React 18
- **Build tool** : Vite
- **Styling** : Tailwind CSS
- **Icons** : Lucide React
- **HTTP Client** : Fetch API

### Infrastructure
- **Serveur backend** : Tomcat (embedded)
- **Serveur frontend** : Vite Dev Server
- **Base de données** : PostgreSQL locale

## Architecture du projet

```
smart-export-platform/
├── src/main/java/com/smartexport/platform/
│   ├── controller/          # REST API Controllers
│   │   ├── AuthController.java
│   │   ├── TraceabilityController.java
│   │   ├── CalculationController.java
│   │   ├── AdminController.java
│   │   └── ReglementationController.java
│   ├── service/             # Business Logic
│   │   ├── AuthService.java
│   │   ├── TraceabilityService.java
│   │   ├── CalculationService.java
│   │   ├── PdfGenerationService.java
│   │   ├── EmailService.java
│   │   └── CountryService.java
│   ├── entity/              # JPA Entities
│   │   ├── User.java
│   │   ├── TraceabilityRecord.java
│   │   ├── Country.java
│   │   ├── Port.java
│   │   └── ReglementationConfig.java
│   ├── repository/          # Data Access Layer
│   ├── dto/                 # Data Transfer Objects
│   ├── security/            # JWT & Security
│   └── config/              # Configuration
├── frontend/
│   ├── src/
│   │   ├── components/      # React Components
│   │   ├── pages/           # Page Components
│   │   │   ├── Home.jsx
│   │   │   ├── TraceabilityPage.jsx
│   │   │   ├── Calculator.jsx
│   │   │   └── AdminDashboard.jsx
│   │   ├── services/        # API Services
│   │   └── utils/           # Utilities
│   ├── public/
│   └── package.json
└── docs/                    # Documentation
```

## Comment démarrer le projet

### Backend
```bash
# Terminal 1
cd /Users/user/CascadeProjects/smart-export-platform
mvn clean compile -DskipTests
mvn spring-boot:run
```
Le backend démarrera sur `http://localhost:8080`

### Frontend
```bash
# Terminal 2
cd /Users/user/CascadeProjects/smart-export-platform/frontend
npm install
npm run dev
```
Le frontend démarrera sur `http://localhost:5173`

## Variables d'environnement requises

### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_export
DB_USERNAME=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=86400000

# Email (optionnel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=Smart Export Platform
```

## Ports utilisés

- **Backend** : 8080 (Spring Boot/Tomcat)
- **Frontend** : 5173 (Vite Dev Server)
- **Database** : 5432 (PostgreSQL)

## Points d'accès principaux

- **Application** : http://localhost:5173
- **API Backend** : http://localhost:8080/api
- **Documentation API** : http://localhost:8080/swagger-ui.html (si configuré)
- **Base de données** : localhost:5432

## Comptes de test

### Administrateur
- Email : admin@smartexport.com
- Mot de passe : admin123
- Rôle : ADMIN

### Utilisateur standard
- Email : user@smartexport.com
- Mot de passe : user123
- Rôle : USER

## Support et assistance

Pour toute question ou problème technique :
1. Consulter la documentation API dans `/docs/API_REFERENCE.md`
2. Vérifier les logs du backend dans la console
3. Consulter le changelog dans `/docs/CHANGELOG.md` pour les dernières mises à jour
