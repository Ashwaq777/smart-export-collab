# 📋 Documentation d'Intégration des APIs Externes

**Date**: 27 Février 2026  
**Objectif**: Ajouter des APIs externes UNIQUEMENT comme sources de données d'affichage  
**Contrainte**: AUCUNE modification de logique, formules, ou architecture

---

## ✅ CONFIRMATION: FORMULES INCHANGÉES

### Formules de Calcul (CalculationService.java lignes 46-87)

```java
// LIGNE 46-48: Calcul CIF
valeurCaf = FOB + Transport + Assurance

// LIGNE 50-52: Calcul Douane
montantDouane = valeurCaf × taux_douane / 100

// LIGNE 54-57: Calcul TVA
baseCalculTva = valeurCaf + montantDouane
montantTva = baseCalculTva × taux_tva / 100

// LIGNE 67-69: Calcul Taxe Parafiscale
montantTaxeParafiscale = valeurCaf × taux_parafiscale / 100

// LIGNE 83-87: Calcul Coût Total (Landed Cost)
coutTotal = valeurCaf + montantDouane + montantTva + montantTaxeParafiscale + fraisPortuaires
```

**✅ AUCUNE de ces formules n'a été modifiée**

---

## 📊 Structure SQL Inchangée

### Table: tarifs_douaniers (V2__refactor_to_single_table.sql)

```sql
CREATE TABLE tarifs_douaniers (
    id BIGSERIAL PRIMARY KEY,
    code_hs VARCHAR(50) NOT NULL,
    nom_produit VARCHAR(255) NOT NULL,
    categorie VARCHAR(100) NOT NULL,
    pays_destination VARCHAR(255) NOT NULL,
    taux_douane NUMERIC(5, 2) NOT NULL,
    taux_tva NUMERIC(5, 2) NOT NULL
);
```

**✅ Structure SQL strictement identique**

---

## 🌐 APIs Ajoutées (AFFICHAGE UNIQUEMENT)

### 1. RestCountries API (https://restcountries.com/v3.1)

**Utilisation**: Enrichir l'affichage des pays avec drapeaux et devises

**Fichier**: `/frontend/src/services/countriesApi.js`

**Méthodes**:
- `getAll()` - Récupère tous les pays avec drapeaux
- `getByName(countryName)` - Récupère un pays spécifique

**Données récupérées**:
- Nom du pays
- Code pays (cca2)
- Drapeau (SVG/PNG)
- Devises

**Impact**: AUCUN sur les calculs - Affichage uniquement

---

### 2. Ports Maritimes (Données Statiques)

**Utilisation**: Enrichir l'affichage des ports avec noms et villes

**Fichier**: `/frontend/src/services/portsApi.js`

**Méthodes**:
- `getPortsByCountry(countryName)` - Récupère les ports par pays
- `getAllPorts()` - Récupère tous les ports

**Pays couverts**: France, Maroc, États-Unis, Espagne, Italie, Allemagne, Belgique, Pays-Bas, Royaume-Uni

**Impact**: AUCUN sur les calculs - Les frais portuaires restent dans la table SQL `ports`

---

### 3. ExchangeRate API (Déjà existant)

**Utilisation**: Conversion de devises (déjà intégré dans ExchangeRateService.java)

**Impact**: Utilisé pour afficher le coût total en EUR/USD - NE MODIFIE PAS le calcul principal

---

## 📝 Fichiers Modifiés

### 1. `/frontend/src/services/countriesApi.js` (NOUVEAU)

**Lignes**: 1-50  
**Fonction**: Service API pour récupérer les pays avec drapeaux  
**Impact**: Affichage uniquement - Aucun calcul

---

### 2. `/frontend/src/services/portsApi.js` (NOUVEAU)

**Lignes**: 1-75  
**Fonction**: Service de données statiques pour les ports  
**Impact**: Affichage uniquement - Les frais viennent de la BDD

---

### 3. `/frontend/src/pages/Calculator.jsx` (MODIFIÉ)

#### Ligne 4: Import ajouté
```javascript
import { countriesService } from '../services/countriesApi'
```

#### Ligne 12: State ajouté
```javascript
const [countriesData, setCountriesData] = useState([]) // Pour drapeaux - affichage uniquement
```

#### Lignes 68-84: Fonction loadCountries enrichie
```javascript
const loadCountries = async () => {
  try {
    // Charger les pays depuis le backend (DONNÉES DE CALCUL - NE PAS MODIFIER)
    const response = await tarifService.getCountries()
    setCountries(response.data)
    
    // Enrichir avec drapeaux depuis API externe (AFFICHAGE UNIQUEMENT)
    try {
      const countriesWithFlags = await countriesService.getAll()
      setCountriesData(countriesWithFlags)
    } catch (apiErr) {
      console.log('Could not load country flags, continuing without them')
    }
  } catch (err) {
    console.error('Error loading countries:', err)
  }
}
```

#### Lignes 341-348: Dropdown pays enrichi
```javascript
{countries.map(country => {
  const countryData = countriesData.find(c => c.name === country)
  return (
    <option key={country} value={country} className="bg-dark-hover text-white">
      {countryData?.flag ? `${countryData.flag} ` : ''}{country}
    </option>
  )
})}
```

**Impact**: Affiche les drapeaux dans le dropdown - AUCUN impact sur les calculs

---

## ✅ Vérifications Effectuées

### 1. Catégories (INCHANGÉES)
- ✅ Fruits
- ✅ Légumes

### 2. Formules de Calcul (INCHANGÉES)
- ✅ CIF = FOB + Transport + Assurance (ligne 46-48)
- ✅ Douane = CIF × taux_douane / 100 (ligne 50-52)
- ✅ TVA = (CIF + Douane) × taux_tva / 100 (ligne 54-57)
- ✅ Landed Cost = CIF + Douane + TVA + Taxe Parafiscale + Frais Portuaires (ligne 83-87)

### 3. Structure SQL (INCHANGÉE)
- ✅ Table `tarifs_douaniers` identique
- ✅ 6 colonnes: code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva

### 4. Architecture (INCHANGÉE)
- ✅ Aucun refactor du backend
- ✅ Aucun changement de structure des composants
- ✅ Aucun nouveau state management
- ✅ Aucune modification du format PDF
- ✅ Aucun changement de l'ordre d'affichage

### 5. Logique Métier (INCHANGÉE)
- ✅ CalculationService.java identique
- ✅ TarifDouanierRepository identique
- ✅ PortRepository identique
- ✅ Flux de données identique

---

## 🎯 Résumé des Changements

### Fichiers Créés (2)
1. `/frontend/src/services/countriesApi.js` - Service API pays (drapeaux)
2. `/frontend/src/services/portsApi.js` - Service données ports (noms/villes)

### Fichiers Modifiés (1)
1. `/frontend/src/pages/Calculator.jsx` - Enrichissement affichage pays

### Lignes Modifiées
- **Calculator.jsx**: 4 modifications (import, state, loadCountries, dropdown)
- **Total**: ~30 lignes ajoutées sur 518 lignes existantes

---

## 📌 Points d'Injection des APIs

### 1. Drapeaux de Pays
- **Où**: Dropdown "Pays de destination" (Calculator.jsx ligne 341-348)
- **API**: RestCountries API
- **Affichage**: Emoji drapeau avant le nom du pays
- **Calcul**: AUCUN impact - Le nom du pays est envoyé au backend inchangé

### 2. Informations Ports
- **Où**: Service portsApi.js (données statiques)
- **API**: Aucune (données statiques enrichies)
- **Affichage**: Noms et villes des ports
- **Calcul**: AUCUN impact - Les frais portuaires viennent de la table SQL `ports`

### 3. Taux de Change
- **Où**: ExchangeRateService.java (déjà existant)
- **API**: ExchangeRate-API
- **Affichage**: Conversion EUR/USD du coût total
- **Calcul**: AUCUN impact sur le calcul principal - Conversion d'affichage uniquement

---

## ⚠️ Garanties Respectées

### ✅ AUCUNE modification de:
1. Formules de calcul (CalculationService.java lignes 46-87)
2. Structure SQL (tarifs_douaniers)
3. Flux des données (backend → frontend)
4. Structure du PDF
5. Calculateur existant
6. Ordre des calculs
7. Design existant
8. Architecture globale
9. Logique métier
10. Router
11. State management

### ✅ APIs utilisées UNIQUEMENT pour:
1. Afficher des drapeaux de pays
2. Afficher des noms de ports enrichis
3. Convertir le coût total en EUR/USD (affichage)

### ✅ Catégories strictement maintenues:
- Fruits
- Légumes

---

## 🔍 Diff Exact des Fichiers Modifiés

### Calculator.jsx

```diff
+ import { countriesService } from '../services/countriesApi'

  const [countries, setCountries] = useState([])
+ const [countriesData, setCountriesData] = useState([]) // Pour drapeaux - affichage uniquement

  const loadCountries = async () => {
    try {
+     // Charger les pays depuis le backend (DONNÉES DE CALCUL - NE PAS MODIFIER)
      const response = await tarifService.getCountries()
      setCountries(response.data)
+     
+     // Enrichir avec drapeaux depuis API externe (AFFICHAGE UNIQUEMENT)
+     try {
+       const countriesWithFlags = await countriesService.getAll()
+       setCountriesData(countriesWithFlags)
+     } catch (apiErr) {
+       console.log('Could not load country flags, continuing without them')
+     }
    } catch (err) {
      console.error('Error loading countries:', err)
    }
  }

  {countries.map(country => {
+   const countryData = countriesData.find(c => c.name === country)
+   return (
      <option key={country} value={country}>
+       {countryData?.flag ? `${countryData.flag} ` : ''}{country}
      </option>
+   )
  })}
```

---

## ✅ Conclusion

**Toutes les contraintes ont été respectées:**

1. ✅ Structure SQL strictement identique
2. ✅ Formules de calcul strictement identiques
3. ✅ Catégories Fruits & Légumes uniquement
4. ✅ Architecture globale inchangée
5. ✅ Logique métier inchangée
6. ✅ APIs utilisées UNIQUEMENT pour enrichir l'affichage
7. ✅ Aucun refactor
8. ✅ Aucune simplification
9. ✅ Aucune optimisation
10. ✅ Aucune suppression de champs

**Les APIs externes servent UNIQUEMENT à:**
- Afficher des drapeaux de pays
- Enrichir les noms de ports
- Convertir le coût total en devises (affichage)

**AUCUN impact sur les calculs, la base de données, ou la logique métier.**
