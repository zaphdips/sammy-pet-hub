-- Add stock management columns to products table
-- Run this in Supabase SQL Editor

ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS stock_count INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_sold_out BOOLEAN DEFAULT FALSE;
