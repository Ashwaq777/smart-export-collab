# Smart Export Global Platform - Frontend

## 🚀 Démarrage rapide

### Installation
```bash
npm install
```

### Développement
```bash
npm run dev
```
L'application sera accessible sur `http://localhost:3000`

### Build production
```bash
npm run build
```

## 📁 Structure du projet

```
frontend/
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── ProductsManager.jsx    # Gestion des produits
│   │   │   ├── PortsManager.jsx       # Gestion des ports
│   │   │   └── TariffsManager.jsx     # Vue des tarifs
│   │   └── CostDashboard.jsx          # Dashboard des résultats
│   ├── pages/
│   │   ├── Calculator.jsx             # Page calculateur
│   │   └── Admin.jsx                  # Page administration
│   ├── services/
│   │   └── api.js                     # Services API
│   ├── App.jsx                        # Composant principal
│   ├── main.jsx                       # Point d'entrée
│   └── index.css                      # Styles globaux
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🎨 Technologies

- **React 18.2** - Framework UI
- **Vite** - Build tool rapide
- **TailwindCSS 3.3** - Framework CSS utility-first
- **React Router 6** - Routing
- **Axios** - Client HTTP
- **Lucide React** - Icônes modernes

## 📱 Pages et fonctionnalités

### Page Calculateur (`/`)

**Formulaire dynamique:**
- Sélection catégorie (charge les produits)
- Sélection produit (filtrés par catégorie)
- Saisie valeurs CIF (FOB, Transport, Assurance)
- Sélection pays (charge les ports)
- Sélection port optionnel (filtrés par pays)
- Choix devise (EUR, USD, MAD)

**Dashboard de résultats:**
- Cartes statistiques (Douane, TVA, Parafiscale, Frais portuaires)
- Grand Total mis en évidence
- Détail ligne par ligne
- Conversions de devises
- Bouton téléchargement PDF

### Page Administration (`/admin`)

**Onglet Produits:**
- Liste avec recherche
- CRUD complet (Create, Read, Update, Delete)
- Gestion taux douane, TVA, parafiscale

**Onglet Ports:**
- Liste avec recherche
- CRUD complet
- Types: Maritime/Aérien
- Gestion frais portuaires

**Onglet Tarifs:**
- Vue consolidée
- Filtrage par pays
- Recherche multi-critères

## 🎯 Composants principaux

### CostDashboard
Affiche les résultats du calcul avec:
- Informations produit
- Cartes statistiques
- Détail des coûts
- Conversions de devises
- Disclaimer

### ProductsManager
Gestion complète des produits:
- Table avec tri et recherche
- Modal de création/édition
- Validation des formulaires
- Suppression avec confirmation

### PortsManager
Gestion des ports:
- Filtrage par recherche
- Modal CRUD
- Badges de type (Maritime/Aérien)
- Affichage des frais

### TariffsManager
Vue en lecture seule des tarifs:
- Filtrage par pays
- Recherche multi-critères
- Vue tabulaire complète

## 🔌 Services API

Le fichier `services/api.js` expose:

```javascript
// Tarifs
tarifService.getAll()
tarifService.getCategories()
tarifService.getCountries()
tarifService.getProductsByCategory(category)
tarifService.create(data)
tarifService.update(id, data)
tarifService.delete(id)

// Ports
portService.getAll(params)
portService.getByCountry(country)
portService.create(data)
portService.update(id, data)
portService.delete(id)

// Calculs
calculationService.calculateLandedCost(data)

// PDF
pdfService.generateLandedCostPdf(data)

// Forex
forexService.getRates(base)
forexService.convert(amount, from, to)
```

## 🎨 Design System

### Couleurs principales
- **Primary:** Bleu (#3b82f6 - #1e3a8a)
- **Success:** Vert
- **Warning:** Jaune
- **Danger:** Rouge

### Composants réutilisables
- Boutons avec états (hover, disabled)
- Inputs avec validation
- Modals centrées
- Tables responsives
- Cartes statistiques
- Badges de statut

## 📱 Responsive Design

L'application est **mobile-first** et s'adapte à tous les écrans:
- **Mobile:** < 640px (1 colonne)
- **Tablet:** 640px - 1024px (layout adaptatif)
- **Desktop:** > 1024px (2 colonnes)

## 🔧 Configuration

### Proxy API (vite.config.js)
```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```

### TailwindCSS (tailwind.config.js)
Configuration des couleurs, breakpoints et plugins.

## 🚀 Déploiement

### Build
```bash
npm run build
```

Les fichiers optimisés seront dans `dist/`

### Preview
```bash
npm run preview
```

### Servir les fichiers statiques
Copiez le contenu de `dist/` dans:
- `src/main/resources/static` (Spring Boot)
- Ou servez avec Nginx/Apache

## 🧪 Bonnes pratiques

1. **Composants fonctionnels** avec hooks
2. **Gestion d'état locale** avec useState
3. **Effets de bord** avec useEffect
4. **Validation** côté client et serveur
5. **Messages d'erreur** clairs
6. **Loading states** pour UX fluide
7. **Confirmations** pour actions destructives

## 📝 Notes de développement

- Les warnings CSS `@tailwind` sont normaux (directives PostCSS)
- Le proxy Vite redirige `/api` vers le backend
- Les modals utilisent des portails React
- Les formulaires sont validés avec HTML5 + backend

## 🐛 Debugging

### Console navigateur
Ouvrez les DevTools (F12) pour voir:
- Erreurs JavaScript
- Requêtes réseau
- État des composants (React DevTools)

### Erreurs courantes

**CORS errors:**
- Vérifiez `@CrossOrigin` sur les controllers backend
- Vérifiez le proxy Vite

**404 sur /api:**
- Backend non lancé
- Port incorrect dans vite.config.js

**Composants ne se mettent pas à jour:**
- Vérifiez les dépendances useEffect
- Vérifiez l'immutabilité du state

## 📚 Ressources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [TailwindCSS Docs](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [Lucide Icons](https://lucide.dev)

---

**Version:** 1.0.0  
**Dernière mise à jour:** Février 2026
