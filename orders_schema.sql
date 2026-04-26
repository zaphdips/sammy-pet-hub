-- ============================================================
-- Orders Table Migration — Sammy Pet Hub
-- ============================================================
-- Safe to run multiple times. Uses IF NOT EXISTS and DO blocks
-- so existing tables/columns/policies are skipped automatically.
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================


-- 1. Create table only if it doesn't exist yet
CREATE TABLE IF NOT EXISTS orders (
    id               UUID          DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id          UUID          REFERENCES auth.users(id) ON DELETE CASCADE,
    item_name        TEXT          NOT NULL,
    item_category    TEXT          NOT NULL,
    price            DECIMAL(10,2) NOT NULL,
    status           TEXT          DEFAULT 'pending',
    tracking_number  TEXT          UNIQUE,
    transaction_ref  TEXT,
    paid_at          TIMESTAMPTZ,
    created_at       TIMESTAMPTZ   DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);


-- 2. Add new columns only if they don't already exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS transaction_ref  TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at          TIMESTAMPTZ;

-- Fix status default to lowercase 'pending' (safe to run repeatedly)
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pending';


-- 3. Enable RLS (idempotent — safe to run again)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;


-- 4. Policies — drop & recreate so fixes always apply cleanly
--    (DROP POLICY IF EXISTS prevents errors on first run)

DROP POLICY IF EXISTS "Users can view their own orders"   ON orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage all orders"      ON orders;

-- Users can only read their own orders
CREATE POLICY "Users can view their own orders"
    ON orders FOR SELECT
    USING (auth.uid() = user_id);

-- Users can create their own orders (checkout)
CREATE POLICY "Users can insert their own orders"
    ON orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins can do everything
-- FIXED: was `is_admin = true` (boolean) — profiles uses `role = 'admin'` (text)
CREATE POLICY "Admins can manage all orders"
    ON orders FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
              AND profiles.role = 'admin'
        )
    );


-- 5. Indexes — IF NOT EXISTS so re-runs are safe
CREATE INDEX IF NOT EXISTS orders_user_id_idx        ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_tracking_number_idx ON orders(tracking_number);
