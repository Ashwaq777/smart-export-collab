#!/bin/bash

# Script de démonstration des APIs - Smart Export Global Platform
# Usage: ./demo-api.sh

# Couleurs pour la sortie
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URL de base
BASE_URL="http://localhost:8080"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Smart Export Global Platform - Démonstration des APIs       ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo ""

# Fonction pour afficher une étape
step() {
    echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}$1${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Fonction pour afficher une commande
show_command() {
    echo -e "${GREEN}$ $1${NC}"
}

# Fonction pour faire une pause
pause() {
    echo -e "\n${BLUE}Appuyez sur ENTRÉE pour continuer...${NC}"
    read
}

# Vérifier que le backend est accessible
echo -e "${BLUE}Vérification de la connexion au backend...${NC}"
if ! curl -s -f "$BASE_URL/api/tarifs-douaniers/categories" > /dev/null; then
    echo -e "${RED}❌ Erreur: Le backend n'est pas accessible sur $BASE_URL${NC}"
    echo -e "${RED}Veuillez démarrer le backend avec: mvn spring-boot:run${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Backend accessible${NC}"

pause

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 1 : Récupérer les catégories
# ═══════════════════════════════════════════════════════════════
step "ÉTAPE 1 : Récupérer les catégories de produits"
show_command "curl -X GET $BASE_URL/api/tarifs-douaniers/categories"
echo ""
curl -s -X GET "$BASE_URL/api/tarifs-douaniers/categories" | jq '.'
echo -e "\n${GREEN}✅ 2 catégories disponibles : Fruits et Légumes${NC}"

pause

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 2 : Récupérer les pays
# ═══════════════════════════════════════════════════════════════
step "ÉTAPE 2 : Récupérer les pays de destination"
show_command "curl -X GET $BASE_URL/api/tarifs-douaniers/pays"
echo ""
curl -s -X GET "$BASE_URL/api/tarifs-douaniers/pays" | jq '.'
echo -e "\n${GREEN}✅ 3 pays disponibles : France, Maroc, USA${NC}"

pause

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 3 : Récupérer les produits par catégorie
# ═══════════════════════════════════════════════════════════════
step "ÉTAPE 3 : Récupérer les produits de la catégorie 'Légumes'"
show_command "curl -X GET $BASE_URL/api/tarifs-douaniers/categorie/Légumes"
echo ""
curl -s -X GET "$BASE_URL/api/tarifs-douaniers/categorie/Légumes" | jq '.[0:3] | .[] | {nomProduit, codeHs, paysDestination, tauxDouane, tauxTva}'
echo -e "\n${GREEN}✅ Produits récupérés avec leurs taux douaniers par pays${NC}"

pause

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 4 : Récupérer les ports par pays
# ═══════════════════════════════════════════════════════════════
step "ÉTAPE 4 : Récupérer les ports français"
show_command "curl -X GET '$BASE_URL/api/ports?pays=France'"
echo ""
curl -s -X GET "$BASE_URL/api/ports?pays=France" | jq '.[] | {nomPort, pays, typePort, fraisPortuaires}'
echo -e "\n${GREEN}✅ Port de Marseille disponible avec frais portuaires${NC}"

pause

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 5 : Calculer le Landed Cost
# ═══════════════════════════════════════════════════════════════
step "ÉTAPE 5 : Calculer le Landed Cost - Tomates du Maroc vers France"
echo -e "${BLUE}Données du calcul :${NC}"
echo "  • Produit: Tomates (070200)"
echo "  • Destination: France"
echo "  • Valeur FOB: 10,000 MAD"
echo "  • Transport: 500 MAD"
echo "  • Assurance: 100 MAD"
echo "  • Port: Marseille"
echo ""

show_command "curl -X POST $BASE_URL/api/calculation/landed-cost -H 'Content-Type: application/json' -d '{...}'"
echo ""

CALC_RESULT=$(curl -s -X POST "$BASE_URL/api/calculation/landed-cost" \
  -H "Content-Type: application/json" \
  -d '{
    "codeHs": "070200",
    "paysDestination": "France",
    "valeurFob": 10000,
    "coutTransport": 500,
    "assurance": 100,
    "currency": "MAD",
    "portId": 4
  }')

echo "$CALC_RESULT" | jq '{
  produit: .nomProduit,
  destination: .paysDestination,
  "Valeur CAF": .valeurCaf,
  "Douane (10.4%)": .montantDouane,
  "TVA (20%)": .montantTva,
  "Frais portuaires": .fraisPortuaires,
  "TOTAL (MAD)": .coutTotal,
  "TOTAL (EUR)": .coutTotalEur,
  "TOTAL (USD)": .coutTotalUsd
}'

echo -e "\n${GREEN}✅ Calcul complet avec conversions automatiques${NC}"
echo -e "${GREEN}   Total: 14,422.88 MAD ≈ 1,327 EUR ≈ 1,442 USD${NC}"

pause

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 6 : Exemple avec les USA (pas de TVA)
# ═══════════════════════════════════════════════════════════════
step "ÉTAPE 6 : Calculer le Landed Cost - Oranges vers USA"
echo -e "${BLUE}Données du calcul :${NC}"
echo "  • Produit: Oranges (080510)"
echo "  • Destination: USA"
echo "  • Valeur FOB: 5,000 USD"
echo "  • Transport: 800 USD"
echo "  • Assurance: 50 USD"
echo "  • Port: New York"
echo ""

CALC_USA=$(curl -s -X POST "$BASE_URL/api/calculation/landed-cost" \
  -H "Content-Type: application/json" \
  -d '{
    "codeHs": "080510",
    "paysDestination": "USA",
    "valeurFob": 5000,
    "coutTransport": 800,
    "assurance": 50,
    "currency": "USD",
    "portId": 5
  }')

echo "$CALC_USA" | jq '{
  produit: .nomProduit,
  destination: .paysDestination,
  "Valeur CAF": .valeurCaf,
  "Douane": .montantDouane,
  "TVA (0% aux USA)": .montantTva,
  "Frais portuaires": .fraisPortuaires,
  "TOTAL (USD)": .coutTotal
}'

echo -e "\n${GREEN}✅ Calcul USA : TVA = 0% (spécificité américaine)${NC}"

pause

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 7 : Tous les ports disponibles
# ═══════════════════════════════════════════════════════════════
step "ÉTAPE 7 : Liste complète des ports disponibles"
show_command "curl -X GET $BASE_URL/api/ports"
echo ""
curl -s -X GET "$BASE_URL/api/ports" | jq '.[] | {pays, nomPort, typePort, fraisPortuaires}'
echo -e "\n${GREEN}✅ 8 ports disponibles (4 Europe + 4 USA)${NC}"

pause

# ═══════════════════════════════════════════════════════════════
# ÉTAPE 8 : Génération PDF
# ═══════════════════════════════════════════════════════════════
step "ÉTAPE 8 : Génération du PDF du calcul"
show_command "curl -X POST $BASE_URL/api/pdf/landed-cost -d '{...}' --output demo_landed_cost.pdf"
echo ""

curl -s -X POST "$BASE_URL/api/pdf/landed-cost" \
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
  --output demo_landed_cost.pdf

if [ -f "demo_landed_cost.pdf" ]; then
    FILE_SIZE=$(ls -lh demo_landed_cost.pdf | awk '{print $5}')
    echo -e "${GREEN}✅ PDF généré avec succès : demo_landed_cost.pdf ($FILE_SIZE)${NC}"
    echo -e "${BLUE}Ouverture du PDF...${NC}"
    open demo_landed_cost.pdf 2>/dev/null || xdg-open demo_landed_cost.pdf 2>/dev/null || echo "Ouvrez manuellement: demo_landed_cost.pdf"
else
    echo -e "${RED}❌ Erreur lors de la génération du PDF${NC}"
fi

pause

# ═══════════════════════════════════════════════════════════════
# RÉSUMÉ
# ═══════════════════════════════════════════════════════════════
step "RÉSUMÉ DE LA DÉMONSTRATION"

echo -e "${GREEN}✅ APIs démontrées :${NC}"
echo "   1. GET  /api/tarifs-douaniers/categories"
echo "   2. GET  /api/tarifs-douaniers/pays"
echo "   3. GET  /api/tarifs-douaniers/categorie/{categorie}"
echo "   4. GET  /api/ports?pays={pays}"
echo "   5. POST /api/calculation/landed-cost"
echo "   6. POST /api/pdf/landed-cost"
echo ""

echo -e "${GREEN}✅ Fonctionnalités démontrées :${NC}"
echo "   • Récupération dynamique des données"
echo "   • Calcul automatique du Landed Cost"
echo "   • Support multi-devises (MAD, EUR, USD)"
echo "   • Conversions automatiques"
echo "   • Gestion des frais portuaires"
echo "   • Adaptation par pays (TVA USA = 0%)"
echo "   • Génération de PDF professionnel"
echo ""

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              Démonstration terminée avec succès !              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}📄 Fichiers générés :${NC}"
echo "   • demo_landed_cost.pdf"
echo ""

echo -e "${YELLOW}📚 Documentation complète :${NC}"
echo "   • API_DEMO_GUIDE.md"
echo "   • DEPLOYMENT_GUIDE.md"
echo "   • ARCHITECTURE.md"
echo ""

echo -e "${BLUE}Pour plus d'informations, consultez : http://localhost:3000${NC}"
