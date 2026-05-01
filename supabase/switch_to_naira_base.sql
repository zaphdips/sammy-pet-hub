-- Switch Database Base Currency from GBP to NGN
-- Run this in your Supabase SQL Editor

-- 1. Rename the old NGN rate row to GBP rate
UPDATE site_settings 
SET key = 'currency_gbp_rate', 
    value = '0.00069', 
    description = 'GBP exchange rate relative to NGN. e.g. 0.00069 means ₦1 = £0.00069.' 
WHERE key = 'currency_ngn_rate';

-- 2. Update USD to be relative to NGN
UPDATE site_settings 
SET value = '0.00086', 
    description = 'USD exchange rate relative to NGN. e.g. 0.00086 means ₦1 = $0.00086.' 
WHERE key = 'currency_usd_rate';

-- 3. Update EUR to be relative to NGN
UPDATE site_settings 
SET value = '0.00081', 
    description = 'EUR exchange rate relative to NGN. e.g. 0.00081 means ₦1 = €0.00081.' 
WHERE key = 'currency_eur_rate';

-- 4. Just in case the GBP rate was accidentally deleted, ensure it exists
INSERT INTO site_settings (key, value, description)
VALUES ('currency_gbp_rate', '0.00069', 'GBP exchange rate relative to NGN.')
ON CONFLICT (key) DO NOTHING;
