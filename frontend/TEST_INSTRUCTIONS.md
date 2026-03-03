# 🧪 Instructions de Test - Vérification Changements

## ⚠️ IMPORTANT: Rafraîchissement Navigateur

Les changements ont été appliqués au code, mais ton navigateur a probablement **mis en cache l'ancienne version**.

---

## 🔄 Étape 1: Hard Refresh (OBLIGATOIRE)

### Sur Mac:
1. Ouvre `http://localhost:3000/`
2. Appuie sur **`Cmd + Shift + R`** (hard refresh)
3. OU appuie sur **`Cmd + Option + E`** puis **`Cmd + R`**

### Sur Windows/Linux:
1. Ouvre `http://localhost:3000/`
2. Appuie sur **`Ctrl + Shift + R`** (hard refresh)
3. OU appuie sur **`Ctrl + F5`**

### Alternative: Vider le Cache
1. Ouvre DevTools (F12)
2. Clic droit sur le bouton refresh
3. Sélectionne **"Empty Cache and Hard Reload"**

---

## 🔍 Étape 2: Vérifier Console (F12)

Ouvre la console navigateur et vérifie ces logs:

### Au chargement de la page:
```
✅ Loaded 250 countries with currencies
💱 Total unique currencies: 80
✅ Loaded 250 countries with currency data
✅ France (EUR) - 4 port(s)
✅ Allemagne (EUR) - 3 port(s)
✅ Maroc (MAD) - 3 port(s)
...
📊 Final: 100+ maritime countries with real ports
```

### Quand tu sélectionnes un pays (ex: France):
```
💱 Auto-selected currency: EUR for France
🚢 Loading ports for France...
✅ Loaded 4 ports for France
```

---

## ✅ Étape 3: Vérifier Changements Visibles

### A) Dropdown "Pays de destination"
Tu devrais voir:
```
France (EUR)
Allemagne (EUR)
Royaume-Uni (GBP)
Maroc (MAD)
Chine (CNY)
Japon (JPY)
Pakistan (PKR)
Bangladesh (BDT)
...
```

**Chaque pays doit avoir (CODE_DEVISE) après son nom**

### B) Sélectionne "France"
1. La devise devrait **automatiquement changer** vers **EUR**
2. Tu devrais voir **"Chargement des ports..."** pendant 1-2 secondes
3. Puis le dropdown ports devrait afficher:
```
Port du Havre - Le Havre (850 USD)
Port de Marseille-Fos - Marseille (820 USD)
Port de Dunkerque - Dunkerque (780 USD)
Port de Nantes-Saint-Nazaire - Nantes (750 USD)
```

### C) Sélectionne un port
Le port devrait être **sélectionnable** (pas grisé, pas bloqué)

### D) Change vers "Pakistan"
1. Les ports devraient se **réinitialiser**
2. La devise devrait changer vers **PKR**
3. Tu devrais voir **"Chargement des ports..."**
4. Puis 1 port: **Port of Karachi - Karachi (XXX USD)**

---

## ❌ Si Tu Ne Vois TOUJOURS Aucun Changement

### Vérifier que le serveur a bien redémarré:
```bash
# Dans le terminal, tu devrais voir:
VITE v5.4.21  ready in XXX ms
➜  Local:   http://localhost:3000/
```

### Vérifier qu'il n'y a pas d'erreurs JavaScript:
1. Ouvre DevTools (F12)
2. Onglet "Console"
3. Cherche des erreurs en rouge
4. Copie-colle les erreurs si tu en vois

### Vérifier le fichier source:
1. DevTools (F12) → Onglet "Sources"
2. Cherche `Calculator.jsx`
3. Cherche la ligne avec `portsLoading`
4. Si tu ne la trouves pas → le cache n'est pas vidé

---

## 🎯 Changements Spécifiques à Vérifier

### 1. Loading State Ports
Quand tu changes de pays, tu DOIS voir:
- Message "Chargement des ports..." sous le dropdown
- Dropdown ports grisé/désactivé
- Puis après 1-2 sec, les ports apparaissent

### 2. Frais Portuaires
Chaque port doit afficher ses frais:
```
Port du Havre - Le Havre (850 USD)
```
Pas juste:
```
Port du Havre - Le Havre
```

### 3. Auto-sélection Devise
Quand tu sélectionnes un pays, la devise dans le dropdown "Devise" doit **automatiquement changer** pour correspondre au pays.

---

## 📸 Si Problème Persiste

Envoie-moi:
1. Screenshot de la page Calculator
2. Screenshot de la console (F12)
3. Dis-moi exactement ce que tu vois vs ce que tu devrais voir
