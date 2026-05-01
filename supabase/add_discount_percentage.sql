-- Add discount_percentage to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC(5,2);
