# 🧪 Tests des Calculs - Smart Export Platform

**Date**: 28 Février 2026  
**Application**: http://localhost:3001/

---

## 📋 Tests à Effectuer

### Test 1: Calcul de Base (Sans Port)
**Objectif**: Vérifier que les formules de base fonctionnent correctement

**Données de test**:
- Catégorie: Fruits et Légumes
- Produit: Tomates (Code HS: 0702)
- Pays: France
- Valeur FOB: 10000 MAD
- Coût Transport: 2000 MAD
- Assurance: 500 MAD
- Devise: MAD

**Formules attendues**:
```
CIF = FOB + Transport + Assurance
CIF = 10000 + 2000 + 500 = 12500 MAD

Douane = CIF × (Taux Douane / 100)
Si taux = 10% → Douane = 12500 × 0.10 = 1250 MAD

TVA = (CIF + Douane) × (Taux TVA / 100)
Si taux = 20% → TVA = (12500 + 1250) × 0.20 = 2750 MAD

Total = CIF + Douane + TVA + Frais Portuaires
Total = 12500 + 1250 + 2750 + Frais = 16500 + Frais
```

---

### Test 2: Calcul avec Port UNCTAD (France)
**Objectif**: Vérifier l'intégration des frais portuaires UNCTAD

**Données de test**:
- Catégorie: Fruits et Légumes
- Produit: Tomates (Code HS: 0702)
- Pays: France
- Port: Port du Havre
- Valeur FOB: 10000 MAD
- Coût Transport: 2000 MAD
- Assurance: 500 MAD
- Devise: MAD

**Frais portuaires attendus (Port du Havre - UNCTAD)**:
```
THC: $285 per TEU
Port Dues: $0.18 per GRT
Pilotage: $520
Mooring: $380
Documentation: $95

Pour 1 TEU, 10000 GRT:
Total = 285 + (0.18 × 10000) + 520 + 380 + 95
Total = 285 + 1800 + 520 + 380 + 95 = $3080

Conversion USD → MAD (taux ~10):
Frais portuaires ≈ 30800 MAD
```

**Calcul total attendu**:
```
CIF = 12500 MAD
Douane = 1250 MAD
TVA = 2750 MAD
Frais Portuaires = ~30800 MAD
Total ≈ 47300 MAD
```

---

### Test 3: Calcul avec Différentes Devises
**Objectif**: Vérifier la conversion de devises

**Test 3a: USD**
- Valeur FOB: 1000 USD
- Transport: 200 USD
- Assurance: 50 USD
- Devise: USD
- CIF attendu: 1250 USD

**Test 3b: EUR**
- Valeur FOB: 1000 EUR
- Transport: 200 EUR
- Assurance: 50 EUR
- Devise: EUR
- CIF attendu: 1250 EUR

**Test 3c: Conversion automatique**
- Sélectionner pays "États-Unis"
- Vérifier que la devise passe automatiquement à USD
- Sélectionner pays "France"
- Vérifier que la devise passe automatiquement à EUR

---

### Test 4: Ports de Différents Pays
**Objectif**: Vérifier que les frais portuaires varient selon le port UNCTAD

**Ports à tester**:

1. **Port of Shanghai (Chine)** - THC: $115
   - Frais attendus (1 TEU, 10000 GRT): $115 + $1200 + $350 + $250 + $60 = $1975

2. **Port of Rotterdam (Pays-Bas)** - THC: $310
   - Frais attendus (1 TEU, 10000 GRT): $310 + $2000 + $580 + $420 + $105 = $3415

3. **Port of Casablanca (Maroc)** - THC: $210
   - Frais attendus (1 TEU, 10000 GRT): $210 + $1800 + $420 + $310 + $75 = $2815

4. **Port of Mumbai (Inde)** - THC: $165
   - Frais attendus (1 TEU, 10000 GRT): $165 + $1400 + $380 + $280 + $68 = $2293

---

### Test 5: Vérification Console
**Objectif**: Vérifier les logs de calcul dans la console

**Étapes**:
1. Ouvrir la console (F12)
2. Remplir le formulaire de calcul
3. Soumettre
4. Vérifier les logs:
   ```
   🧮 CALCULATION START
   Input values: { FOB: ..., Transport: ..., Assurance: ..., Currency: ... }
   ✅ CALCULATION RESULT:
   CIF = ... (should be FOB + Transport + Assurance)
   Douane = ... (should be CIF × taux_douane / 100)
   TVA = ... (should be (CIF + Douane) × taux_tva / 100)
   Total = ... (should be CIF + Douane + TVA + Frais)
   ```

---

### Test 6: Vérification des 100+ Pays
**Objectif**: Vérifier que tous les pays maritimes sont disponibles

**Pays à vérifier dans la dropdown**:
- ✅ États-Unis (avec 7 ports)
- ✅ Chine (avec 6 ports)
- ✅ Japon (avec 4 ports)
- ✅ Inde (avec 6 ports)
- ✅ Brésil (avec 3 ports)
- ✅ Afrique du Sud (avec 3 ports)
- ✅ Nigeria (avec 2 ports)
- ✅ Émirats arabes unis (avec 2 ports)
- ✅ Australie (avec 4 ports)
- ✅ Maroc (avec 3 ports)

**Total attendu**: 100+ pays maritimes

---

### Test 7: Vérification des ~170 Devises
**Objectif**: Vérifier que toutes les devises sont disponibles

**Devises à vérifier**:
- ✅ Majeures: USD, EUR, GBP, JPY, CNY, CHF, CAD, AUD
- ✅ Afrique: MAD, EGP, ZAR, NGN, KES, TZS, GHS
- ✅ Moyen-Orient: AED, SAR, OMR, QAR, KWD, BHD, ILS
- ✅ Asie: INR, PKR, BDT, LKR, THB, VND, IDR, MYR, PHP, KRW
- ✅ Europe: TRY, PLN, SEK, NOK, DKK, CZK, HUF, RON, BGN, RUB
- ✅ Amériques: MXN, BRL, ARS, CLP, COP, PEN, UYU

**Total attendu**: ~170 devises

---

## 🔍 Points de Vérification Critiques

### 1. Formule CIF
```javascript
CIF = FOB + Transport + Assurance
```
**Vérifier**: Le résultat CIF affiché correspond exactement à la somme

### 2. Frais Portuaires UNCTAD
```javascript
Total Fees = THC + (portDues × GRT) + pilotage + mooring + documentation
```
**Vérifier**: Les frais correspondent aux données UNCTAD du port sélectionné

### 3. Conversion de Devises
**Vérifier**: 
- La devise change automatiquement selon le pays
- Les calculs utilisent les bons taux de change
- L'affichage montre la devise correcte

### 4. Calcul Douane
```javascript
Douane = CIF × (Taux Douane / 100)
```
**Vérifier**: Le montant de douane est correct selon le taux du produit

### 5. Calcul TVA
```javascript
TVA = (CIF + Douane) × (Taux TVA / 100)
```
**Vérifier**: La TVA est calculée sur la base douanière (CIF + Douane)

### 6. Coût Total
```javascript
Total = CIF + Douane + TVA + Frais Portuaires + Autres Frais
```
**Vérifier**: Le total inclut tous les éléments

---

## 📊 Résultats Attendus

### ✅ Succès si:
1. CIF = FOB + Transport + Assurance (exact)
2. Les frais portuaires correspondent aux données UNCTAD
3. Les 100+ pays maritimes sont disponibles
4. Les ~170 devises sont disponibles
5. La conversion de devise fonctionne
6. Les calculs de douane et TVA sont corrects
7. Le total final est cohérent
8. Aucune erreur dans la console

### ❌ Échec si:
1. CIF ≠ FOB + Transport + Assurance
2. Les frais portuaires sont incorrects ou génériques
3. Moins de 100 pays disponibles
4. Moins de 170 devises disponibles
5. Erreurs de conversion de devises
6. Calculs de douane/TVA incorrects
7. Erreurs JavaScript dans la console

---

## 🧮 Exemple de Test Complet

**Scénario**: Export de tomates vers la France via Le Havre

**Input**:
```
Catégorie: Fruits et Légumes
Produit: Tomates (0702)
Pays: France
Port: Port du Havre
FOB: 50000 MAD
Transport: 8000 MAD
Assurance: 2000 MAD
Devise: MAD (auto-sélectionnée → EUR puis convertie)
```

**Calculs attendus**:
```
1. CIF = 50000 + 8000 + 2000 = 60000 MAD

2. Frais Portuaires (Le Havre):
   THC: $285
   Port Dues: $0.18 × 10000 = $1800
   Pilotage: $520
   Mooring: $380
   Documentation: $95
   Total: $3080
   En MAD (taux ~10): ~30800 MAD

3. Douane (taux tomates ~10%):
   60000 × 0.10 = 6000 MAD

4. TVA (taux ~20%):
   (60000 + 6000) × 0.20 = 13200 MAD

5. Total:
   60000 + 6000 + 13200 + 30800 = 110000 MAD
```

**Vérification**:
- [ ] CIF affiché = 60000 MAD
- [ ] Frais portuaires ≈ 30800 MAD
- [ ] Douane = 6000 MAD
- [ ] TVA = 13200 MAD
- [ ] Total ≈ 110000 MAD
- [ ] Aucune erreur console

---

## 📝 Instructions de Test

1. **Ouvrir l'application**: http://localhost:3001/
2. **Ouvrir la console**: F12 → Console
3. **Naviguer vers Calculator**
4. **Tester chaque scénario** ci-dessus
5. **Vérifier les résultats** dans l'interface et la console
6. **Cocher les cases** de vérification
7. **Noter les anomalies** s'il y en a

---

**Status**: Prêt pour les tests ✅
