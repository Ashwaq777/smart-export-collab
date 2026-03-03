-- Normalize HS codes in tarifs_douaniers table (remove dots and spaces)
UPDATE tarifs_douaniers 
SET code_hs = REPLACE(REPLACE(code_hs, '.', ''), ' ', '');

-- Normalize HS codes in siv_prices table (already normalized but ensure consistency)
UPDATE siv_prices 
SET code_hs = REPLACE(REPLACE(code_hs, '.', ''), ' ', '');
