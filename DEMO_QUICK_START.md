# 🚀 Démonstration APIs - Guide Rapide

## ⚡ Démarrage en 3 minutes

### 1. Lancer l'application
```bash
# Terminal 1 - Backend
cd /Users/user/CascadeProjects/smart-export-platform
mvn spring-boot:run

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 2. Lancer la démo automatique
```bash
./demo-api.sh
```

---

## 🎯 3 Options de démonstration

### Option 1 : Script automatique (Recommandé) ⭐
```bash
./demo-api.sh
```
- Démonstration guidée étape par étape
- Génère un PDF automatiquement
- Parfait pour présenter en direct

### Option 2 : Postman
1. Ouvrir Postman
2. Import → File → `Smart_Export_APIs.postman_collection.json`
3. Exécuter les requêtes dans l'ordre

### Option 3 : Frontend visuel
Ouvrir http://localhost:3000 dans le navigateur

---

## 📝 Exemples rapides (cURL)

### Récupérer les catégories
```bash
curl http://localhost:8080/api/tarifs-douaniers/categories
```

### Calculer un Landed Cost
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

### Générer un PDF
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

## 🎬 Scénario de démonstration (5 min)

### Minute 1-2 : Frontend
- Ouvrir http://localhost:3000
- Montrer le formulaire dynamique
- Sélectionner : Légumes → Tomates → France → Marseille
- Calculer et montrer le dashboard

### Minute 3-4 : APIs
- Exécuter `./demo-api.sh`
- Montrer les endpoints GET (catégories, pays, produits)
- Montrer le calcul POST
- Montrer la génération PDF

### Minute 5 : Admin
- Aller sur http://localhost:3000/admin
- Montrer la gestion des produits
- Montrer la gestion des ports

---

## 📊 Endpoints principaux

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/tarifs-douaniers/categories` | GET | Catégories |
| `/api/tarifs-douaniers/pays` | GET | Pays |
| `/api/tarifs-douaniers/categorie/{cat}` | GET | Produits |
| `/api/ports?pays={pays}` | GET | Ports |
| `/api/calculation/landed-cost` | POST | Calcul |
| `/api/pdf/landed-cost` | POST | PDF |

---

## 🎯 Points clés à mentionner

✅ **Architecture REST** moderne  
✅ **Multi-devises** (MAD, EUR, USD)  
✅ **Multi-pays** (France, Maroc, USA)  
✅ **Calculs automatiques** (Douane, TVA, Parafiscale)  
✅ **Frais portuaires** intégrés  
✅ **Génération PDF** professionnelle  
✅ **Interface admin** complète  

---

## 📁 Fichiers de démonstration

- `demo-api.sh` - Script de démonstration automatique
- `Smart_Export_APIs.postman_collection.json` - Collection Postman
- `API_DEMO_GUIDE.md` - Guide détaillé complet
- `DEPLOYMENT_GUIDE.md` - Guide de déploiement
- `ARCHITECTURE.md` - Documentation technique

---

## 🐛 Dépannage rapide

**Backend ne répond pas ?**
```bash
curl http://localhost:8080/api/tarifs-douaniers/categories
# Si erreur → Redémarrer : mvn spring-boot:run
```

**Frontend ne charge pas ?**
```bash
cd frontend && npm run dev
```

**Données manquantes ?**
```bash
# Vérifier la base de données
psql -d smart_export_db -c "SELECT COUNT(*) FROM tarifs_douaniers;"
```

---

## 💡 Astuces pour la présentation

1. **Préparez les terminaux à l'avance** (backend + frontend lancés)
2. **Testez une fois avant** la réunion
3. **Ayez le PDF déjà généré** comme backup
4. **Montrez d'abord le frontend** (visuel), puis les APIs (technique)
5. **Utilisez des exemples concrets** (Tomates du Maroc → France)

---

**Bonne démonstration ! 🚀**

Pour plus de détails : `API_DEMO_GUIDE.md`
