-- ============================================================
-- Fix Admin RLS Policies for CRUD operations
-- Run this in your Supabase SQL Editor to allow admins to Update/Delete
-- ============================================================

-- Function to safely create 'FOR ALL' policies for admins
CREATE OR REPLACE FUNCTION grant_admin_full_access(table_name text) RETURNS void AS $$
BEGIN
  EXECUTE format('
    DROP POLICY IF EXISTS "Admins have full access to %1$s" ON %1$s;
    CREATE POLICY "Admins have full access to %1$s"
      ON %1$s
      FOR ALL
      USING (
        auth.jwt() ->> ''role'' = ''admin'' OR 
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = ''admin'')
      )
      WITH CHECK (
        auth.jwt() ->> ''role'' = ''admin'' OR 
        EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = ''admin'')
      );
  ', table_name);
END;
$$ LANGUAGE plpgsql;

-- Apply to all Admin-managed tables
SELECT grant_admin_full_access('pets');
SELECT grant_admin_full_access('products');
SELECT grant_admin_full_access('promotions');
SELECT grant_admin_full_access('filter_options');
SELECT grant_admin_full_access('content_blocks');

-- Ensure RLS is enabled on these tables
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE filter_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;

-- If you have public read access policies, ensure they still exist:
-- (Uncomment and run if public users suddenly can't see products/pets)
-- CREATE POLICY "Public read access to products" ON products FOR SELECT USING (true);
-- CREATE POLICY "Public read access to pets" ON pets FOR SELECT USING (true);
-- CREATE POLICY "Public read access to promotions" ON promotions FOR SELECT USING (true);
-- CREATE POLICY "Public read access to filter_options" ON filter_options FOR SELECT USING (true);
-- CREATE POLICY "Public read access to content_blocks" ON content_blocks FOR SELECT USING (true);
