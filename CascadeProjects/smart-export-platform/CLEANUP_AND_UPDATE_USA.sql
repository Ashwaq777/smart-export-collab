-- ============================================================================
-- NETTOYAGE ET MISE À JOUR DES DONNÉES USA
-- ============================================================================
-- Correction des doublons et mise à jour des taux USA manquants
-- ============================================================================

BEGIN;

-- Supprimer les anciens enregistrements avec codes HS formatés (avec points)
-- On garde uniquement les codes HS normalisés (sans points)
DELETE FROM tarifs_douaniers WHERE code_hs IN ('0702.00', '0701.90', '0706.10', '0805.10', '0803.90');

-- Supprimer les anciens enregistrements USA avec "États-Unis"
DELETE FROM tarifs_douaniers WHERE pays_destination = 'États-Unis';

-- Mettre à jour les enregistrements USA existants avec les données réelles
UPDATE tarifs_douaniers 
SET 
    taux_douane = 3.50,
    taux_tva = 0.00,
    taxe_parafiscale = 0.00,
    source_donnee = 'ITC',
    annee_reference = 2024,
    type_tarif = 'MFN Applied',
    notes = 'Taux spécifique US: 2.8 cents/kg, équivalent ad valorem ~3.5%'
WHERE code_hs = '070200' AND pays_destination = 'USA';

UPDATE tarifs_douaniers 
SET 
    taux_douane = 0.60,
    taux_tva = 0.00,
    taxe_parafiscale = 0.00,
    source_donnee = 'ITC',
    annee_reference = 2024,
    type_tarif = 'MFN Applied',
    notes = 'Taux spécifique US: 0.5 cents/kg, équivalent ad valorem ~0.6%'
WHERE code_hs = '070190' AND pays_destination = 'USA';

UPDATE tarifs_douaniers 
SET 
    taux_douane = 0.00,
    taux_tva = 0.00,
    taxe_parafiscale = 0.00,
    source_donnee = 'ITC',
    annee_reference = 2024,
    type_tarif = 'MFN Applied',
    notes = 'Entrée libre aux USA pour carottes fraîches'
WHERE code_hs = '070610' AND pays_destination = 'USA';

UPDATE tarifs_douaniers 
SET 
    taux_douane = 2.40,
    taux_tva = 0.00,
    taxe_parafiscale = 0.00,
    source_donnee = 'ITC',
    annee_reference = 2024,
    type_tarif = 'MFN Applied',
    notes = 'Taux spécifique US: 1.9 cents/kg, équivalent ad valorem ~2.4%'
WHERE code_hs = '080510' AND pays_destination = 'USA';

UPDATE tarifs_douaniers 
SET 
    taux_douane = 0.00,
    taux_tva = 0.00,
    taxe_parafiscale = 0.00,
    source_donnee = 'ITC',
    annee_reference = 2024,
    type_tarif = 'MFN Applied',
    notes = 'Entrée libre aux USA pour bananes fraîches'
WHERE code_hs = '080390' AND pays_destination = 'USA';

COMMIT;

-- Vérification finale
SELECT 
    nom_produit,
    code_hs,
    pays_destination,
    taux_douane,
    taux_tva,
    taxe_parafiscale,
    source_donnee,
    annee_reference,
    type_tarif
FROM tarifs_douaniers
ORDER BY nom_produit, pays_destination;
