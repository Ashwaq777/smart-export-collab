CREATE TABLE carbon_factors (
    id SERIAL PRIMARY KEY,
    transport_mode VARCHAR(20),
    emission_factor DECIMAL(10,6),
    source VARCHAR(50)
);

INSERT INTO carbon_factors (transport_mode, emission_factor, source) VALUES
    ('maritime', 0.025, 'GLEC'),
    ('road', 0.062, 'IPCC'),
    ('air', 0.850, 'ICAO'),
    ('rail', 0.010, 'UIC');
