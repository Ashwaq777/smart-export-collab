-- Create ports table
CREATE TABLE ports (
    id BIGSERIAL PRIMARY KEY,
    nom_port VARCHAR(255) NOT NULL,
    pays VARCHAR(255) NOT NULL,
    type_port VARCHAR(50) NOT NULL CHECK (type_port IN ('Maritime', 'Aérien')),
    frais_portuaires NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for ports
CREATE INDEX idx_ports_pays ON ports(pays);
CREATE INDEX idx_ports_type ON ports(type_port);

-- Insert European ports
INSERT INTO ports (nom_port, pays, type_port, frais_portuaires) VALUES 
    ('Rotterdam', 'Pays-Bas', 'Maritime', 450.00),
    ('Hambourg', 'Allemagne', 'Maritime', 420.00),
    ('Anvers', 'Belgique', 'Maritime', 400.00),
    ('Marseille', 'France', 'Maritime', 380.00);

-- Insert USA ports
INSERT INTO ports (nom_port, pays, type_port, frais_portuaires) VALUES 
    ('New York', 'USA', 'Maritime', 550.00),
    ('Los Angeles', 'USA', 'Maritime', 520.00),
    ('Miami', 'USA', 'Maritime', 500.00),
    ('Houston', 'USA', 'Maritime', 480.00);

-- Add USA tariffs for existing products
INSERT INTO tarifs_douaniers (code_hs, nom_produit, categorie, pays_destination, taux_douane, taux_tva, taxe_parafiscale) VALUES 
    ('0702.00', 'Tomates', 'Légumes', 'USA', 2.80, 0.00, 0.00),
    ('0805.10', 'Oranges', 'Fruits', 'USA', 1.90, 0.00, 0.00),
    ('0701.90', 'Pommes de terre', 'Légumes', 'USA', 0.50, 0.00, 0.00),
    ('0803.90', 'Bananes', 'Fruits', 'USA', 0.00, 0.00, 0.00),
    ('0706.10', 'Carottes', 'Légumes', 'USA', 1.20, 0.00, 0.00);
