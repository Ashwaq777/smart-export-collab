# Architecture - Smart Export Global Platform

## 🏗️ Vue d'ensemble

L'application suit une architecture **3-tiers** moderne avec séparation claire des responsabilités:

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Calculator  │  │    Admin     │  │  Dashboard   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                         │                                │
│                    ┌────▼────┐                          │
│                    │ API.js  │                          │
│                    └────┬────┘                          │
└─────────────────────────┼───────────────────────────────┘
                          │ HTTP/REST
┌─────────────────────────▼───────────────────────────────┐
│              BACKEND (Spring Boot)                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Controllers Layer                    │  │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │  │
│  │  │Tarif │ │Port  │ │Calc  │ │PDF   │ │Forex │  │  │
│  │  └───┬──┘ └───┬──┘ └───┬──┘ └───┬──┘ └───┬──┘  │  │
│  └──────┼────────┼────────┼────────┼────────┼──────┘  │
│         │        │        │        │        │          │
│  ┌──────▼────────▼────────▼────────▼────────▼──────┐  │
│  │              Services Layer                      │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐  │  │
│  │  │TarifService│ │PortService │ │CalcService │  │  │
│  │  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘  │  │
│  └────────┼──────────────┼──────────────┼──────────┘  │
│           │              │              │              │
│  ┌────────▼──────────────▼──────────────▼──────────┐  │
│  │           Repositories Layer (JPA)              │  │
│  │  ┌────────────┐ ┌────────────┐                  │  │
│  │  │TarifRepo   │ │PortRepo    │                  │  │
│  │  └─────┬──────┘ └─────┬──────┘                  │  │
│  └────────┼──────────────┼──────────────────────────┘  │
└───────────┼──────────────┼─────────────────────────────┘
            │              │
┌───────────▼──────────────▼─────────────────────────────┐
│              DATABASE (PostgreSQL)                      │
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │ tarifs_douaniers │  │      ports       │           │
│  └──────────────────┘  └──────────────────┘           │
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │   siv_prices     │  │ flyway_history   │           │
│  └──────────────────┘  └──────────────────┘           │
└─────────────────────────────────────────────────────────┘
```

## 📦 Structure Backend (Spring Boot)

### Couche Controller (REST API)
**Responsabilité:** Exposition des endpoints REST, validation des requêtes

```
com.smartexport.platform.controller/
├── TarifDouanierController.java    # CRUD tarifs douaniers
├── PortController.java              # CRUD ports
├── CalculationController.java       # Calculs landed cost
├── PdfController.java               # Génération PDF
└── ForexController.java             # Taux de change
```

**Annotations clés:**
- `@RestController` - Marque comme contrôleur REST
- `@RequestMapping("/api/...")` - Définit le chemin de base
- `@CrossOrigin` - Active CORS pour le frontend
- `@Valid` - Validation automatique des DTOs

### Couche Service (Business Logic)
**Responsabilité:** Logique métier, orchestration, calculs

```
com.smartexport.platform.service/
├── TarifDouanierService.java        # Gestion tarifs
├── PortService.java                 # Gestion ports
├── CalculationService.java          # Calculs complexes
├── PdfGenerationService.java        # Génération PDF
└── ExchangeRateService.java         # Conversion devises
```

**Logique métier clé:**
- Calcul CAF = FOB + Transport + Assurance
- Calcul Douane = CAF × Taux / 100
- Calcul TVA = (CAF + Douane) × Taux / 100
- Ajout frais portuaires au total
- Conversion multi-devises

### Couche Repository (Data Access)
**Responsabilité:** Accès aux données, requêtes JPA

```
com.smartexport.platform.repository/
├── TarifDouanierRepository.java     # Requêtes tarifs
├── PortRepository.java              # Requêtes ports
└── SivPriceRepository.java          # Requêtes prix SIV
```

**Méthodes personnalisées:**
- `findByCodeHsAndPaysDestination()` - Recherche tarif
- `findByPays()` - Ports par pays
- `findByTypePort()` - Ports par type

### Couche Entity (Domain Model)
**Responsabilité:** Modèle de données, mapping JPA

```
com.smartexport.platform.entity/
├── TarifDouanier.java               # Tarif douanier
├── Port.java                        # Port maritime/aérien
└── SivPrice.java                    # Prix d'entrée SIV
```

### Couche DTO (Data Transfer Objects)
**Responsabilité:** Transfert de données API ↔ Frontend

```
com.smartexport.platform.dto/
├── LandedCostCalculationDto.java    # Requête calcul
├── LandedCostResultDto.java         # Résultat calcul
├── PortDto.java                     # Port
├── TarifDouanierDto.java            # Tarif
└── ForexConversionDto.java          # Conversion devise
```

### Migrations Database (Flyway)
**Responsabilité:** Versioning de la base de données

```
src/main/resources/db/migration/
├── V1__init.sql                     # Initialisation
├── V2__refactor_to_single_table.sql # Refactoring
├── V3__add_parafiscal_tax.sql       # Taxe parafiscale
├── V4__create_siv_prices_table.sql  # Prix SIV
├── V5__normalize_hs_codes.sql       # Normalisation codes
└── V6__create_ports_table.sql       # Ports + USA
```

## 🎨 Structure Frontend (React)

### Pages
**Responsabilité:** Composants de niveau page, routing

```
src/pages/
├── Calculator.jsx                   # Page calcul landed cost
└── Admin.jsx                        # Page administration
```

**Calculator.jsx:**
- Formulaire dynamique avec filtrage
- Gestion de l'état local (useState)
- Appels API pour données et calculs
- Affichage du dashboard de résultats
- Téléchargement PDF

**Admin.jsx:**
- Système d'onglets (Produits, Ports, Tarifs)
- Délégation aux composants spécialisés

### Composants
**Responsabilité:** Composants réutilisables, UI

```
src/components/
├── CostDashboard.jsx                # Dashboard résultats
└── admin/
    ├── ProductsManager.jsx          # Gestion produits
    ├── PortsManager.jsx             # Gestion ports
    └── TariffsManager.jsx           # Vue tarifs
```

**Patterns utilisés:**
- Composants fonctionnels avec hooks
- Props drilling pour données
- Conditional rendering
- Event handlers pour interactions

### Services
**Responsabilité:** Communication avec le backend

```
src/services/
└── api.js                           # Client API centralisé
```

**Services exposés:**
- `tarifService` - CRUD tarifs
- `portService` - CRUD ports
- `calculationService` - Calculs
- `pdfService` - Génération PDF
- `forexService` - Taux de change

## 🔄 Flux de données

### Calcul Landed Cost (Exemple complet)

```
1. USER sélectionne catégorie
   └─> Calculator.jsx: handleInputChange()
       └─> API: GET /api/tarifs-douaniers/categorie/{cat}
           └─> TarifDouanierController.getByCategorie()
               └─> TarifDouanierService.getByCategorie()
                   └─> TarifDouanierRepository.findByCategorie()
                       └─> PostgreSQL: SELECT * FROM tarifs_douaniers
                           └─> Retour: Liste produits
                               └─> Calculator.jsx: setProducts()
                                   └─> UI: Dropdown produits mis à jour

2. USER sélectionne pays
   └─> Calculator.jsx: handleInputChange()
       └─> API: GET /api/ports?pays={pays}
           └─> PortController.getAllPorts()
               └─> PortService.getPortsByPays()
                   └─> PortRepository.findByPays()
                       └─> PostgreSQL: SELECT * FROM ports
                           └─> Retour: Liste ports
                               └─> Calculator.jsx: setPorts()
                                   └─> UI: Dropdown ports mis à jour

3. USER clique "Calculer"
   └─> Calculator.jsx: handleSubmit()
       └─> API: POST /api/calculation/landed-cost
           └─> CalculationController.calculateLandedCost()
               └─> CalculationService.calculateLandedCost()
                   ├─> TarifDouanierRepository.findByCodeHsAndPays()
                   ├─> PortRepository.findById()
                   ├─> ExchangeRateService.convert()
                   └─> Calculs:
                       ├─> CAF = FOB + Transport + Assurance
                       ├─> Douane = CAF × Taux
                       ├─> TVA = (CAF + Douane) × Taux
                       ├─> Parafiscale = CAF × Taux
                       └─> Total = CAF + Douane + TVA + Para + Port
                           └─> Retour: LandedCostResultDto
                               └─> Calculator.jsx: setResult()
                                   └─> CostDashboard.jsx: Affichage

4. USER clique "Télécharger PDF"
   └─> Calculator.jsx: handleDownloadPdf()
       └─> API: POST /api/pdf/landed-cost
           └─> PdfController.generateLandedCostPdf()
               ├─> CalculationService.calculateLandedCost()
               └─> PdfGenerationService.generateLandedCostPdf()
                   └─> iText 7: Génération PDF
                       └─> Retour: byte[] (PDF)
                           └─> Browser: Téléchargement fichier
```

## 🗄️ Modèle de données

### Schéma relationnel

```sql
┌─────────────────────────────────────┐
│       tarifs_douaniers              │
├─────────────────────────────────────┤
│ id (PK)                    BIGSERIAL│
│ code_hs                    VARCHAR  │
│ nom_produit                VARCHAR  │
│ categorie                  VARCHAR  │
│ pays_destination           VARCHAR  │
│ taux_douane                NUMERIC  │
│ taux_tva                   NUMERIC  │
│ taxe_parafiscale           NUMERIC  │
└─────────────────────────────────────┘
         │
         │ 1:N (pays)
         │
┌────────▼────────────────────────────┐
│            ports                    │
├─────────────────────────────────────┤
│ id (PK)                    BIGSERIAL│
│ nom_port                   VARCHAR  │
│ pays                       VARCHAR  │
│ type_port                  VARCHAR  │
│ frais_portuaires           NUMERIC  │
│ created_at                 TIMESTAMP│
│ updated_at                 TIMESTAMP│
└─────────────────────────────────────┘
```

### Index pour performance

```sql
-- Tarifs
CREATE INDEX idx_tarifs_code_hs ON tarifs_douaniers(code_hs);
CREATE INDEX idx_tarifs_categorie ON tarifs_douaniers(categorie);
CREATE INDEX idx_tarifs_pays ON tarifs_douaniers(pays_destination);

-- Ports
CREATE INDEX idx_ports_pays ON ports(pays);
CREATE INDEX idx_ports_type ON ports(type_port);
```

## 🔐 Sécurité

### Validation des données

**Backend (Spring Validation):**
```java
@NotBlank(message = "Le code HS est requis")
private String codeHs;

@DecimalMin(value = "0.01", message = "La valeur doit être > 0")
private BigDecimal valeurFob;
```

**Frontend (HTML5 + React):**
```jsx
<input
  type="number"
  required
  min="0.01"
  step="0.01"
/>
```

### CORS Configuration

```java
@CrossOrigin(origins = "*")  // À restreindre en production
```

### Transactions

```java
@Transactional(readOnly = true)  // Lecture
@Transactional                    // Écriture
```

## 🚀 Performance

### Optimisations Backend
- **Lazy Loading** - Relations JPA chargées à la demande
- **Connection Pooling** - HikariCP (par défaut Spring Boot)
- **Index Database** - Sur colonnes fréquemment requêtées
- **DTO Pattern** - Évite l'exposition directe des entités

### Optimisations Frontend
- **Code Splitting** - Vite bundle optimization
- **Lazy Loading** - React.lazy() pour routes
- **Memoization** - useMemo() pour calculs coûteux
- **Debouncing** - Sur recherches en temps réel

## 📊 Patterns utilisés

### Backend
- **Repository Pattern** - Abstraction de l'accès aux données
- **Service Layer Pattern** - Logique métier séparée
- **DTO Pattern** - Transfert de données optimisé
- **Builder Pattern** - Construction d'objets complexes
- **Dependency Injection** - IoC Spring

### Frontend
- **Component Pattern** - Composants réutilisables
- **Container/Presenter** - Séparation logique/présentation
- **Hooks Pattern** - Gestion d'état avec hooks
- **Service Pattern** - API centralisée
- **Controlled Components** - Formulaires contrôlés

## 🧪 Tests

### Pyramide de tests

```
        ┌─────────────┐
        │     E2E     │  (À implémenter)
        └─────────────┘
      ┌─────────────────┐
      │  Integration    │  ✅ Controller Tests
      └─────────────────┘
    ┌───────────────────────┐
    │      Unit Tests       │  ✅ Service Tests
    └───────────────────────┘
```

### Couverture actuelle
- ✅ Service Layer - CalculationServiceTest
- ✅ Controller Layer - PortControllerTest, CalculationControllerTest
- 📝 À ajouter: Tests frontend (Jest, React Testing Library)

## 📈 Évolutivité

### Scalabilité horizontale
- **Stateless** - Aucun état en session
- **Database** - PostgreSQL supporte réplication
- **Load Balancer** - Nginx/HAProxy devant instances

### Extensibilité
- **Nouveaux pays** - Simple insertion en base
- **Nouveaux ports** - Via interface admin
- **Nouvelles devises** - Ajout dans enum + API forex
- **Nouveaux calculs** - Extension CalculationService

## 🔧 Configuration

### Environnements

**Development:**
```yaml
spring.jpa.show-sql: true
logging.level.com.smartexport: DEBUG
```

**Production:**
```yaml
spring.jpa.show-sql: false
logging.level.com.smartexport: INFO
server.compression.enabled: true
```

## 📚 Technologies Stack

### Backend
- **Framework:** Spring Boot 3.2.0
- **ORM:** Hibernate (JPA)
- **Database:** PostgreSQL 14+
- **Migration:** Flyway
- **PDF:** iText 7
- **Build:** Maven
- **Tests:** JUnit 5, Mockito

### Frontend
- **Framework:** React 18.2
- **Build:** Vite 5
- **Styling:** TailwindCSS 3.3
- **HTTP:** Axios
- **Routing:** React Router 6
- **Icons:** Lucide React

### DevOps
- **Version Control:** Git
- **CI/CD:** (À configurer)
- **Monitoring:** (À configurer)
- **Logs:** SLF4J + Logback

---

**Cette architecture garantit:**
- ✅ Maintenabilité
- ✅ Testabilité
- ✅ Scalabilité
- ✅ Extensibilité
- ✅ Performance
- ✅ Sécurité
