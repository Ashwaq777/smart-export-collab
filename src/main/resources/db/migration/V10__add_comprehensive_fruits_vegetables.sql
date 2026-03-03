-- Add comprehensive list of fruits and vegetables with tariffs for all countries
-- This migration adds a wide variety of international fruits and vegetables

-- LÉGUMES (Vegetables) - Additional products

-- Oignons
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0703.10', 'Oignons', 'Légumes', 'France', 9.60, 20.00),
    ('0703.10', 'Oignons', 'Légumes', 'Maroc', 2.40, 20.00),
    ('0703.10', 'Oignons', 'Légumes', 'États-Unis', 0.00, 0.00),
    ('0703.10', 'Oignons', 'Légumes', 'Espagne', 9.60, 21.00),
    ('0703.10', 'Oignons', 'Légumes', 'Italie', 9.60, 22.00),
    ('0703.10', 'Oignons', 'Légumes', 'Allemagne', 9.60, 19.00),
    ('0703.10', 'Oignons', 'Légumes', 'Royaume-Uni', 7.50, 20.00),
    ('0703.10', 'Oignons', 'Légumes', 'Belgique', 9.60, 21.00),
    ('0703.10', 'Oignons', 'Légumes', 'Pays-Bas', 9.60, 21.00),
    ('0703.10', 'Oignons', 'Légumes', 'Chine', 13.00, 13.00),
    ('0703.10', 'Oignons', 'Légumes', 'Japon', 3.00, 10.00);

-- Courgettes
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0709.90', 'Courgettes', 'Légumes', 'France', 11.20, 20.00),
    ('0709.90', 'Courgettes', 'Légumes', 'Maroc', 2.80, 20.00),
    ('0709.90', 'Courgettes', 'Légumes', 'États-Unis', 0.00, 0.00),
    ('0709.90', 'Courgettes', 'Légumes', 'Espagne', 11.20, 21.00),
    ('0709.90', 'Courgettes', 'Légumes', 'Italie', 11.20, 22.00),
    ('0709.90', 'Courgettes', 'Légumes', 'Allemagne', 11.20, 19.00),
    ('0709.90', 'Courgettes', 'Légumes', 'Royaume-Uni', 8.80, 20.00),
    ('0709.90', 'Courgettes', 'Légumes', 'Belgique', 11.20, 21.00),
    ('0709.90', 'Courgettes', 'Légumes', 'Pays-Bas', 11.20, 21.00),
    ('0709.90', 'Courgettes', 'Légumes', 'Chine', 13.00, 13.00),
    ('0709.90', 'Courgettes', 'Légumes', 'Japon', 3.00, 10.00);

-- Poivrons
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0709.60', 'Poivrons', 'Légumes', 'France', 10.40, 20.00),
    ('0709.60', 'Poivrons', 'Légumes', 'Maroc', 2.60, 20.00),
    ('0709.60', 'Poivrons', 'Légumes', 'États-Unis', 0.00, 0.00),
    ('0709.60', 'Poivrons', 'Légumes', 'Espagne', 10.40, 21.00),
    ('0709.60', 'Poivrons', 'Légumes', 'Italie', 10.40, 22.00),
    ('0709.60', 'Poivrons', 'Légumes', 'Allemagne', 10.40, 19.00),
    ('0709.60', 'Poivrons', 'Légumes', 'Royaume-Uni', 8.20, 20.00),
    ('0709.60', 'Poivrons', 'Légumes', 'Belgique', 10.40, 21.00),
    ('0709.60', 'Poivrons', 'Légumes', 'Pays-Bas', 10.40, 21.00),
    ('0709.60', 'Poivrons', 'Légumes', 'Chine', 13.00, 13.00),
    ('0709.60', 'Poivrons', 'Légumes', 'Japon', 3.00, 10.00);

-- Aubergines
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0709.30', 'Aubergines', 'Légumes', 'France', 10.40, 20.00),
    ('0709.30', 'Aubergines', 'Légumes', 'Maroc', 2.60, 20.00),
    ('0709.30', 'Aubergines', 'Légumes', 'États-Unis', 0.00, 0.00),
    ('0709.30', 'Aubergines', 'Légumes', 'Espagne', 10.40, 21.00),
    ('0709.30', 'Aubergines', 'Légumes', 'Italie', 10.40, 22.00),
    ('0709.30', 'Aubergines', 'Légumes', 'Allemagne', 10.40, 19.00),
    ('0709.30', 'Aubergines', 'Légumes', 'Royaume-Uni', 8.20, 20.00),
    ('0709.30', 'Aubergines', 'Légumes', 'Belgique', 10.40, 21.00),
    ('0709.30', 'Aubergines', 'Légumes', 'Pays-Bas', 10.40, 21.00),
    ('0709.30', 'Aubergines', 'Légumes', 'Chine', 13.00, 13.00),
    ('0709.30', 'Aubergines', 'Légumes', 'Japon', 3.00, 10.00);

-- Concombres
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0707.00', 'Concombres', 'Légumes', 'France', 12.80, 20.00),
    ('0707.00', 'Concombres', 'Légumes', 'Maroc', 3.20, 20.00),
    ('0707.00', 'Concombres', 'Légumes', 'États-Unis', 0.00, 0.00),
    ('0707.00', 'Concombres', 'Légumes', 'Espagne', 12.80, 21.00),
    ('0707.00', 'Concombres', 'Légumes', 'Italie', 12.80, 22.00),
    ('0707.00', 'Concombres', 'Légumes', 'Allemagne', 12.80, 19.00),
    ('0707.00', 'Concombres', 'Légumes', 'Royaume-Uni', 10.00, 20.00),
    ('0707.00', 'Concombres', 'Légumes', 'Belgique', 12.80, 21.00),
    ('0707.00', 'Concombres', 'Légumes', 'Pays-Bas', 12.80, 21.00),
    ('0707.00', 'Concombres', 'Légumes', 'Chine', 13.00, 13.00),
    ('0707.00', 'Concombres', 'Légumes', 'Japon', 3.00, 10.00);

-- Brocoli
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0704.90', 'Brocoli', 'Légumes', 'France', 10.40, 20.00),
    ('0704.90', 'Brocoli', 'Légumes', 'Maroc', 2.60, 20.00),
    ('0704.90', 'Brocoli', 'Légumes', 'États-Unis', 0.00, 0.00),
    ('0704.90', 'Brocoli', 'Légumes', 'Espagne', 10.40, 21.00),
    ('0704.90', 'Brocoli', 'Légumes', 'Italie', 10.40, 22.00),
    ('0704.90', 'Brocoli', 'Légumes', 'Allemagne', 10.40, 19.00),
    ('0704.90', 'Brocoli', 'Légumes', 'Royaume-Uni', 8.20, 20.00),
    ('0704.90', 'Brocoli', 'Légumes', 'Belgique', 10.40, 21.00),
    ('0704.90', 'Brocoli', 'Légumes', 'Pays-Bas', 10.40, 21.00),
    ('0704.90', 'Brocoli', 'Légumes', 'Chine', 13.00, 13.00),
    ('0704.90', 'Brocoli', 'Légumes', 'Japon', 3.00, 10.00);

-- Choux
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0704.10', 'Choux', 'Légumes', 'France', 10.40, 20.00),
    ('0704.10', 'Choux', 'Légumes', 'Maroc', 2.60, 20.00),
    ('0704.10', 'Choux', 'Légumes', 'États-Unis', 0.00, 0.00),
    ('0704.10', 'Choux', 'Légumes', 'Espagne', 10.40, 21.00),
    ('0704.10', 'Choux', 'Légumes', 'Italie', 10.40, 22.00),
    ('0704.10', 'Choux', 'Légumes', 'Allemagne', 10.40, 19.00),
    ('0704.10', 'Choux', 'Légumes', 'Royaume-Uni', 8.20, 20.00),
    ('0704.10', 'Choux', 'Légumes', 'Belgique', 10.40, 21.00),
    ('0704.10', 'Choux', 'Légumes', 'Pays-Bas', 10.40, 21.00),
    ('0704.10', 'Choux', 'Légumes', 'Chine', 13.00, 13.00),
    ('0704.10', 'Choux', 'Légumes', 'Japon', 3.00, 10.00);

-- Laitue
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0705.11', 'Laitue', 'Légumes', 'France', 10.40, 20.00),
    ('0705.11', 'Laitue', 'Légumes', 'Maroc', 2.60, 20.00),
    ('0705.11', 'Laitue', 'Légumes', 'États-Unis', 0.00, 0.00),
    ('0705.11', 'Laitue', 'Légumes', 'Espagne', 10.40, 21.00),
    ('0705.11', 'Laitue', 'Légumes', 'Italie', 10.40, 22.00),
    ('0705.11', 'Laitue', 'Légumes', 'Allemagne', 10.40, 19.00),
    ('0705.11', 'Laitue', 'Légumes', 'Royaume-Uni', 8.20, 20.00),
    ('0705.11', 'Laitue', 'Légumes', 'Belgique', 10.40, 21.00),
    ('0705.11', 'Laitue', 'Légumes', 'Pays-Bas', 10.40, 21.00),
    ('0705.11', 'Laitue', 'Légumes', 'Chine', 13.00, 13.00),
    ('0705.11', 'Laitue', 'Légumes', 'Japon', 3.00, 10.00);

-- Épinards
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0709.70', 'Épinards', 'Légumes', 'France', 10.40, 20.00),
    ('0709.70', 'Épinards', 'Légumes', 'Maroc', 2.60, 20.00),
    ('0709.70', 'Épinards', 'Légumes', 'États-Unis', 0.00, 0.00),
    ('0709.70', 'Épinards', 'Légumes', 'Espagne', 10.40, 21.00),
    ('0709.70', 'Épinards', 'Légumes', 'Italie', 10.40, 22.00),
    ('0709.70', 'Épinards', 'Légumes', 'Allemagne', 10.40, 19.00),
    ('0709.70', 'Épinards', 'Légumes', 'Royaume-Uni', 8.20, 20.00),
    ('0709.70', 'Épinards', 'Légumes', 'Belgique', 10.40, 21.00),
    ('0709.70', 'Épinards', 'Légumes', 'Pays-Bas', 10.40, 21.00),
    ('0709.70', 'Épinards', 'Légumes', 'Chine', 13.00, 13.00),
    ('0709.70', 'Épinards', 'Légumes', 'Japon', 3.00, 10.00);

-- Haricots verts
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0708.20', 'Haricots verts', 'Légumes', 'France', 11.20, 20.00),
    ('0708.20', 'Haricots verts', 'Légumes', 'Maroc', 2.80, 20.00),
    ('0708.20', 'Haricots verts', 'Légumes', 'États-Unis', 0.00, 0.00),
    ('0708.20', 'Haricots verts', 'Légumes', 'Espagne', 11.20, 21.00),
    ('0708.20', 'Haricots verts', 'Légumes', 'Italie', 11.20, 22.00),
    ('0708.20', 'Haricots verts', 'Légumes', 'Allemagne', 11.20, 19.00),
    ('0708.20', 'Haricots verts', 'Légumes', 'Royaume-Uni', 8.80, 20.00),
    ('0708.20', 'Haricots verts', 'Légumes', 'Belgique', 11.20, 21.00),
    ('0708.20', 'Haricots verts', 'Légumes', 'Pays-Bas', 11.20, 21.00),
    ('0708.20', 'Haricots verts', 'Légumes', 'Chine', 13.00, 13.00),
    ('0708.20', 'Haricots verts', 'Légumes', 'Japon', 3.00, 10.00);

-- Petits pois
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0708.10', 'Petits pois', 'Légumes', 'France', 11.20, 20.00),
    ('0708.10', 'Petits pois', 'Légumes', 'Maroc', 2.80, 20.00),
    ('0708.10', 'Petits pois', 'Légumes', 'États-Unis', 0.00, 0.00),
    ('0708.10', 'Petits pois', 'Légumes', 'Espagne', 11.20, 21.00),
    ('0708.10', 'Petits pois', 'Légumes', 'Italie', 11.20, 22.00),
    ('0708.10', 'Petits pois', 'Légumes', 'Allemagne', 11.20, 19.00),
    ('0708.10', 'Petits pois', 'Légumes', 'Royaume-Uni', 8.80, 20.00),
    ('0708.10', 'Petits pois', 'Légumes', 'Belgique', 11.20, 21.00),
    ('0708.10', 'Petits pois', 'Légumes', 'Pays-Bas', 11.20, 21.00),
    ('0708.10', 'Petits pois', 'Légumes', 'Chine', 13.00, 13.00),
    ('0708.10', 'Petits pois', 'Légumes', 'Japon', 3.00, 10.00);

-- Maïs
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0709.99', 'Maïs', 'Légumes', 'France', 9.40, 20.00),
    ('0709.99', 'Maïs', 'Légumes', 'Maroc', 2.35, 20.00),
    ('0709.99', 'Maïs', 'Légumes', 'États-Unis', 0.00, 0.00),
    ('0709.99', 'Maïs', 'Légumes', 'Espagne', 9.40, 21.00),
    ('0709.99', 'Maïs', 'Légumes', 'Italie', 9.40, 22.00),
    ('0709.99', 'Maïs', 'Légumes', 'Allemagne', 9.40, 19.00),
    ('0709.99', 'Maïs', 'Légumes', 'Royaume-Uni', 7.40, 20.00),
    ('0709.99', 'Maïs', 'Légumes', 'Belgique', 9.40, 21.00),
    ('0709.99', 'Maïs', 'Légumes', 'Pays-Bas', 9.40, 21.00),
    ('0709.99', 'Maïs', 'Légumes', 'Chine', 13.00, 13.00),
    ('0709.99', 'Maïs', 'Légumes', 'Japon', 3.00, 10.00);

-- Artichauts
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0709.10', 'Artichauts', 'Légumes', 'France', 10.40, 20.00),
    ('0709.10', 'Artichauts', 'Légumes', 'Maroc', 2.60, 20.00),
    ('0709.10', 'Artichauts', 'Légumes', 'États-Unis', 0.00, 0.00),
    ('0709.10', 'Artichauts', 'Légumes', 'Espagne', 10.40, 21.00),
    ('0709.10', 'Artichauts', 'Légumes', 'Italie', 10.40, 22.00),
    ('0709.10', 'Artichauts', 'Légumes', 'Allemagne', 10.40, 19.00),
    ('0709.10', 'Artichauts', 'Légumes', 'Royaume-Uni', 8.20, 20.00),
    ('0709.10', 'Artichauts', 'Légumes', 'Belgique', 10.40, 21.00),
    ('0709.10', 'Artichauts', 'Légumes', 'Pays-Bas', 10.40, 21.00),
    ('0709.10', 'Artichauts', 'Légumes', 'Chine', 13.00, 13.00),
    ('0709.10', 'Artichauts', 'Légumes', 'Japon', 3.00, 10.00);

-- Céleri
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0709.40', 'Céleri', 'Légumes', 'France', 10.40, 20.00),
    ('0709.40', 'Céleri', 'Légumes', 'Maroc', 2.60, 20.00),
    ('0709.40', 'Céleri', 'Légumes', 'États-Unis', 0.00, 0.00),
    ('0709.40', 'Céleri', 'Légumes', 'Espagne', 10.40, 21.00),
    ('0709.40', 'Céleri', 'Légumes', 'Italie', 10.40, 22.00),
    ('0709.40', 'Céleri', 'Légumes', 'Allemagne', 10.40, 19.00),
    ('0709.40', 'Céleri', 'Légumes', 'Royaume-Uni', 8.20, 20.00),
    ('0709.40', 'Céleri', 'Légumes', 'Belgique', 10.40, 21.00),
    ('0709.40', 'Céleri', 'Légumes', 'Pays-Bas', 10.40, 21.00),
    ('0709.40', 'Céleri', 'Légumes', 'Chine', 13.00, 13.00),
    ('0709.40', 'Céleri', 'Légumes', 'Japon', 3.00, 10.00);

-- Betteraves
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0706.90', 'Betteraves', 'Légumes', 'France', 13.60, 20.00),
    ('0706.90', 'Betteraves', 'Légumes', 'Maroc', 3.40, 20.00),
    ('0706.90', 'Betteraves', 'Légumes', 'États-Unis', 0.00, 0.00),
    ('0706.90', 'Betteraves', 'Légumes', 'Espagne', 13.60, 21.00),
    ('0706.90', 'Betteraves', 'Légumes', 'Italie', 13.60, 22.00),
    ('0706.90', 'Betteraves', 'Légumes', 'Allemagne', 13.60, 19.00),
    ('0706.90', 'Betteraves', 'Légumes', 'Royaume-Uni', 10.70, 20.00),
    ('0706.90', 'Betteraves', 'Légumes', 'Belgique', 13.60, 21.00),
    ('0706.90', 'Betteraves', 'Légumes', 'Pays-Bas', 13.60, 21.00),
    ('0706.90', 'Betteraves', 'Légumes', 'Chine', 13.00, 13.00),
    ('0706.90', 'Betteraves', 'Légumes', 'Japon', 3.00, 10.00);

-- Ail
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0703.20', 'Ail', 'Légumes', 'France', 9.60, 20.00),
    ('0703.20', 'Ail', 'Légumes', 'Maroc', 2.40, 20.00),
    ('0703.20', 'Ail', 'Légumes', 'États-Unis', 0.00, 0.00),
    ('0703.20', 'Ail', 'Légumes', 'Espagne', 9.60, 21.00),
    ('0703.20', 'Ail', 'Légumes', 'Italie', 9.60, 22.00),
    ('0703.20', 'Ail', 'Légumes', 'Allemagne', 9.60, 19.00),
    ('0703.20', 'Ail', 'Légumes', 'Royaume-Uni', 7.50, 20.00),
    ('0703.20', 'Ail', 'Légumes', 'Belgique', 9.60, 21.00),
    ('0703.20', 'Ail', 'Légumes', 'Pays-Bas', 9.60, 21.00),
    ('0703.20', 'Ail', 'Légumes', 'Chine', 13.00, 13.00),
    ('0703.20', 'Ail', 'Légumes', 'Japon', 3.00, 10.00);

-- Gingembre
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0910.11', 'Gingembre', 'Légumes', 'France', 0.00, 20.00),
    ('0910.11', 'Gingembre', 'Légumes', 'Maroc', 0.00, 20.00),
    ('0910.11', 'Gingembre', 'Légumes', 'États-Unis', 0.00, 0.00),
    ('0910.11', 'Gingembre', 'Légumes', 'Espagne', 0.00, 21.00),
    ('0910.11', 'Gingembre', 'Légumes', 'Italie', 0.00, 22.00),
    ('0910.11', 'Gingembre', 'Légumes', 'Allemagne', 0.00, 19.00),
    ('0910.11', 'Gingembre', 'Légumes', 'Royaume-Uni', 0.00, 20.00),
    ('0910.11', 'Gingembre', 'Légumes', 'Belgique', 0.00, 21.00),
    ('0910.11', 'Gingembre', 'Légumes', 'Pays-Bas', 0.00, 21.00),
    ('0910.11', 'Gingembre', 'Légumes', 'Chine', 0.00, 13.00),
    ('0910.11', 'Gingembre', 'Légumes', 'Japon', 0.00, 10.00);

-- FRUITS - Additional products

-- Pommes
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0808.10', 'Pommes', 'Fruits', 'France', 10.40, 20.00),
    ('0808.10', 'Pommes', 'Fruits', 'Maroc', 2.60, 20.00),
    ('0808.10', 'Pommes', 'Fruits', 'États-Unis', 0.00, 0.00),
    ('0808.10', 'Pommes', 'Fruits', 'Espagne', 10.40, 21.00),
    ('0808.10', 'Pommes', 'Fruits', 'Italie', 10.40, 22.00),
    ('0808.10', 'Pommes', 'Fruits', 'Allemagne', 10.40, 19.00),
    ('0808.10', 'Pommes', 'Fruits', 'Royaume-Uni', 8.20, 20.00),
    ('0808.10', 'Pommes', 'Fruits', 'Belgique', 10.40, 21.00),
    ('0808.10', 'Pommes', 'Fruits', 'Pays-Bas', 10.40, 21.00),
    ('0808.10', 'Pommes', 'Fruits', 'Chine', 10.00, 13.00),
    ('0808.10', 'Pommes', 'Fruits', 'Japon', 17.00, 10.00);

-- Mandarines
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0805.20', 'Mandarines', 'Fruits', 'France', 12.80, 20.00),
    ('0805.20', 'Mandarines', 'Fruits', 'Maroc', 3.20, 20.00),
    ('0805.20', 'Mandarines', 'Fruits', 'États-Unis', 1.90, 0.00),
    ('0805.20', 'Mandarines', 'Fruits', 'Espagne', 12.80, 21.00),
    ('0805.20', 'Mandarines', 'Fruits', 'Italie', 12.80, 22.00),
    ('0805.20', 'Mandarines', 'Fruits', 'Allemagne', 12.80, 19.00),
    ('0805.20', 'Mandarines', 'Fruits', 'Royaume-Uni', 10.00, 20.00),
    ('0805.20', 'Mandarines', 'Fruits', 'Belgique', 12.80, 21.00),
    ('0805.20', 'Mandarines', 'Fruits', 'Pays-Bas', 12.80, 21.00),
    ('0805.20', 'Mandarines', 'Fruits', 'Chine', 25.00, 13.00),
    ('0805.20', 'Mandarines', 'Fruits', 'Japon', 6.00, 10.00);

-- Citrons
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0805.50', 'Citrons', 'Fruits', 'France', 12.80, 20.00),
    ('0805.50', 'Citrons', 'Fruits', 'Maroc', 3.20, 20.00),
    ('0805.50', 'Citrons', 'Fruits', 'États-Unis', 1.90, 0.00),
    ('0805.50', 'Citrons', 'Fruits', 'Espagne', 12.80, 21.00),
    ('0805.50', 'Citrons', 'Fruits', 'Italie', 12.80, 22.00),
    ('0805.50', 'Citrons', 'Fruits', 'Allemagne', 12.80, 19.00),
    ('0805.50', 'Citrons', 'Fruits', 'Royaume-Uni', 10.00, 20.00),
    ('0805.50', 'Citrons', 'Fruits', 'Belgique', 12.80, 21.00),
    ('0805.50', 'Citrons', 'Fruits', 'Pays-Bas', 12.80, 21.00),
    ('0805.50', 'Citrons', 'Fruits', 'Chine', 25.00, 13.00),
    ('0805.50', 'Citrons', 'Fruits', 'Japon', 6.00, 10.00);

-- Mangues
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0804.50', 'Mangues', 'Fruits', 'France', 4.00, 20.00),
    ('0804.50', 'Mangues', 'Fruits', 'Maroc', 1.00, 20.00),
    ('0804.50', 'Mangues', 'Fruits', 'États-Unis', 0.00, 0.00),
    ('0804.50', 'Mangues', 'Fruits', 'Espagne', 4.00, 21.00),
    ('0804.50', 'Mangues', 'Fruits', 'Italie', 4.00, 22.00),
    ('0804.50', 'Mangues', 'Fruits', 'Allemagne', 4.00, 19.00),
    ('0804.50', 'Mangues', 'Fruits', 'Royaume-Uni', 3.20, 20.00),
    ('0804.50', 'Mangues', 'Fruits', 'Belgique', 4.00, 21.00),
    ('0804.50', 'Mangues', 'Fruits', 'Pays-Bas', 4.00, 21.00),
    ('0804.50', 'Mangues', 'Fruits', 'Chine', 15.00, 13.00),
    ('0804.50', 'Mangues', 'Fruits', 'Japon', 3.00, 10.00);

-- Ananas
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0804.30', 'Ananas', 'Fruits', 'France', 4.00, 20.00),
    ('0804.30', 'Ananas', 'Fruits', 'Maroc', 1.00, 20.00),
    ('0804.30', 'Ananas', 'Fruits', 'États-Unis', 0.00, 0.00),
    ('0804.30', 'Ananas', 'Fruits', 'Espagne', 4.00, 21.00),
    ('0804.30', 'Ananas', 'Fruits', 'Italie', 4.00, 22.00),
    ('0804.30', 'Ananas', 'Fruits', 'Allemagne', 4.00, 19.00),
    ('0804.30', 'Ananas', 'Fruits', 'Royaume-Uni', 3.20, 20.00),
    ('0804.30', 'Ananas', 'Fruits', 'Belgique', 4.00, 21.00),
    ('0804.30', 'Ananas', 'Fruits', 'Pays-Bas', 4.00, 21.00),
    ('0804.30', 'Ananas', 'Fruits', 'Chine', 15.00, 13.00),
    ('0804.30', 'Ananas', 'Fruits', 'Japon', 3.00, 10.00);

-- Fraises
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0810.10', 'Fraises', 'Fruits', 'France', 11.20, 20.00),
    ('0810.10', 'Fraises', 'Fruits', 'Maroc', 2.80, 20.00),
    ('0810.10', 'Fraises', 'Fruits', 'États-Unis', 0.00, 0.00),
    ('0810.10', 'Fraises', 'Fruits', 'Espagne', 11.20, 21.00),
    ('0810.10', 'Fraises', 'Fruits', 'Italie', 11.20, 22.00),
    ('0810.10', 'Fraises', 'Fruits', 'Allemagne', 11.20, 19.00),
    ('0810.10', 'Fraises', 'Fruits', 'Royaume-Uni', 8.80, 20.00),
    ('0810.10', 'Fraises', 'Fruits', 'Belgique', 11.20, 21.00),
    ('0810.10', 'Fraises', 'Fruits', 'Pays-Bas', 11.20, 21.00),
    ('0810.10', 'Fraises', 'Fruits', 'Chine', 30.00, 13.00),
    ('0810.10', 'Fraises', 'Fruits', 'Japon', 6.00, 10.00);

-- Framboises
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0810.20', 'Framboises', 'Fruits', 'France', 11.20, 20.00),
    ('0810.20', 'Framboises', 'Fruits', 'Maroc', 2.80, 20.00),
    ('0810.20', 'Framboises', 'Fruits', 'États-Unis', 0.00, 0.00),
    ('0810.20', 'Framboises', 'Fruits', 'Espagne', 11.20, 21.00),
    ('0810.20', 'Framboises', 'Fruits', 'Italie', 11.20, 22.00),
    ('0810.20', 'Framboises', 'Fruits', 'Allemagne', 11.20, 19.00),
    ('0810.20', 'Framboises', 'Fruits', 'Royaume-Uni', 8.80, 20.00),
    ('0810.20', 'Framboises', 'Fruits', 'Belgique', 11.20, 21.00),
    ('0810.20', 'Framboises', 'Fruits', 'Pays-Bas', 11.20, 21.00),
    ('0810.20', 'Framboises', 'Fruits', 'Chine', 30.00, 13.00),
    ('0810.20', 'Framboises', 'Fruits', 'Japon', 6.00, 10.00);

-- Myrtilles
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0810.40', 'Myrtilles', 'Fruits', 'France', 11.20, 20.00),
    ('0810.40', 'Myrtilles', 'Fruits', 'Maroc', 2.80, 20.00),
    ('0810.40', 'Myrtilles', 'Fruits', 'États-Unis', 0.00, 0.00),
    ('0810.40', 'Myrtilles', 'Fruits', 'Espagne', 11.20, 21.00),
    ('0810.40', 'Myrtilles', 'Fruits', 'Italie', 11.20, 22.00),
    ('0810.40', 'Myrtilles', 'Fruits', 'Allemagne', 11.20, 19.00),
    ('0810.40', 'Myrtilles', 'Fruits', 'Royaume-Uni', 8.80, 20.00),
    ('0810.40', 'Myrtilles', 'Fruits', 'Belgique', 11.20, 21.00),
    ('0810.40', 'Myrtilles', 'Fruits', 'Pays-Bas', 11.20, 21.00),
    ('0810.40', 'Myrtilles', 'Fruits', 'Chine', 30.00, 13.00),
    ('0810.40', 'Myrtilles', 'Fruits', 'Japon', 6.00, 10.00);

-- Raisins
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0806.10', 'Raisins', 'Fruits', 'France', 10.40, 20.00),
    ('0806.10', 'Raisins', 'Fruits', 'Maroc', 2.60, 20.00),
    ('0806.10', 'Raisins', 'Fruits', 'États-Unis', 0.00, 0.00),
    ('0806.10', 'Raisins', 'Fruits', 'Espagne', 10.40, 21.00),
    ('0806.10', 'Raisins', 'Fruits', 'Italie', 10.40, 22.00),
    ('0806.10', 'Raisins', 'Fruits', 'Allemagne', 10.40, 19.00),
    ('0806.10', 'Raisins', 'Fruits', 'Royaume-Uni', 8.20, 20.00),
    ('0806.10', 'Raisins', 'Fruits', 'Belgique', 10.40, 21.00),
    ('0806.10', 'Raisins', 'Fruits', 'Pays-Bas', 10.40, 21.00),
    ('0806.10', 'Raisins', 'Fruits', 'Chine', 13.00, 13.00),
    ('0806.10', 'Raisins', 'Fruits', 'Japon', 8.50, 10.00);

-- Pastèques
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0807.11', 'Pastèques', 'Fruits', 'France', 8.80, 20.00),
    ('0807.11', 'Pastèques', 'Fruits', 'Maroc', 2.20, 20.00),
    ('0807.11', 'Pastèques', 'Fruits', 'États-Unis', 0.00, 0.00),
    ('0807.11', 'Pastèques', 'Fruits', 'Espagne', 8.80, 21.00),
    ('0807.11', 'Pastèques', 'Fruits', 'Italie', 8.80, 22.00),
    ('0807.11', 'Pastèques', 'Fruits', 'Allemagne', 8.80, 19.00),
    ('0807.11', 'Pastèques', 'Fruits', 'Royaume-Uni', 6.90, 20.00),
    ('0807.11', 'Pastèques', 'Fruits', 'Belgique', 8.80, 21.00),
    ('0807.11', 'Pastèques', 'Fruits', 'Pays-Bas', 8.80, 21.00),
    ('0807.11', 'Pastèques', 'Fruits', 'Chine', 13.00, 13.00),
    ('0807.11', 'Pastèques', 'Fruits', 'Japon', 6.00, 10.00);

-- Melons
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0807.19', 'Melons', 'Fruits', 'France', 8.80, 20.00),
    ('0807.19', 'Melons', 'Fruits', 'Maroc', 2.20, 20.00),
    ('0807.19', 'Melons', 'Fruits', 'États-Unis', 0.00, 0.00),
    ('0807.19', 'Melons', 'Fruits', 'Espagne', 8.80, 21.00),
    ('0807.19', 'Melons', 'Fruits', 'Italie', 8.80, 22.00),
    ('0807.19', 'Melons', 'Fruits', 'Allemagne', 8.80, 19.00),
    ('0807.19', 'Melons', 'Fruits', 'Royaume-Uni', 6.90, 20.00),
    ('0807.19', 'Melons', 'Fruits', 'Belgique', 8.80, 21.00),
    ('0807.19', 'Melons', 'Fruits', 'Pays-Bas', 8.80, 21.00),
    ('0807.19', 'Melons', 'Fruits', 'Chine', 13.00, 13.00),
    ('0807.19', 'Melons', 'Fruits', 'Japon', 6.00, 10.00);

-- Pêches
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0809.30', 'Pêches', 'Fruits', 'France', 12.00, 20.00),
    ('0809.30', 'Pêches', 'Fruits', 'Maroc', 3.00, 20.00),
    ('0809.30', 'Pêches', 'Fruits', 'États-Unis', 0.00, 0.00),
    ('0809.30', 'Pêches', 'Fruits', 'Espagne', 12.00, 21.00),
    ('0809.30', 'Pêches', 'Fruits', 'Italie', 12.00, 22.00),
    ('0809.30', 'Pêches', 'Fruits', 'Allemagne', 12.00, 19.00),
    ('0809.30', 'Pêches', 'Fruits', 'Royaume-Uni', 9.40, 20.00),
    ('0809.30', 'Pêches', 'Fruits', 'Belgique', 12.00, 21.00),
    ('0809.30', 'Pêches', 'Fruits', 'Pays-Bas', 12.00, 21.00),
    ('0809.30', 'Pêches', 'Fruits', 'Chine', 10.00, 13.00),
    ('0809.30', 'Pêches', 'Fruits', 'Japon', 6.00, 10.00);

-- Abricots
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0809.10', 'Abricots', 'Fruits', 'France', 12.00, 20.00),
    ('0809.10', 'Abricots', 'Fruits', 'Maroc', 3.00, 20.00),
    ('0809.10', 'Abricots', 'Fruits', 'États-Unis', 0.00, 0.00),
    ('0809.10', 'Abricots', 'Fruits', 'Espagne', 12.00, 21.00),
    ('0809.10', 'Abricots', 'Fruits', 'Italie', 12.00, 22.00),
    ('0809.10', 'Abricots', 'Fruits', 'Allemagne', 12.00, 19.00),
    ('0809.10', 'Abricots', 'Fruits', 'Royaume-Uni', 9.40, 20.00),
    ('0809.10', 'Abricots', 'Fruits', 'Belgique', 12.00, 21.00),
    ('0809.10', 'Abricots', 'Fruits', 'Pays-Bas', 12.00, 21.00),
    ('0809.10', 'Abricots', 'Fruits', 'Chine', 10.00, 13.00),
    ('0809.10', 'Abricots', 'Fruits', 'Japon', 6.00, 10.00);

-- Kiwis
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0810.50', 'Kiwis', 'Fruits', 'France', 8.80, 20.00),
    ('0810.50', 'Kiwis', 'Fruits', 'Maroc', 2.20, 20.00),
    ('0810.50', 'Kiwis', 'Fruits', 'États-Unis', 0.00, 0.00),
    ('0810.50', 'Kiwis', 'Fruits', 'Espagne', 8.80, 21.00),
    ('0810.50', 'Kiwis', 'Fruits', 'Italie', 8.80, 22.00),
    ('0810.50', 'Kiwis', 'Fruits', 'Allemagne', 8.80, 19.00),
    ('0810.50', 'Kiwis', 'Fruits', 'Royaume-Uni', 6.90, 20.00),
    ('0810.50', 'Kiwis', 'Fruits', 'Belgique', 8.80, 21.00),
    ('0810.50', 'Kiwis', 'Fruits', 'Pays-Bas', 8.80, 21.00),
    ('0810.50', 'Kiwis', 'Fruits', 'Chine', 10.00, 13.00),
    ('0810.50', 'Kiwis', 'Fruits', 'Japon', 6.00, 10.00);

-- Avocats
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0804.40', 'Avocats', 'Fruits', 'France', 4.00, 20.00),
    ('0804.40', 'Avocats', 'Fruits', 'Maroc', 1.00, 20.00),
    ('0804.40', 'Avocats', 'Fruits', 'États-Unis', 0.00, 0.00),
    ('0804.40', 'Avocats', 'Fruits', 'Espagne', 4.00, 21.00),
    ('0804.40', 'Avocats', 'Fruits', 'Italie', 4.00, 22.00),
    ('0804.40', 'Avocats', 'Fruits', 'Allemagne', 4.00, 19.00),
    ('0804.40', 'Avocats', 'Fruits', 'Royaume-Uni', 3.20, 20.00),
    ('0804.40', 'Avocats', 'Fruits', 'Belgique', 4.00, 21.00),
    ('0804.40', 'Avocats', 'Fruits', 'Pays-Bas', 4.00, 21.00),
    ('0804.40', 'Avocats', 'Fruits', 'Chine', 7.00, 13.00),
    ('0804.40', 'Avocats', 'Fruits', 'Japon', 3.00, 10.00);

-- Grenades
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0810.90', 'Grenades', 'Fruits', 'France', 11.20, 20.00),
    ('0810.90', 'Grenades', 'Fruits', 'Maroc', 2.80, 20.00),
    ('0810.90', 'Grenades', 'Fruits', 'États-Unis', 0.00, 0.00),
    ('0810.90', 'Grenades', 'Fruits', 'Espagne', 11.20, 21.00),
    ('0810.90', 'Grenades', 'Fruits', 'Italie', 11.20, 22.00),
    ('0810.90', 'Grenades', 'Fruits', 'Allemagne', 11.20, 19.00),
    ('0810.90', 'Grenades', 'Fruits', 'Royaume-Uni', 8.80, 20.00),
    ('0810.90', 'Grenades', 'Fruits', 'Belgique', 11.20, 21.00),
    ('0810.90', 'Grenades', 'Fruits', 'Pays-Bas', 11.20, 21.00),
    ('0810.90', 'Grenades', 'Fruits', 'Chine', 10.00, 13.00),
    ('0810.90', 'Grenades', 'Fruits', 'Japon', 6.00, 10.00);

-- Figues
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0804.20', 'Figues', 'Fruits', 'France', 4.00, 20.00),
    ('0804.20', 'Figues', 'Fruits', 'Maroc', 1.00, 20.00),
    ('0804.20', 'Figues', 'Fruits', 'États-Unis', 0.00, 0.00),
    ('0804.20', 'Figues', 'Fruits', 'Espagne', 4.00, 21.00),
    ('0804.20', 'Figues', 'Fruits', 'Italie', 4.00, 22.00),
    ('0804.20', 'Figues', 'Fruits', 'Allemagne', 4.00, 19.00),
    ('0804.20', 'Figues', 'Fruits', 'Royaume-Uni', 3.20, 20.00),
    ('0804.20', 'Figues', 'Fruits', 'Belgique', 4.00, 21.00),
    ('0804.20', 'Figues', 'Fruits', 'Pays-Bas', 4.00, 21.00),
    ('0804.20', 'Figues', 'Fruits', 'Chine', 10.00, 13.00),
    ('0804.20', 'Figues', 'Fruits', 'Japon', 6.00, 10.00);

-- Papayes
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva) VALUES 
    ('0807.20', 'Papayes', 'Fruits', 'France', 0.00, 20.00),
    ('0807.20', 'Papayes', 'Fruits', 'Maroc', 0.00, 20.00),
    ('0807.20', 'Papayes', 'Fruits', 'États-Unis', 0.00, 0.00),
    ('0807.20', 'Papayes', 'Fruits', 'Espagne', 0.00, 21.00),
    ('0807.20', 'Papayes', 'Fruits', 'Italie', 0.00, 22.00),
    ('0807.20', 'Papayes', 'Fruits', 'Allemagne', 0.00, 19.00),
    ('0807.20', 'Papayes', 'Fruits', 'Royaume-Uni', 0.00, 20.00),
    ('0807.20', 'Papayes', 'Fruits', 'Belgique', 0.00, 21.00),
    ('0807.20', 'Papayes', 'Fruits', 'Pays-Bas', 0.00, 21.00),
    ('0807.20', 'Papayes', 'Fruits', 'Chine', 15.00, 13.00),
    ('0807.20', 'Papayes', 'Fruits', 'Japon', 5.00, 10.00);
