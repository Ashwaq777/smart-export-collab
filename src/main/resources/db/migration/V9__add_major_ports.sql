-- Add major ports for all countries with their port fees
-- Port fees are in the local currency or USD equivalent

-- FRANCE - Ports
INSERT INTO ports (nom_port, pays, type_port, frais_portuaires) VALUES
    ('Le Havre', 'France', 'Maritime', 450.00),
    ('Marseille-Fos', 'France', 'Maritime', 420.00),
    ('Dunkerque', 'France', 'Maritime', 380.00),
    ('Nantes-Saint-Nazaire', 'France', 'Maritime', 400.00),
    ('Bordeaux', 'France', 'Maritime', 390.00);

-- MAROC - Ports
INSERT INTO ports (nom_port, pays, type_port, frais_portuaires) VALUES
    ('Casablanca', 'Maroc', 'Maritime', 350.00),
    ('Tanger Med', 'Maroc', 'Maritime', 380.00),
    ('Agadir', 'Maroc', 'Maritime', 320.00),
    ('Mohammedia', 'Maroc', 'Maritime', 340.00),
    ('Jorf Lasfar', 'Maroc', 'Maritime', 330.00);

-- ÉTATS-UNIS - Ports
INSERT INTO ports (nom_port, pays, type_port, frais_portuaires) VALUES
    ('Los Angeles', 'États-Unis', 'Maritime', 550.00),
    ('Long Beach', 'États-Unis', 'Maritime', 540.00),
    ('New York/New Jersey', 'États-Unis', 'Maritime', 580.00),
    ('Savannah', 'États-Unis', 'Maritime', 520.00),
    ('Houston', 'États-Unis', 'Maritime', 530.00),
    ('Seattle', 'États-Unis', 'Maritime', 510.00);

-- ESPAGNE - Ports
INSERT INTO ports (nom_port, pays, type_port, frais_portuaires) VALUES
    ('Barcelone', 'Espagne', 'Maritime', 420.00),
    ('Valence', 'Espagne', 'Maritime', 400.00),
    ('Algésiras', 'Espagne', 'Maritime', 390.00),
    ('Bilbao', 'Espagne', 'Maritime', 410.00),
    ('Las Palmas', 'Espagne', 'Maritime', 380.00);

-- ITALIE - Ports
INSERT INTO ports (nom_port, pays, type_port, frais_portuaires) VALUES
    ('Gênes', 'Italie', 'Maritime', 460.00),
    ('Trieste', 'Italie', 'Maritime', 440.00),
    ('Naples', 'Italie', 'Maritime', 430.00),
    ('Livourne', 'Italie', 'Maritime', 420.00),
    ('Venise', 'Italie', 'Maritime', 450.00);

-- ALLEMAGNE - Ports
INSERT INTO ports (nom_port, pays, type_port, frais_portuaires) VALUES
    ('Hambourg', 'Allemagne', 'Maritime', 480.00),
    ('Bremerhaven', 'Allemagne', 'Maritime', 470.00),
    ('Wilhelmshaven', 'Allemagne', 'Maritime', 450.00),
    ('Rostock', 'Allemagne', 'Maritime', 440.00);

-- ROYAUME-UNI - Ports
INSERT INTO ports (nom_port, pays, type_port, frais_portuaires) VALUES
    ('Felixstowe', 'Royaume-Uni', 'Maritime', 490.00),
    ('Southampton', 'Royaume-Uni', 'Maritime', 480.00),
    ('Londres Gateway', 'Royaume-Uni', 'Maritime', 500.00),
    ('Liverpool', 'Royaume-Uni', 'Maritime', 470.00),
    ('Bristol', 'Royaume-Uni', 'Maritime', 460.00);

-- BELGIQUE - Ports
INSERT INTO ports (nom_port, pays, type_port, frais_portuaires) VALUES
    ('Anvers', 'Belgique', 'Maritime', 470.00),
    ('Zeebrugge', 'Belgique', 'Maritime', 450.00),
    ('Gand', 'Belgique', 'Maritime', 440.00),
    ('Ostende', 'Belgique', 'Maritime', 430.00);

-- PAYS-BAS - Ports
INSERT INTO ports (nom_port, pays, type_port, frais_portuaires) VALUES
    ('Rotterdam', 'Pays-Bas', 'Maritime', 490.00),
    ('Amsterdam', 'Pays-Bas', 'Maritime', 480.00),
    ('Vlissingen', 'Pays-Bas', 'Maritime', 460.00),
    ('Groningue', 'Pays-Bas', 'Maritime', 450.00);

-- CHINE - Ports
INSERT INTO ports (nom_port, pays, type_port, frais_portuaires) VALUES
    ('Shanghai', 'Chine', 'Maritime', 380.00),
    ('Shenzhen', 'Chine', 'Maritime', 370.00),
    ('Ningbo-Zhoushan', 'Chine', 'Maritime', 360.00),
    ('Guangzhou', 'Chine', 'Maritime', 350.00),
    ('Qingdao', 'Chine', 'Maritime', 340.00),
    ('Tianjin', 'Chine', 'Maritime', 360.00),
    ('Hong Kong', 'Chine', 'Maritime', 400.00);

-- JAPON - Ports
INSERT INTO ports (nom_port, pays, type_port, frais_portuaires) VALUES
    ('Tokyo', 'Japon', 'Maritime', 520.00),
    ('Yokohama', 'Japon', 'Maritime', 510.00),
    ('Osaka', 'Japon', 'Maritime', 500.00),
    ('Kobe', 'Japon', 'Maritime', 490.00),
    ('Nagoya', 'Japon', 'Maritime', 480.00),
    ('Fukuoka', 'Japon', 'Maritime', 470.00);
