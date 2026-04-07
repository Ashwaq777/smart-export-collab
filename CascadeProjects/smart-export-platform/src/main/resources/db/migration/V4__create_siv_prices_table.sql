-- Create SIV (Système d'Importation de Valeurs) prices table
-- Used for EPS (Entry Price System) threshold alerts

CREATE TABLE siv_prices (
    id BIGSERIAL PRIMARY KEY,
    code_hs VARCHAR(10) NOT NULL,
    categorie VARCHAR(100) NOT NULL,
    country_region VARCHAR(50) NOT NULL,
    min_entry_price NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX idx_siv_code_hs ON siv_prices(code_hs);
CREATE INDEX idx_siv_region ON siv_prices(country_region);

-- Insert realistic SIV threshold prices for EU market (Fruits & Légumes)
-- Source: Based on EU Entry Price System regulations

-- Tomates (Tomatoes)
INSERT INTO siv_prices (code_hs, categorie, country_region, min_entry_price, currency) VALUES 
    ('0702.00', 'Légumes', 'EU', 100.00, 'EUR'),
    ('070200', 'Légumes', 'EU', 100.00, 'EUR');

-- Oranges
INSERT INTO siv_prices (code_hs, categorie, country_region, min_entry_price, currency) VALUES 
    ('0805.10', 'Fruits', 'EU', 120.00, 'EUR'),
    ('080510', 'Fruits', 'EU', 120.00, 'EUR');

-- Pommes de terre (Potatoes)
INSERT INTO siv_prices (code_hs, categorie, country_region, min_entry_price, currency) VALUES 
    ('0701.90', 'Légumes', 'EU', 90.00, 'EUR'),
    ('070190', 'Légumes', 'EU', 90.00, 'EUR');

-- Bananes (Bananas)
INSERT INTO siv_prices (code_hs, categorie, country_region, min_entry_price, currency) VALUES 
    ('0803.90', 'Fruits', 'EU', 150.00, 'EUR'),
    ('080390', 'Fruits', 'EU', 150.00, 'EUR');

-- Carottes (Carrots)
INSERT INTO siv_prices (code_hs, categorie, country_region, min_entry_price, currency) VALUES 
    ('0706.10', 'Légumes', 'EU', 85.00, 'EUR'),
    ('070610', 'Légumes', 'EU', 85.00, 'EUR');

-- Concombres (Cucumbers)
INSERT INTO siv_prices (code_hs, categorie, country_region, min_entry_price, currency) VALUES 
    ('0707.00', 'Légumes', 'EU', 95.00, 'EUR'),
    ('070700', 'Légumes', 'EU', 95.00, 'EUR');

-- Courgettes (Zucchini)
INSERT INTO siv_prices (code_hs, categorie, country_region, min_entry_price, currency) VALUES 
    ('0709.90', 'Légumes', 'EU', 110.00, 'EUR'),
    ('070990', 'Légumes', 'EU', 110.00, 'EUR');

-- Citrons (Lemons)
INSERT INTO siv_prices (code_hs, categorie, country_region, min_entry_price, currency) VALUES 
    ('0805.50', 'Fruits', 'EU', 130.00, 'EUR'),
    ('080550', 'Fruits', 'EU', 130.00, 'EUR');
