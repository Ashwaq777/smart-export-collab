# 🚀 Quick Start Guide

## Démarrage en 5 minutes

### Prérequis
- Java 17+
- Maven 3.8+
- PostgreSQL 14+
- Node.js 18+

### 1. Base de données

```bash
# Créer la base de données
psql -U postgres
CREATE DATABASE smart_export_db;
CREATE USER smart_export_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE smart_export_db TO smart_export_user;
\q
```

### 2. Configuration

```bash
# Copier le fichier de configuration
cp src/main/resources/application.yml.example src/main/resources/application.yml

# Éditer application.yml et mettre à jour le mot de passe
```

### 3. Lancement automatique

```bash
# Rendre le script exécutable
chmod +x start.sh

# Lancer l'application (backend + frontend)
./start.sh
```

### 4. Accès

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080/api

### 5. Test rapide

1. Ouvrez http://localhost:3000
2. Sélectionnez une catégorie (ex: Légumes)
3. Sélectionnez un produit (ex: Tomates)
4. Remplissez les valeurs:
   - FOB: 1000
   - Transport: 100
   - Assurance: 50
5. Sélectionnez un pays (ex: France)
6. Sélectionnez un port (ex: Marseille)
7. Cliquez sur "Calculer le Landed Cost"
8. Téléchargez le PDF

## Lancement manuel

### Backend seul
```bash
mvn spring-boot:run
```

### Frontend seul
```bash
cd frontend
npm install
npm run dev
```

## Tests

```bash
# Tous les tests
mvn test

# Tests spécifiques
mvn test -Dtest=CalculationServiceTest
mvn test -Dtest=PortControllerTest
```

## Données de test

Les migrations Flyway insèrent automatiquement:
- 5 produits (Tomates, Oranges, Pommes de terre, Bananes, Carottes)
- 3 pays (France, Maroc, USA)
- 8 ports (4 Europe + 4 USA)
- Tarifs douaniers pour tous les produits × pays

## Troubleshooting

**Backend ne démarre pas:**
```bash
# Vérifier PostgreSQL
pg_isready

# Vérifier les logs
tail -f backend.log
```

**Frontend ne se connecte pas:**
```bash
# Vérifier que le backend est lancé
curl http://localhost:8080/api/ports

# Vérifier les logs
tail -f frontend.log
```

**Erreur de migration Flyway:**
```bash
# Réparer Flyway
mvn flyway:repair

# Ou recréer la base
dropdb smart_export_db
createdb smart_export_db
```

## Prochaines étapes

1. Explorez l'interface sur http://localhost:3000
2. Testez le calculateur avec différents produits/pays
3. Gérez les données via l'onglet Administration
4. Consultez la documentation complète dans DEPLOYMENT_GUIDE.md

---

**Besoin d'aide?** Consultez DEPLOYMENT_GUIDE.md pour plus de détails.
