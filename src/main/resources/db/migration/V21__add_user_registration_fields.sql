-- Ajouter les champs manquants pour l'inscription complète
-- Ajoutés le 2026-03-11 pour supporter le formulaire d'inscription étendu

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS company_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS country VARCHAR(100);

-- Ajouter des commentaires pour documentation
COMMENT ON COLUMN users.first_name IS 'Prénom de l''utilisateur';
COMMENT ON COLUMN users.last_name IS 'Nom de famille de l''utilisateur';
COMMENT ON COLUMN users.phone IS 'Numéro de téléphone de l''utilisateur';
COMMENT ON COLUMN users.birth_date IS 'Date de naissance de l''utilisateur (optionnel)';
COMMENT ON COLUMN users.company_name IS 'Nom de l''entreprise de l''utilisateur';
COMMENT ON COLUMN users.country IS 'Pays de l''utilisateur';

-- Mettre à jour les utilisateurs existants avec des valeurs par défaut si nécessaire
UPDATE users 
SET 
    first_name = 'Utilisateur',
    last_name = 'Existant',
    phone = '+0000000000',
    company_name = 'Non spécifié',
    country = 'Non spécifié'
WHERE first_name IS NULL OR last_name IS NULL;
