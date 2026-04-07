-- Migration V7: Ajouter les métadonnées pour les taux douaniers réels
-- Source: WTO Tariff Download Facility, ITC Market Access Map, UNCTAD TRAINS
-- Date: 2026-02-24

-- Ajouter les colonnes de métadonnées sans casser l'existant
ALTER TABLE tarifs_douaniers 
ADD COLUMN IF NOT EXISTS source_donnee VARCHAR(50),
ADD COLUMN IF NOT EXISTS annee_reference INTEGER,
ADD COLUMN IF NOT EXISTS type_tarif VARCHAR(50),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_tarifs_source ON tarifs_douaniers(source_donnee);
CREATE INDEX IF NOT EXISTS idx_tarifs_annee ON tarifs_douaniers(annee_reference);

-- Commentaires sur les colonnes
COMMENT ON COLUMN tarifs_douaniers.source_donnee IS 'Source des données: WTO, ITC, UNCTAD, ou Estimation';
COMMENT ON COLUMN tarifs_douaniers.annee_reference IS 'Année de référence des taux';
COMMENT ON COLUMN tarifs_douaniers.type_tarif IS 'Type de tarif: MFN Applied, Bound Rate, Preferential';
COMMENT ON COLUMN tarifs_douaniers.notes IS 'Notes additionnelles sur les taux';
