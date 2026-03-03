# Plan de Correction Module Transport Maritime

## Objectif Global
Corriger complètement le module de transport maritime avec APIs gratuites réelles uniquement.

---

## APIs Gratuites Identifiées

### 1. **Navires par Port (AIS)**
**API**: VesselFinder API (Free tier disponible)
- URL: https://www.vesselfinder.com/vessel-positions-api
- Alternative: AISHub (gratuit)
- Données: Navires en temps réel, MMSI, type, position

### 2. **Distance Maritime**
**API**: Datalastic Sea Routes API
- URL: https://api.datalastic.com/api/sandbox/route
- Paramètres: UN/LOCODE origine et destination
- Output: Distance en milles nautiques
- Free tier: Disponible avec inscription

### 3. **Devises par Pays**
**API**: REST Countries API (déjà utilisé)
- URL: https://restcountries.com/v3.1/all
- Données: Code devise, nom, symbole
- 100% gratuit

### 4. **Conversion Devise**
**API**: Open Exchange Rates API (Free)
- URL: https://open.er-api.com/v6/latest/USD
- Free tier: 1500 requests/mois
- Alternative déjà intégrée: ExchangeRate-API.com

---

## Problèmes Actuels Identifiés

1. ❌ **Navires codés en dur** dans migration SQL
2. ❌ **Pas d'API AIS** pour navires réels
3. ❌ **Distance calculée** (Haversine) au lieu d'API
4. ❌ **Ports vides** pour certains pays
5. ❌ **Pas de poids** dans calcul shipping
6. ❌ **Conversion devise** non dynamique pour maritime
7. ❌ **Ports génériques** possibles

---

## Plan d'Implémentation

### Phase 1: Backend - APIs Externes
1. ✅ Supprimer navires/compagnies de la BDD
2. ✅ Créer VesselFinderApiService (AIS gratuit)
3. ✅ Créer DatalasticSeaRoutesService (distance)
4. ✅ Modifier MaritimeTransportService:
   - Appeler API AIS pour navires
   - Appeler API Datalastic pour distance
   - Ajouter paramètre poids
   - Calcul dynamique: (distance × poids × tarif) + frais_fixes
5. ✅ Modifier MaritimeTransportController:
   - GET /vessels/port/{portId} → navires réels
   - GET /distance/{originId}/{destId} → distance API

### Phase 2: Frontend - Devises & Ports
1. ✅ Modifier countriesApi.js:
   - Charger REST Countries API
   - Extraire devise (code, nom, symbole)
   - Format: "France (EUR)", "USA (USD)"
2. ✅ Modifier worldPortsApi.js:
   - Filtrer pays sans ports
   - Supprimer ports génériques
   - Validation stricte
3. ✅ Créer vesselService.js:
   - Appeler backend pour navires par port
4. ✅ Modifier maritimeTransportService.js:
   - Appeler API distance
   - Ajouter poids dans calcul

### Phase 3: UI - Affichage & Calcul
1. ✅ Modifier Calculator.jsx:
   - Afficher pays avec devise
   - Input poids (tonnes)
   - Charger navires dynamiquement
2. ✅ Modifier ShipSelector.jsx:
   - Afficher navires réels de l'API
   - Nom, type, MMSI, date arrivée
   - Message si aucun navire
3. ✅ Modifier MaritimeTransportDetails.jsx:
   - Afficher distance API
   - Afficher calcul avec poids
   - Conversion devise temps réel

### Phase 4: Validation
1. ✅ Compter pays affichés
2. ✅ Compter devises uniques
3. ✅ Compter ports chargés
4. ✅ Confirmer 0 port générique
5. ✅ Confirmer calcul shipping correct
6. ✅ Lister APIs utilisées
7. ✅ Lister fichiers modifiés

---

## Règles Strictes Respectées

- ✅ Ne pas modifier architecture existante
- ✅ Ne pas modifier logique douanière
- ✅ Ne pas modifier formules CIF/Douane/TVA
- ✅ Ne pas refactoriser
- ✅ Utiliser uniquement APIs externes gratuites
- ✅ Aucun navire codé en dur
- ✅ Aucun port générique

---

## APIs Finales Utilisées

1. **VesselFinder API** (ou AISHub) - Navires temps réel
2. **Datalastic Sea Routes API** - Distance maritime
3. **REST Countries API** - Devises par pays
4. **Open.er-api.com** - Conversion devise temps réel
5. **World Port Index** (existant) - Ports réels

---

## Fichiers à Modifier

### Backend
- ❌ SUPPRIMER: V12__create_maritime_transport_tables.sql (navires hardcodés)
- ✅ CRÉER: VesselFinderApiService.java
- ✅ CRÉER: DatalasticSeaRoutesService.java
- ✅ MODIFIER: MaritimeTransportService.java
- ✅ MODIFIER: MaritimeTransportController.java
- ✅ MODIFIER: MaritimeTransportCostDto.java (ajouter poids)

### Frontend
- ✅ MODIFIER: countriesApi.js (REST Countries avec devises)
- ✅ MODIFIER: worldPortsApi.js (filtrer ports vides)
- ✅ CRÉER: vesselService.js
- ✅ MODIFIER: maritimeTransportService.js
- ✅ MODIFIER: Calculator.jsx (input poids, devises)
- ✅ MODIFIER: ShipSelector.jsx (navires API)
- ✅ MODIFIER: MaritimeTransportDetails.jsx (distance, poids)

---

## Validation Finale

### Métriques Attendues
- Pays affichés: ~100 (avec devises)
- Devises uniques: ~50-60
- Ports chargés: ~200+
- Ports génériques: **0**
- Navires hardcodés: **0**
- APIs externes: **4-5**

### Tests
1. Sélectionner pays → voir devise
2. Sélectionner port → voir navires réels
3. Entrer poids → calcul dynamique
4. Voir distance API (pas calculée)
5. Conversion devise temps réel
6. PDF avec données réelles

---

**Status**: Plan validé - Prêt pour implémentation
