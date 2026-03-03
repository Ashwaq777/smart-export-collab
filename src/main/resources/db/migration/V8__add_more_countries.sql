-- Add more countries with tariffs for existing products
-- This migration adds tariffs for additional countries: Spain, Italy, Germany, UK, Belgium, Netherlands, China, Japan

-- Tomates (0702.00) - Additional countries
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0702.00', 'Tomates', 'Légumes', 'Espagne', 10.40, 21.00),
    ('0702.00', 'Tomates', 'Légumes', 'Italie', 10.40, 22.00),
    ('0702.00', 'Tomates', 'Légumes', 'Allemagne', 10.40, 19.00),
    ('0702.00', 'Tomates', 'Légumes', 'Royaume-Uni', 8.00, 20.00),
    ('0702.00', 'Tomates', 'Légumes', 'Belgique', 10.40, 21.00),
    ('0702.00', 'Tomates', 'Légumes', 'Pays-Bas', 10.40, 21.00),
    ('0702.00', 'Tomates', 'Légumes', 'Chine', 15.00, 13.00),
    ('0702.00', 'Tomates', 'Légumes', 'Japon', 3.00, 10.00);

-- Oranges (0805.10) - Additional countries
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0805.10', 'Oranges', 'Fruits', 'Espagne', 12.80, 21.00),
    ('0805.10', 'Oranges', 'Fruits', 'Italie', 12.80, 22.00),
    ('0805.10', 'Oranges', 'Fruits', 'Allemagne', 12.80, 19.00),
    ('0805.10', 'Oranges', 'Fruits', 'Royaume-Uni', 10.00, 20.00),
    ('0805.10', 'Oranges', 'Fruits', 'Belgique', 12.80, 21.00),
    ('0805.10', 'Oranges', 'Fruits', 'Pays-Bas', 12.80, 21.00),
    ('0805.10', 'Oranges', 'Fruits', 'Chine', 25.00, 13.00),
    ('0805.10', 'Oranges', 'Fruits', 'Japon', 6.00, 10.00);

-- Pommes de terre (0701.90) - Additional countries
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0701.90', 'Pommes de terre', 'Légumes', 'Espagne', 11.50, 21.00),
    ('0701.90', 'Pommes de terre', 'Légumes', 'Italie', 11.50, 22.00),
    ('0701.90', 'Pommes de terre', 'Légumes', 'Allemagne', 11.50, 19.00),
    ('0701.90', 'Pommes de terre', 'Légumes', 'Royaume-Uni', 9.00, 20.00),
    ('0701.90', 'Pommes de terre', 'Légumes', 'Belgique', 11.50, 21.00),
    ('0701.90', 'Pommes de terre', 'Légumes', 'Pays-Bas', 11.50, 21.00),
    ('0701.90', 'Pommes de terre', 'Légumes', 'Chine', 13.00, 13.00),
    ('0701.90', 'Pommes de terre', 'Légumes', 'Japon', 4.30, 10.00);

-- Bananes (0803.90) - Additional countries
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0803.90', 'Bananes', 'Fruits', 'Espagne', 16.00, 21.00),
    ('0803.90', 'Bananes', 'Fruits', 'Italie', 16.00, 22.00),
    ('0803.90', 'Bananes', 'Fruits', 'Allemagne', 16.00, 19.00),
    ('0803.90', 'Bananes', 'Fruits', 'Royaume-Uni', 0.00, 20.00),
    ('0803.90', 'Bananes', 'Fruits', 'Belgique', 16.00, 21.00),
    ('0803.90', 'Bananes', 'Fruits', 'Pays-Bas', 16.00, 21.00),
    ('0803.90', 'Bananes', 'Fruits', 'Chine', 10.00, 13.00),
    ('0803.90', 'Bananes', 'Fruits', 'Japon', 10.00, 10.00);

-- Carottes (0706.10) - Additional countries
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0706.10', 'Carottes', 'Légumes', 'Espagne', 13.60, 21.00),
    ('0706.10', 'Carottes', 'Légumes', 'Italie', 13.60, 22.00),
    ('0706.10', 'Carottes', 'Légumes', 'Allemagne', 13.60, 19.00),
    ('0706.10', 'Carottes', 'Légumes', 'Royaume-Uni', 10.00, 20.00),
    ('0706.10', 'Carottes', 'Légumes', 'Belgique', 13.60, 21.00),
    ('0706.10', 'Carottes', 'Légumes', 'Pays-Bas', 13.60, 21.00),
    ('0706.10', 'Carottes', 'Légumes', 'Chine', 13.00, 13.00),
    ('0706.10', 'Carottes', 'Légumes', 'Japon', 3.00, 10.00);
