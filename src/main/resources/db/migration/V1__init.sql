-- Create product_categories table
CREATE TABLE product_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Create countries table
CREATE TABLE countries (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    iso_code VARCHAR(3) NOT NULL UNIQUE,
    region VARCHAR(100) NOT NULL
);

-- Create tariff_rules table
CREATE TABLE tariff_rules (
    id BIGSERIAL PRIMARY KEY,
    code_hs VARCHAR(50) NOT NULL,
    category_id BIGINT NOT NULL,
    country_id BIGINT NOT NULL,
    customs_duty_rate NUMERIC(5, 2) NOT NULL,
    vat_rate NUMERIC(5, 2) NOT NULL,
    CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES product_categories(id),
    CONSTRAINT fk_country FOREIGN KEY (country_id) REFERENCES countries(id),
    CONSTRAINT uk_code_hs_country UNIQUE (code_hs, country_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_tariff_code_hs ON tariff_rules(code_hs);
CREATE INDEX idx_tariff_country_id ON tariff_rules(country_id);
CREATE INDEX idx_country_iso_code ON countries(iso_code);

-- Insert sample product categories
INSERT INTO product_categories (name) VALUES 
    ('Agroalimentaire'),
    ('Textile');

-- Insert sample countries
INSERT INTO countries (name, iso_code, region) VALUES 
    ('France', 'FR', 'EU'),
    ('United States', 'US', 'USA'),
    ('Morocco', 'MA', 'AFRICA');

-- Insert sample tariff rules
-- HS Code 0901.21 = Café torréfié (Roasted coffee)
INSERT INTO tariff_rules (code_hs, category_id, country_id, customs_duty_rate, vat_rate) VALUES 
    ('0901.21', 1, 1, 7.50, 20.00),  -- France: 7.5% customs, 20% VAT
    ('0901.21', 1, 2, 0.00, 0.00),   -- USA: 0% customs, 0% VAT
    ('6204.42', 2, 3, 2.50, 20.00);  -- Morocco, Textile: 2.5% customs, 20% VAT
