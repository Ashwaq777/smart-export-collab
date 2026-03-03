-- Ajouter la colonne taxe_parafiscale (0.25% pour le Maroc)
ALTER TABLE tarifs_douaniers 
ADD COLUMN taxe_parafiscale NUMERIC(5, 2) DEFAULT 0.00;

-- Étendre le champ code_hs pour supporter jusqu'à 10 chiffres
ALTER TABLE tarifs_douaniers 
ALTER COLUMN code_hs TYPE VARCHAR(10);

-- Mettre à jour les tarifs du Maroc avec la taxe parafiscale de 0.25%
UPDATE tarifs_douaniers 
SET taxe_parafiscale = 0.25 
WHERE pays_destination = 'Maroc';

-- Mettre à jour les autres pays avec 0.00%
UPDATE tarifs_douaniers 
SET taxe_parafiscale = 0.00 
WHERE pays_destination != 'Maroc';
