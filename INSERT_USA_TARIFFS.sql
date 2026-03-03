-- ============================================================================
-- INSERTION DES TAUX DOUANIERS USA AVEC DONNÉES RÉELLES
-- ============================================================================
-- Source: ITC Market Access Map - US HTS 2024
-- ============================================================================

BEGIN;

-- TOMATES (HS Code: 0702.00)
-- Source: ITC Market Access Map - US HTS 2024
-- Taux: 2.8 cents/kg (équivalent ad valorem ~3.5%)
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva, taxe_parafiscale, source_donnee, annee_reference, type_tarif, notes)
VALUES ('070200', 'Tomates', 'Légumes', 'USA', 3.50, 0.00, 0.00, 'ITC', 2024, 'MFN Applied', 'Taux spécifique US: 2.8 cents/kg, équivalent ad valorem ~3.5%');

-- POMMES DE TERRE (HS Code: 0701.90)
-- Source: ITC Market Access Map - US HTS 2024
-- Taux: 0.5 cents/kg (équivalent ad valorem ~0.6%)
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva, taxe_parafiscale, source_donnee, annee_reference, type_tarif, notes)
VALUES ('070190', 'Pommes de terre', 'Légumes', 'USA', 0.60, 0.00, 0.00, 'ITC', 2024, 'MFN Applied', 'Taux spécifique US: 0.5 cents/kg, équivalent ad valorem ~0.6%');

-- CAROTTES (HS Code: 0706.10)
-- Source: ITC Market Access Map - US HTS 2024
-- Taux: Free (0%)
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva, taxe_parafiscale, source_donnee, annee_reference, type_tarif, notes)
VALUES ('070610', 'Carottes', 'Légumes', 'USA', 0.00, 0.00, 0.00, 'ITC', 2024, 'MFN Applied', 'Entrée libre aux USA pour carottes fraîches');

-- ORANGES (HS Code: 0805.10)
-- Source: ITC Market Access Map - US HTS 2024
-- Taux: 1.9 cents/kg (équivalent ad valorem ~2.4%)
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva, taxe_parafiscale, source_donnee, annee_reference, type_tarif, notes)
VALUES ('080510', 'Oranges', 'Fruits', 'USA', 2.40, 0.00, 0.00, 'ITC', 2024, 'MFN Applied', 'Taux spécifique US: 1.9 cents/kg, équivalent ad valorem ~2.4%');

-- BANANES (HS Code: 0803.90)
-- Source: ITC Market Access Map - US HTS 2024
-- Taux: Free (0%)
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva, taxe_parafiscale, source_donnee, annee_reference, type_tarif, notes)
VALUES ('080390', 'Bananes', 'Fruits', 'USA', 0.00, 0.00, 0.00, 'ITC', 2024, 'MFN Applied', 'Entrée libre aux USA pour bananes fraîches');

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
