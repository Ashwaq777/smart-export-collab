# 🎯 Guide de Démonstration des APIs - Smart Export Global Platform

## 📋 Table des matières
1. [Préparation](#préparation)
2. [Démonstration avec Postman](#démonstration-avec-postman)
3. [Démonstration avec cURL](#démonstration-avec-curl)
4. [Démonstration avec le navigateur](#démonstration-avec-le-navigateur)
5. [Scénarios de démonstration](#scénarios-de-démonstration)

---

## 🚀 Préparation

### Avant la réunion

1. **Démarrer l'application**
```bash
# Terminal 1 - Backend
cd /Users/user/CascadeProjects/smart-export-platform
mvn spring-boot:run

# Terminal 2 - Frontend
cd frontend
npm run dev
```

2. **Vérifier que tout fonctionne**
```bash
curl http://localhost:8080/api/tarifs-douaniers/categories
# Doit retourner: ["Fruits","Légumes"]
```

3. **URLs à noter**
- Backend API: `http://localhost:8080`
- Frontend: `http://localhost:3000`

---

## 📮 Démonstration avec Postman

### Installation Postman
Téléchargez depuis: https://www.postman.com/downloads/

### Collection Postman - Importez ce JSON

```json
{
  "info": {
    "name": "Smart Export Global Platform",
    "description": "Collection complète des APIs",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "1. Récupérer les catégories",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:8080/api/tarifs-douaniers/categories",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8080",
          "path": ["api", "tarifs-douaniers", "categories"]
        }
      }
    },
    {
      "name": "2. Récupérer les pays",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:8080/api/tarifs-douaniers/pays",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8080",
          "path": ["api", "tarifs-douaniers", "pays"]
        }
      }
    },
    {
      "name": "3. Produits par catégorie (Légumes)",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:8080/api/tarifs-douaniers/categorie/Légumes",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8080",
          "path": ["api", "tarifs-douaniers", "categorie", "Légumes"]
        }
      }
    },
    {
      "name": "4. Ports par pays (France)",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:8080/api/ports?pays=France",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8080",
          "path": ["api", "ports"],
          "query": [{"key": "pays", "value": "France"}]
        }
      }
    },
    {
      "name": "5. Calculer Landed Cost",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"codeHs\": \"070200\",\n  \"paysDestination\": \"France\",\n  \"valeurFob\": 10000,\n  \"coutTransport\": 500,\n  \"assurance\": 100,\n  \"currency\": \"MAD\",\n  \"portId\": 4\n}"
        },
        "url": {
          "raw": "http://localhost:8080/api/calculation/landed-cost",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8080",
          "path": ["api", "calculation", "landed-cost"]
        }
      }
    },
    {
      "name": "6. Générer PDF",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"codeHs\": \"070200\",\n  \"paysDestination\": \"France\",\n  \"valeurFob\": 10000,\n  \"coutTransport\": 500,\n  \"assurance\": 100,\n  \"currency\": \"EUR\",\n  \"portId\": 4\n}"
        },
        "url": {
          "raw": "http://localhost:8080/api/pdf/landed-cost",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8080",
          "path": ["api", "pdf", "landed-cost"]
        }
      }
    }
  ]
}
```

**Comment utiliser :**
1. Ouvrez Postman
2. Cliquez sur "Import" → "Raw text"
3. Collez le JSON ci-dessus
4. Cliquez sur "Import"
5. Exécutez les requêtes dans l'ordre

---

## 💻 Démonstration avec cURL

### 1️⃣ Récupérer les catégories
```bash
curl -X GET http://localhost:8080/api/tarifs-douaniers/categories
```
**Résultat attendu :**
```json
["Fruits","Légumes"]
```

### 2️⃣ Récupérer les pays
```bash
curl -X GET http://localhost:8080/api/tarifs-douaniers/pays
```
**Résultat attendu :**
```json
["France","Maroc","USA"]
```

### 3️⃣ Produits par catégorie
```bash
curl -X GET http://localhost:8080/api/tarifs-douaniers/categorie/Légumes
```
**Résultat attendu :**
```json
[
  {
    "id": 1,
    "codeHs": "070200",
    "nomProduit": "Tomates",
    "categorie": "Légumes",
    "paysDestination": "France",
    "tauxDouane": 10.40,
    "tauxTva": 20.00,
    "taxeParafiscale": 0.00
  },
  ...
]
```

### 4️⃣ Ports par pays
```bash
curl -X GET "http://localhost:8080/api/ports?pays=France"
```
**Résultat attendu :**
```json
[
  {
    "id": 4,
    "nomPort": "Marseille",
    "pays": "France",
    "typePort": "Maritime",
    "fraisPortuaires": 380.00
  }
]
```

### 5️⃣ Calculer le Landed Cost
```bash
curl -X POST http://localhost:8080/api/calculation/landed-cost \
  -H "Content-Type: application/json" \
  -d '{
    "codeHs": "070200",
    "paysDestination": "France",
    "valeurFob": 10000,
    "coutTransport": 500,
    "assurance": 100,
    "currency": "MAD",
    "portId": 4
  }'
```
**Résultat attendu :**
```json
{
  "codeHs": "070200",
  "nomProduit": "Tomates",
  "paysDestination": "France",
  "valeurFob": 10000,
  "coutTransport": 500,
  "assurance": 100,
  "valeurCaf": 10600,
  "tauxDouane": 10.40,
  "montantDouane": 1102.40,
  "tauxTva": 20.00,
  "montantTva": 2340.48,
  "taxeParafiscale": 0.00,
  "montantTaxeParafiscale": 0.00,
  "nomPort": "Marseille",
  "fraisPortuaires": 380.00,
  "coutTotal": 14422.88,
  "currency": "MAD",
  "coutTotalEur": 1326.90,
  "coutTotalUsd": 1442.29
}
```

### 6️⃣ Télécharger le PDF
```bash
curl -X POST http://localhost:8080/api/pdf/landed-cost \
  -H "Content-Type: application/json" \
  -d '{
    "codeHs": "070200",
    "paysDestination": "France",
    "valeurFob": 10000,
    "coutTransport": 500,
    "assurance": 100,
    "currency": "EUR",
    "portId": 4
  }' \
  --output landed_cost.pdf
```

---

## 🌐 Démonstration avec le navigateur

### Option 1 : Console du navigateur (F12)

Ouvrez http://localhost:3000, puis ouvrez la console (F12) et exécutez :

```javascript
// 1. Récupérer les catégories
fetch('/api/tarifs-douaniers/categories')
  .then(r => r.json())
  .then(console.log)

// 2. Calculer le Landed Cost
fetch('/api/calculation/landed-cost', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    codeHs: "070200",
    paysDestination: "France",
    valeurFob: 10000,
    coutTransport: 500,
    assurance: 100,
    currency: "EUR",
    portId: 4
  })
})
.then(r => r.json())
.then(console.log)
```

### Option 2 : URLs directes (GET seulement)

Ouvrez ces URLs dans le navigateur :

- **Catégories :** http://localhost:8080/api/tarifs-douaniers/categories
- **Pays :** http://localhost:8080/api/tarifs-douaniers/pays
- **Produits Légumes :** http://localhost:8080/api/tarifs-douaniers/categorie/Légumes
- **Ports France :** http://localhost:8080/api/ports?pays=France
- **Tous les ports :** http://localhost:8080/api/ports

---

## 🎬 Scénarios de démonstration

### Scénario 1 : Import de Tomates du Maroc vers la France

**Contexte :** Un exportateur marocain veut exporter 10,000 MAD de tomates vers la France via le port de Marseille.

**Étapes de démonstration :**

1. **Montrer les catégories disponibles**
```bash
curl http://localhost:8080/api/tarifs-douaniers/categories
# Résultat: ["Fruits","Légumes"]
```

2. **Montrer les produits de la catégorie Légumes**
```bash
curl http://localhost:8080/api/tarifs-douaniers/categorie/Légumes
# Résultat: Tomates, Pommes de terre, Carottes
```

3. **Montrer les ports français disponibles**
```bash
curl "http://localhost:8080/api/ports?pays=France"
# Résultat: Marseille (Maritime) - 380 EUR
```

4. **Calculer le Landed Cost complet**
```bash
curl -X POST http://localhost:8080/api/calculation/landed-cost \
  -H "Content-Type: application/json" \
  -d '{
    "codeHs": "070200",
    "paysDestination": "France",
    "valeurFob": 10000,
    "coutTransport": 500,
    "assurance": 100,
    "currency": "MAD",
    "portId": 4
  }'
```

**Points à souligner :**
- ✅ Calcul automatique de la valeur CAF (10,600 MAD)
- ✅ Application des droits de douane français (10.4%)
- ✅ Calcul de la TVA (20%)
- ✅ Ajout des frais portuaires de Marseille
- ✅ Conversion automatique en EUR et USD
- ✅ Total : 14,422.88 MAD (≈ 1,327 EUR)

---

### Scénario 2 : Export d'Oranges vers les USA

**Contexte :** Export de 5,000 USD d'oranges vers New York.

```bash
curl -X POST http://localhost:8080/api/calculation/landed-cost \
  -H "Content-Type: application/json" \
  -d '{
    "codeHs": "080510",
    "paysDestination": "USA",
    "valeurFob": 5000,
    "coutTransport": 800,
    "assurance": 50,
    "currency": "USD",
    "portId": 5
  }'
```

**Points à souligner :**
- ✅ TVA = 0% (pas de TVA aux USA)
- ✅ Droits de douane USA différents
- ✅ Frais portuaires de New York en USD
- ✅ Conversion automatique en EUR et MAD

---

### Scénario 3 : Génération de PDF pour le client

```bash
curl -X POST http://localhost:8080/api/pdf/landed-cost \
  -H "Content-Type: application/json" \
  -d '{
    "codeHs": "070200",
    "paysDestination": "France",
    "valeurFob": 10000,
    "coutTransport": 500,
    "assurance": 100,
    "currency": "EUR",
    "portId": 4
  }' \
  --output devis_tomates_france.pdf
```

**Montrer le PDF généré avec :**
- Logo Smart Export Global
- Détail complet des coûts
- Conversions de devises
- Disclaimer légal
- Date de génération

---

## 📊 Endpoints disponibles

### Tarifs Douaniers
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/tarifs-douaniers` | Tous les tarifs |
| GET | `/api/tarifs-douaniers/categories` | Liste des catégories |
| GET | `/api/tarifs-douaniers/pays` | Liste des pays |
| GET | `/api/tarifs-douaniers/categorie/{cat}` | Produits par catégorie |
| GET | `/api/tarifs-douaniers/{id}` | Tarif par ID |
| POST | `/api/tarifs-douaniers` | Créer un tarif |
| PUT | `/api/tarifs-douaniers/{id}` | Modifier un tarif |
| DELETE | `/api/tarifs-douaniers/{id}` | Supprimer un tarif |

### Ports
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/ports` | Tous les ports |
| GET | `/api/ports?pays={pays}` | Ports par pays |
| GET | `/api/ports/{id}` | Port par ID |
| POST | `/api/ports` | Créer un port |
| PUT | `/api/ports/{id}` | Modifier un port |
| DELETE | `/api/ports/{id}` | Supprimer un port |

### Calculs
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/calculation/landed-cost` | Calculer le Landed Cost |

### PDF
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/pdf/landed-cost` | Générer PDF du calcul |

---

## 🎯 Conseils pour la démonstration

### Avant la réunion
1. ✅ Testez tous les endpoints
2. ✅ Préparez des exemples concrets
3. ✅ Ayez le frontend ouvert en parallèle
4. ✅ Préparez des questions/réponses

### Pendant la réunion
1. 🎤 Commencez par le frontend (visuel)
2. 🔧 Montrez ensuite les APIs (technique)
3. 📊 Utilisez des exemples réels
4. 💡 Expliquez la logique métier
5. 📄 Terminez par la génération PDF

### Ordre recommandé
1. **Frontend** → Montrer l'interface utilisateur
2. **APIs GET** → Récupération de données
3. **API POST** → Calcul du Landed Cost
4. **PDF** → Génération du document
5. **Admin** → Gestion des données

---

## 🐛 Troubleshooting

### Le backend ne répond pas
```bash
# Vérifier que le backend tourne
curl http://localhost:8080/api/tarifs-douaniers/categories

# Si erreur, redémarrer
pkill -f spring-boot
mvn spring-boot:run
```

### Erreur CORS
- Vérifiez que `@CrossOrigin` est présent sur les controllers
- Utilisez le proxy Vite pour le frontend

### Données manquantes
```bash
# Vérifier la base de données
psql -d smart_export_db -c "SELECT COUNT(*) FROM tarifs_douaniers;"
psql -d smart_export_db -c "SELECT COUNT(*) FROM ports;"
```

---

## 📝 Notes pour la présentation

### Points forts à mentionner
- ✅ **Architecture REST** moderne et scalable
- ✅ **Validation automatique** des données
- ✅ **Conversions multi-devises** en temps réel
- ✅ **Génération PDF** professionnelle
- ✅ **Interface admin** complète
- ✅ **Tests unitaires** et d'intégration
- ✅ **Documentation** complète

### Chiffres clés
- **3 pays** supportés (France, Maroc, USA)
- **8 ports** pré-configurés (Europe + USA)
- **5 produits** de démonstration
- **3 devises** (EUR, USD, MAD)
- **15+ endpoints** REST
- **100% responsive** mobile-first

---

Bonne démonstration ! 🚀
