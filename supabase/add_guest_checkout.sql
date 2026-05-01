-- Add guest checkout columns to orders table
-- Run this in Supabase SQL Editor to support guest purchases

ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS guest_email TEXT,
  ADD COLUMN IF NOT EXISTS guest_name TEXT,
  ADD COLUMN IF NOT EXISTS guest_phone TEXT;

-- Allow orders without user_id (for guests)
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policy to allow guest inserts
CREATE POLICY "Allow guest checkout inserts"
  ON orders FOR INSERT
  WITH CHECK (true);
