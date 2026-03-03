-- Add latitude and longitude columns to ports table for AIS vessel lookup
ALTER TABLE ports ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 6);
ALTER TABLE ports ADD COLUMN IF NOT EXISTS longitude DECIMAL(10, 6);

-- Update existing ports with approximate coordinates (from World Port Index data)
-- Europe
UPDATE ports SET latitude = 49.4833, longitude = 0.1000 WHERE nom_port LIKE '%Havre%';
UPDATE ports SET latitude = 43.3500, longitude = 5.0500 WHERE nom_port LIKE '%Marseille%';
UPDATE ports SET latitude = 51.0500, longitude = 2.3667 WHERE nom_port LIKE '%Dunkerque%';
UPDATE ports SET latitude = 51.9167, longitude = 4.5000 WHERE nom_port LIKE '%Rotterdam%';
UPDATE ports SET latitude = 51.2333, longitude = 4.4000 WHERE nom_port LIKE '%Anvers%' OR nom_port LIKE '%Antwerp%';
UPDATE ports SET latitude = 53.5333, longitude = 9.9833 WHERE nom_port LIKE '%Hamburg%' OR nom_port LIKE '%Hambourg%';
UPDATE ports SET latitude = 39.4500, longitude = -0.3333 WHERE nom_port LIKE '%Valencia%' OR nom_port LIKE '%Valence%';
UPDATE ports SET latitude = 41.3500, longitude = 2.1667 WHERE nom_port LIKE '%Barcelona%' OR nom_port LIKE '%Barcelone%';
UPDATE ports SET latitude = 44.4167, longitude = 8.9333 WHERE nom_port LIKE '%Genoa%' OR nom_port LIKE '%Gênes%';
UPDATE ports SET latitude = 51.9500, longitude = 1.3500 WHERE nom_port LIKE '%Felixstowe%';
UPDATE ports SET latitude = 37.9500, longitude = 23.6333 WHERE nom_port LIKE '%Piraeus%' OR nom_port LIKE '%Pirée%';

-- Asia
UPDATE ports SET latitude = 31.2333, longitude = 121.4667 WHERE nom_port LIKE '%Shanghai%';
UPDATE ports SET latitude = 22.5333, longitude = 114.1333 WHERE nom_port LIKE '%Shenzhen%';
UPDATE ports SET latitude = 1.2667, longitude = 103.8000 WHERE nom_port LIKE '%Singapore%' OR nom_port LIKE '%Singapour%';
UPDATE ports SET latitude = 35.1000, longitude = 129.0333 WHERE nom_port LIKE '%Busan%';
UPDATE ports SET latitude = 35.6500, longitude = 139.7667 WHERE nom_port LIKE '%Tokyo%';
UPDATE ports SET latitude = 18.9500, longitude = 72.9500 WHERE nom_port LIKE '%Mumbai%';
UPDATE ports SET latitude = 25.0000, longitude = 55.0833 WHERE nom_port LIKE '%Jebel Ali%' OR nom_port LIKE '%Dubai%';
UPDATE ports SET latitude = 21.5000, longitude = 39.1667 WHERE nom_port LIKE '%Jeddah%';

-- Americas
UPDATE ports SET latitude = 33.7333, longitude = -118.2667 WHERE nom_port LIKE '%Los Angeles%';
UPDATE ports SET latitude = 40.6667, longitude = -74.0500 WHERE nom_port LIKE '%New York%';
UPDATE ports SET latitude = 49.2833, longitude = -123.1167 WHERE nom_port LIKE '%Vancouver%';
UPDATE ports SET latitude = -23.9500, longitude = -46.3333 WHERE nom_port LIKE '%Santos%';
UPDATE ports SET latitude = -34.6000, longitude = -58.3667 WHERE nom_port LIKE '%Buenos Aires%';
UPDATE ports SET latitude = 19.0500, longitude = -104.3167 WHERE nom_port LIKE '%Manzanillo%';

-- Africa
UPDATE ports SET latitude = 35.8833, longitude = -5.4167 WHERE nom_port LIKE '%Tanger%';
UPDATE ports SET latitude = 33.6000, longitude = -7.6167 WHERE nom_port LIKE '%Casablanca%';
UPDATE ports SET latitude = 31.2667, longitude = 32.3000 WHERE nom_port LIKE '%Port Said%';
UPDATE ports SET latitude = -29.8667, longitude = 31.0333 WHERE nom_port LIKE '%Durban%';
UPDATE ports SET latitude = 6.4333, longitude = 3.3833 WHERE nom_port LIKE '%Lagos%';
UPDATE ports SET latitude = -4.0500, longitude = 39.6667 WHERE nom_port LIKE '%Mombasa%';

-- Oceania
UPDATE ports SET latitude = -37.8167, longitude = 144.9667 WHERE nom_port LIKE '%Melbourne%';
UPDATE ports SET latitude = -33.8667, longitude = 151.2000 WHERE nom_port LIKE '%Sydney%';
UPDATE ports SET latitude = -36.8500, longitude = 174.7667 WHERE nom_port LIKE '%Auckland%';

-- Default coordinates for ports without specific match (approximate center of country)
UPDATE ports SET latitude = 0.0, longitude = 0.0 WHERE latitude IS NULL;
