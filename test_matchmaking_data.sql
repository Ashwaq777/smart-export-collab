-- INSERT DATA FOR MATCHMAKING DEBUG TEST
-- Clean up any existing test data first
DELETE FROM cont_match WHERE offer_id IN (SELECT id FROM cont_offer WHERE location LIKE '%TEST%');
DELETE FROM cont_request WHERE loading_location LIKE '%TEST%';
DELETE FROM cont_offer WHERE location LIKE '%TEST%';

-- Insert test OFFRE (provider will be user ID 2 - import@smartexport.com)
INSERT INTO cont_offer (
    provider_id, 
    container_type, 
    cargo_type, 
    location, 
    latitude, 
    longitude, 
    available_date, 
    status,
    description,
    created_at,
    updated_at
) VALUES (
    2,  -- import@smartexport.com (IMPORTATEUR)
    'HC40', 
    'DRY', 
    'Tanger TEST', 
    35.7595,  -- Tanger coordinates
    -5.8340,
    '2026-06-12', 
    'AVAILABLE',
    'Container test pour debugging matchmaking',
    NOW(),
    NOW()
);

-- Insert test DEMANDE (seeker will be user ID 3 - export@smartexport.com)
INSERT INTO cont_request (
    seeker_id,
    container_type,
    cargo_type, 
    loading_location,
    loading_latitude,
    loading_longitude,
    required_date,
    status,
    created_at,
    updated_at
) VALUES (
    3,  -- export@smartexport.com (EXPORTATEUR)
    'HC40',
    'DRY',
    'Agadir TEST',
    30.4278,  -- Agadir coordinates
    -9.5981,
    '2026-06-14',
    'SEARCHING',
    NOW(),
    NOW()
);

-- Verify the data was inserted
SELECT 'OFFRES' as table_name, id, provider_id, container_type, cargo_type, location, latitude, longitude, available_date, status FROM cont_offer WHERE location LIKE '%TEST%'
UNION ALL
SELECT 'DEMANDES', id, seeker_id, container_type, cargo_type, loading_location, loading_latitude, loading_longitude, required_date, status FROM cont_request WHERE loading_location LIKE '%TEST%';

-- Get the IDs for testing
SELECT 'OFFER_ID' as info, id FROM cont_offer WHERE location LIKE '%TEST%' LIMIT 1
UNION ALL  
SELECT 'REQUEST_ID', id FROM cont_request WHERE loading_location LIKE '%TEST%' LIMIT 1;
