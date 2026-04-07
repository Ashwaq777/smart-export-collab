-- Drop old tables
DROP TABLE IF EXISTS tariff_rules CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;
DROP TABLE IF EXISTS countries CASCADE;

CREATE TABLE tarifs_douaniers (
    id BIGSERIAL PRIMARY KEY,
    code_hs VARCHAR(50) NOT NULL,
    nom_produit VARCHAR(255) NOT NULL,
    categorie VARCHAR(100) NOT NULL,
    pays_destination VARCHAR(255) NOT NULL,
    taux_douane NUMERIC(5, 2) NOT NULL,
    taux_tva NUMERIC(5, 2) NOT NULL
);


CREATE INDEX idx_tarifs_code_hs ON tarifs_douaniers(code_hs);
CREATE INDEX idx_tarifs_categorie ON tarifs_douaniers(categorie);
CREATE INDEX idx_tarifs_pays ON tarifs_douaniers(pays_destination);


INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0702.00', 'Tomates', 'Légumes', 'France', 10.40, 20.00),
    ('0702.00', 'Tomates', 'Légumes', 'Maroc', 2.50, 20.00),
    ('0702.00', 'Tomates', 'Légumes', 'États-Unis', 0.00, 0.00);

-- Oranges
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0805.10', 'Oranges', 'Fruits', 'France', 12.80, 20.00),
    ('0805.10', 'Oranges', 'Fruits', 'Maroc', 3.20, 20.00),
    ('0805.10', 'Oranges', 'Fruits', 'États-Unis', 1.90, 0.00);

-- Pommes de terre
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0701.90', 'Pommes de terre', 'Légumes', 'France', 11.50, 20.00),
    ('0701.90', 'Pommes de terre', 'Légumes', 'Maroc', 2.80, 20.00),
    ('0701.90', 'Pommes de terre', 'Légumes', 'États-Unis', 0.50, 0.00);

-- Bananes (exemple de hiérarchie: Banane appartient à Fruits)
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0803.90', 'Bananes', 'Fruits', 'France', 16.00, 20.00),
    ('0803.90', 'Bananes', 'Fruits', 'Maroc', 4.00, 20.00),
    ('0803.90', 'Bananes', 'Fruits', 'États-Unis', 0.00, 0.00);

-- Carottes
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0706.10', 'Carottes', 'Légumes', 'France', 13.60, 20.00),
    ('0706.10', 'Carottes', 'Légumes', 'Maroc', 3.40, 20.00),
    ('0706.10', 'Carottes', 'Légumes', 'États-Unis', 0.00, 0.00);
