# 🚢 Maritime Transport Module - Implementation Plan

**Date**: March 2, 2026  
**Project**: Smart Export Platform  
**Objective**: Add maritime transport module with REAL FREE APIs (NO hardcoded data)

---

## 📋 APIs Sélectionnées (GRATUITES ET RÉELLES)

### 1️⃣ **Maritime/Shipping Data**
**API Choisie**: **SeaRates API (Free Tier)** + **World Port Index (Open Data)**
- **URL**: https://www.searates.com/reference/portdistance/
- **Alternative**: OpenShipping API / MarineTraffic Free Tier
- **Données**: Routes maritimes, distances, ports, temps de transit
- **Gratuit**: ✅ Oui (avec limitations raisonnables)
- **Justification**: API publique avec données réelles de routes maritimes

**Fallback**: Si SeaRates limité, utiliser **World Port Index Dataset** (domaine public)
- **URL**: https://msi.nga.mil/Publications/WPI
- **Format**: CSV/JSON public
- **Données**: 3700+ ports mondiaux avec coordonnées

### 2️⃣ **Shipping Companies & Vessels**
**API Choisie**: **Vessel Finder API (Free Tier)**
- **URL**: https://www.vesselfinder.com/api
- **Alternative**: ShipXplorer API Free
- **Données**: Navires, compagnies maritimes, capacités
- **Gratuit**: ✅ Oui (limited requests/day)

**Fallback**: Créer un dataset minimal basé sur données publiques des top compagnies:
- Maersk, MSC, CMA CGM, COSCO, Hapag-Lloyd (données publiques de leurs sites)

### 3️⃣ **Currency Exchange Rates**
**API Choisie**: **ExchangeRate-API.com (Free)**
- **URL**: https://www.exchangerate-api.com/
- **Déjà utilisé**: ✅ Oui dans le projet (ExchangeRateService.java)
- **Données**: Taux de change temps réel pour 160+ devises
- **Gratuit**: ✅ 1500 requests/month gratuit
- **Justification**: Déjà intégré, fiable, temps réel

### 4️⃣ **Countries Data**
**API Choisie**: **REST Countries API (Free)**
- **URL**: https://restcountries.com/
- **Déjà utilisé**: ✅ Oui dans countriesApi.js frontend
- **Données**: Pays, devises, codes ISO
- **Gratuit**: ✅ 100% gratuit, pas de clé API
- **Justification**: Déjà intégré, données complètes

---

## 🏗️ Architecture - Ajouts UNIQUEMENT (Pas de modification)

### Backend (Spring Boot)

#### **Nouvelles Entités** (à créer)
```
src/main/java/com/smartexport/platform/entity/
├── Ship.java                    // NEW - Navire
├── ShippingCompany.java         // NEW - Compagnie maritime
└── MaritimeRoute.java           // NEW - Route maritime
```

#### **Nouveaux DTOs** (à créer)
```
src/main/java/com/smartexport/platform/dto/
├── ShipDto.java                 // NEW - Données navire
├── ShippingCompanyDto.java      // NEW - Compagnie
├── MaritimeRouteDto.java        // NEW - Route
├── MaritimeTransportCostDto.java // NEW - Coûts transport
└── ShipSelectionDto.java        // NEW - Sélection navire
```

#### **Nouveaux Services** (à créer)
```
src/main/java/com/smartexport/platform/service/
├── MaritimeTransportService.java // NEW - Service principal transport maritime
├── ShipService.java              // NEW - Gestion navires
└── SeaRoutesApiService.java      // NEW - Intégration API routes maritimes
```

#### **Nouveaux Repositories** (à créer)
```
src/main/java/com/smartexport/platform/repository/
├── ShipRepository.java           // NEW
├── ShippingCompanyRepository.java // NEW
└── MaritimeRouteRepository.java  // NEW
```

#### **Nouveau Controller** (à créer)
```
src/main/java/com/smartexport/platform/controller/
└── MaritimeTransportController.java // NEW - Endpoints transport maritime
```

#### **Extensions Minimales** (modification légère)
```
✏️ LandedCostCalculationDto.java  // Ajouter: shipId, portOriginId
✏️ LandedCostResultDto.java       // Ajouter: maritime transport details
✏️ CalculationService.java        // Ajouter: calcul frais maritime
✏️ PdfGenerationService.java      // Ajouter: section transport maritime
```

### Frontend (React)

#### **Nouveaux Composants** (à créer)
```
frontend/src/components/
├── maritime/
│   ├── ShipSelector.jsx          // NEW - Sélecteur navire
│   ├── MaritimeTransportDetails.jsx // NEW - Détails transport
│   ├── RouteMap.jsx              // NEW - Carte route (optionnel)
│   └── ShippingCostBreakdown.jsx // NEW - Détail coûts
```

#### **Nouveaux Services** (à créer)
```
frontend/src/services/
├── maritimeTransportService.js   // NEW - API calls transport maritime
└── seaRoutesApi.js               // NEW - Intégration API routes
```

#### **Extensions Minimales** (modification légère)
```
✏️ Calculator.jsx                 // Ajouter: section transport maritime
✏️ CostDashboard.jsx              // Ajouter: affichage coûts maritime
```

---

## 📊 Modèle de Données

### **Ship (Navire)**
```java
@Entity
@Table(name = "ships")
public class Ship {
    @Id @GeneratedValue
    private Long id;
    
    private String name;              // Nom du navire
    private String imoNumber;         // IMO unique
    
    @ManyToOne
    private ShippingCompany company;  // Compagnie
    
    private String vesselType;        // Container, Bulk, etc.
    private Integer teuCapacity;      // Capacité TEU (20')
    private Integer feuCapacity;      // Capacité FEU (40')
    
    private BigDecimal averageSpeed;  // Vitesse moyenne (knots)
    private String flag;              // Pavillon
    
    // API source tracking
    private String dataSource;        // "VESSEL_FINDER_API" | "MANUAL"
    private LocalDateTime lastUpdated;
}
```

### **ShippingCompany (Compagnie Maritime)**
```java
@Entity
@Table(name = "shipping_companies")
public class ShippingCompany {
    @Id @GeneratedValue
    private Long id;
    
    private String name;              // Maersk, MSC, CMA CGM, etc.
    private String code;              // MAEU, MSCU, CMDU
    private String country;           // Pays d'origine
    private String website;
    
    // Tarifs de base par type conteneur (USD)
    private BigDecimal baseRate20ft;  // Tarif base 20'
    private BigDecimal baseRate40ft;  // Tarif base 40'
    private BigDecimal baseRate40hc;  // Tarif base 40' HC
}
```

### **MaritimeRoute (Route Maritime)**
```java
@Entity
@Table(name = "maritime_routes")
public class MaritimeRoute {
    @Id @GeneratedValue
    private Long id;
    
    @ManyToOne
    private Port originPort;          // Port origine
    
    @ManyToOne
    private Port destinationPort;     // Port destination
    
    private BigDecimal distanceNm;    // Distance nautical miles
    private BigDecimal distanceKm;    // Distance km
    
    private Integer estimatedDays;    // Délai estimé
    
    // Coûts de base
    private BigDecimal bunkerSurcharge;    // Surcharge carburant
    private BigDecimal canalFees;          // Frais canaux (Suez, Panama)
    private BigDecimal securitySurcharge;  // Surcharge sécurité
    
    // API source
    private String dataSource;        // "SEARATES_API" | "CALCULATED"
    private LocalDateTime lastUpdated;
}
```

---

## 🔧 Implémentation Détaillée

### **Phase 1: Backend - Entités et Repositories**

1. Créer entités Ship, ShippingCompany, MaritimeRoute
2. Créer repositories correspondants
3. Créer migration SQL pour tables

### **Phase 2: Backend - Services API**

#### **SeaRoutesApiService.java**
```java
@Service
public class SeaRoutesApiService {
    
    // Récupérer distance entre 2 ports via API
    public MaritimeRouteDto getRoute(String originPortCode, String destPortCode) {
        // Call SeaRates API ou World Port Index
        // Retourner distance, temps estimé
    }
    
    // Calculer coûts route
    public BigDecimal calculateRouteCost(MaritimeRoute route, String containerType) {
        // Formule: distance × tarif/nm + surcharges
    }
}
```

#### **MaritimeTransportService.java**
```java
@Service
public class MaritimeTransportService {
    
    // Récupérer navires disponibles pour une route
    public List<ShipDto> getAvailableShips(Long originPortId, Long destPortId) {
        // Filtrer navires par route
        // Appeler API Vessel Finder si nécessaire
    }
    
    // Calculer coût transport complet
    public MaritimeTransportCostDto calculateTransportCost(
        Long shipId, 
        Long originPortId, 
        Long destPortId,
        String containerType,
        String incoterm
    ) {
        // Fret maritime
        // Frais portuaires départ
        // Frais portuaires arrivée
        // Assurance transport
        // Total
    }
}
```

### **Phase 3: Backend - Extension CalculationService**

```java
// Dans CalculationService.java - AJOUTER UNIQUEMENT
public LandedCostResultDto calculateLandedCost(LandedCostCalculationDto request) {
    // ... code existant ...
    
    // NOUVEAU: Calcul frais maritime si shipId fourni
    MaritimeTransportCostDto maritimeCost = null;
    if (request.getShipId() != null && request.getPortOriginId() != null) {
        maritimeCost = maritimeTransportService.calculateTransportCost(
            request.getShipId(),
            request.getPortOriginId(),
            request.getPortId(), // destination
            request.getTypeUnite(),
            request.getIncoterm()
        );
        
        // Ajouter frais maritime au coût transport
        coutTransport = coutTransport.add(maritimeCost.getTotalFreight());
    }
    
    // ... reste du code existant ...
    
    return LandedCostResultDto.builder()
        // ... champs existants ...
        .maritimeTransport(maritimeCost) // NOUVEAU
        .build();
}
```

### **Phase 4: Frontend - Composants**

#### **ShipSelector.jsx**
```jsx
const ShipSelector = ({ originPortId, destPortId, onShipSelect }) => {
  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (originPortId && destPortId) {
      loadAvailableShips();
    }
  }, [originPortId, destPortId]);
  
  const loadAvailableShips = async () => {
    setLoading(true);
    const data = await maritimeTransportService.getAvailableShips(
      originPortId, 
      destPortId
    );
    setShips(data);
    setLoading(false);
  };
  
  return (
    <div className="ship-selector">
      <label>Sélectionner un navire</label>
      <select onChange={(e) => onShipSelect(e.target.value)}>
        <option value="">-- Choisir un navire --</option>
        {ships.map(ship => (
          <option key={ship.id} value={ship.id}>
            {ship.name} - {ship.company.name} 
            (Capacité: {ship.teuCapacity} TEU)
          </option>
        ))}
      </select>
    </div>
  );
};
```

#### **MaritimeTransportDetails.jsx**
```jsx
const MaritimeTransportDetails = ({ maritimeTransport }) => {
  if (!maritimeTransport) return null;
  
  return (
    <div className="maritime-transport-details">
      <h3>🚢 Transport Maritime</h3>
      
      <div className="ship-info">
        <p><strong>Navire:</strong> {maritimeTransport.shipName}</p>
        <p><strong>Compagnie:</strong> {maritimeTransport.companyName}</p>
        <p><strong>Distance:</strong> {maritimeTransport.distanceNm} NM</p>
        <p><strong>Délai estimé:</strong> {maritimeTransport.estimatedDays} jours</p>
      </div>
      
      <div className="cost-breakdown">
        <h4>Détail des coûts</h4>
        <table>
          <tr>
            <td>Fret maritime</td>
            <td>{formatCurrency(maritimeTransport.freightCost)}</td>
          </tr>
          <tr>
            <td>Frais port départ</td>
            <td>{formatCurrency(maritimeTransport.originPortFees)}</td>
          </tr>
          <tr>
            <td>Frais port arrivée</td>
            <td>{formatCurrency(maritimeTransport.destPortFees)}</td>
          </tr>
          <tr>
            <td>Assurance transport</td>
            <td>{formatCurrency(maritimeTransport.insuranceCost)}</td>
          </tr>
          <tr className="total">
            <td><strong>Total Transport Maritime</strong></td>
            <td><strong>{formatCurrency(maritimeTransport.totalCost)}</strong></td>
          </tr>
        </table>
      </div>
    </div>
  );
};
```

### **Phase 5: Extension Calculator.jsx**

```jsx
// Dans Calculator.jsx - AJOUTER section transport maritime
const [selectedShip, setSelectedShip] = useState(null);
const [portOrigin, setPortOrigin] = useState(null);

// NOUVEAU: Section Transport Maritime (après sélection port destination)
{formData.portId && (
  <div className="maritime-transport-section">
    <h3>🚢 Transport Maritime (Optionnel)</h3>
    
    <div className="form-group">
      <label>Port d'origine</label>
      <select 
        value={portOrigin} 
        onChange={(e) => setPortOrigin(e.target.value)}
      >
        <option value="">-- Sélectionner port origine --</option>
        {originPorts.map(port => (
          <option key={port.id} value={port.id}>
            {port.nomPort} ({port.pays})
          </option>
        ))}
      </select>
    </div>
    
    {portOrigin && (
      <ShipSelector 
        originPortId={portOrigin}
        destPortId={formData.portId}
        onShipSelect={setSelectedShip}
      />
    )}
  </div>
)}
```

### **Phase 6: Extension PDF**

```java
// Dans PdfGenerationService.java - AJOUTER section maritime
private void addMaritimeTransportSection(Document document, LandedCostResultDto result) {
    if (result.getMaritimeTransport() == null) {
        return; // Pas de transport maritime sélectionné
    }
    
    MaritimeTransportCostDto mt = result.getMaritimeTransport();
    
    document.add(new Paragraph("TRANSPORT MARITIME")
        .setFont(boldFont)
        .setFontSize(14)
        .setMarginTop(20));
    
    Table table = new Table(2);
    table.setWidth(UnitValue.createPercentValue(100));
    
    addTableRow(table, "Navire", mt.getShipName());
    addTableRow(table, "Compagnie", mt.getCompanyName());
    addTableRow(table, "Distance", mt.getDistanceNm() + " NM");
    addTableRow(table, "Délai estimé", mt.getEstimatedDays() + " jours");
    addTableRow(table, "Fret maritime", formatCurrency(mt.getFreightCost()));
    addTableRow(table, "Frais port départ", formatCurrency(mt.getOriginPortFees()));
    addTableRow(table, "Frais port arrivée", formatCurrency(mt.getDestPortFees()));
    addTableRow(table, "Assurance transport", formatCurrency(mt.getInsuranceCost()));
    addTableRow(table, "Total Transport", formatCurrency(mt.getTotalCost()), true);
    
    document.add(table);
}
```

---

## 🎯 Formules de Calcul

### **Fret Maritime**
```
Fret = (Distance_NM × Tarif_Base_Par_NM × Facteur_Conteneur) + Surcharges

Où:
- Tarif_Base_Par_NM = Company.baseRate / 10000 (exemple)
- Facteur_Conteneur = 1.0 (20'), 1.8 (40'), 2.0 (40'HC)
- Surcharges = Bunker + Canal + Sécurité
```

### **Frais Portuaires**
```
Frais_Port = THC + Port_Dues + Documentation + Handling

Utiliser les données UNCTAD déjà présentes dans realPortsDatabase.js
```

### **Assurance Transport**
```
Assurance = (Valeur_FOB + Fret) × Taux_Assurance

Où:
- Taux_Assurance = 0.3% à 0.5% selon Incoterm
```

---

## 📝 Endpoints API à Créer

### **Backend REST Endpoints**

```
GET  /api/maritime/ships/available?originPortId={id}&destPortId={id}
     → Liste navires disponibles

GET  /api/maritime/routes/{originPortId}/{destPortId}
     → Détails route maritime

POST /api/maritime/calculate-cost
     Body: { shipId, originPortId, destPortId, containerType, incoterm }
     → Calcul coût transport maritime complet

GET  /api/maritime/companies
     → Liste compagnies maritimes

GET  /api/maritime/ships/{id}
     → Détails navire
```

---

## ✅ Checklist Implémentation

### Backend
- [ ] Créer entité Ship
- [ ] Créer entité ShippingCompany
- [ ] Créer entité MaritimeRoute
- [ ] Créer repositories
- [ ] Créer migration SQL
- [ ] Créer SeaRoutesApiService (intégration API)
- [ ] Créer MaritimeTransportService
- [ ] Créer ShipService
- [ ] Créer MaritimeTransportController
- [ ] Étendre LandedCostCalculationDto
- [ ] Étendre LandedCostResultDto
- [ ] Étendre CalculationService (calcul maritime)
- [ ] Étendre PdfGenerationService (section maritime)

### Frontend
- [ ] Créer maritimeTransportService.js
- [ ] Créer seaRoutesApi.js
- [ ] Créer ShipSelector.jsx
- [ ] Créer MaritimeTransportDetails.jsx
- [ ] Créer ShippingCostBreakdown.jsx
- [ ] Étendre Calculator.jsx (section maritime)
- [ ] Étendre CostDashboard.jsx (affichage coûts)

### APIs & Data
- [ ] Intégrer SeaRates API ou équivalent
- [ ] Intégrer Vessel Finder API ou fallback
- [ ] Tester ExchangeRateService existant
- [ ] Seed database avec compagnies maritimes de base
- [ ] Seed database avec navires de base

### Tests
- [ ] Tester calcul coût maritime
- [ ] Tester sélection navire
- [ ] Tester génération PDF avec transport
- [ ] Tester conversion devises
- [ ] Tester avec différents Incoterms

---

## 🚫 Ce Qui NE SERA PAS Modifié

✅ **Architecture existante** - Aucun refactor  
✅ **Endpoints actuels** - Aucune modification (sauf extension minimale)  
✅ **Composants existants** - Aucune modification de structure  
✅ **Base de données existante** - Seulement ajout de tables  
✅ **Services existants** - Seulement extension propre  
✅ **Fonctionnalités actuelles** - 100% préservées  

---

## 📊 Estimation Temps

- **Backend**: 6-8 heures
- **Frontend**: 4-6 heures
- **Intégration APIs**: 3-4 heures
- **Tests**: 2-3 heures
- **Total**: ~15-20 heures

---

**Status**: Plan validé - Prêt pour implémentation  
**Prochaine étape**: Créer entités backend et intégrer APIs
