-- ============================================================
-- Pet Corner — Dashboard Categories
-- Run this in your Supabase SQL Editor.
-- ============================================================

CREATE TABLE IF NOT EXISTS dashboard_categories (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT        NOT NULL,
  link        TEXT        NOT NULL,
  sort_order  INT         NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dashboard_category_items (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID        REFERENCES dashboard_categories(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  icon_name   TEXT        NOT NULL,  -- e.g. 'Bone', 'Sparkles', 'Pill'
  color       TEXT        NOT NULL,  -- Background color hex
  icon_color  TEXT        NOT NULL,  -- Icon color hex
  slug        TEXT        NOT NULL,  -- Link slug
  sort_order  INT         NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed Initial Categories to match the old hardcoded ones
DO $$
DECLARE
  food_id UUID;
  toys_id UUID;
  health_id UUID;
  grooming_id UUID;
BEGIN
  -- Insert Food & Treats
  INSERT INTO dashboard_categories (title, link, sort_order) VALUES ('Pet Food & Treats', '/shop?category=food', 1) RETURNING id INTO food_id;
  INSERT INTO dashboard_category_items (category_id, name, icon_name, color, icon_color, slug, sort_order) VALUES
    (food_id, 'Dry Food', 'Bone', '#FFF3E0', '#E65100', 'food', 1),
    (food_id, 'Wet Food', 'Bone', '#FFF8E1', '#FF8F00', 'food', 2),
    (food_id, 'Treats', 'Sparkles', '#F1F8E9', '#558B2F', 'food', 3),
    (food_id, 'Supplements', 'Pill', '#E8F5E9', '#2E7D32', 'medication', 4);

  -- Insert Toys & Play
  INSERT INTO dashboard_categories (title, link, sort_order) VALUES ('Toys & Play', '/shop?category=toy', 2) RETURNING id INTO toys_id;
  INSERT INTO dashboard_category_items (category_id, name, icon_name, color, icon_color, slug, sort_order) VALUES
    (toys_id, 'Chew Toys', 'Dog', '#E8F5E9', '#2E7D32', 'toy', 1),
    (toys_id, 'Interactive', 'Sparkles', '#E3F2FD', '#1565C0', 'toy', 2),
    (toys_id, 'Outdoor', 'Heart', '#FFF3E0', '#E65100', 'toy', 3),
    (toys_id, 'Plush', 'Heart', '#FCE4EC', '#AD1457', 'toy', 4);

  -- Insert Health & Medication
  INSERT INTO dashboard_categories (title, link, sort_order) VALUES ('Health & Medication', '/shop?category=medication', 3) RETURNING id INTO health_id;
  INSERT INTO dashboard_category_items (category_id, name, icon_name, color, icon_color, slug, sort_order) VALUES
    (health_id, 'Vitamins', 'Pill', '#E3F2FD', '#1565C0', 'medication', 1),
    (health_id, 'Flea & Tick', 'Stethoscope', '#E8F5E9', '#2E7D32', 'medication', 2),
    (health_id, 'Dental Care', 'Sparkles', '#FFF3E0', '#E65100', 'medication', 3),
    (health_id, 'First Aid', 'Heart', '#FCE4EC', '#AD1457', 'medication', 4);

  -- Insert Grooming & Care
  INSERT INTO dashboard_categories (title, link, sort_order) VALUES ('Grooming & Care', '/shop?category=grooming', 4) RETURNING id INTO grooming_id;
  INSERT INTO dashboard_category_items (category_id, name, icon_name, color, icon_color, slug, sort_order) VALUES
    (grooming_id, 'Shampoo', 'Scissors', '#FCE4EC', '#AD1457', 'grooming', 1),
    (grooming_id, 'Brushes', 'Scissors', '#F3E5F5', '#6A1B9A', 'grooming', 2),
    (grooming_id, 'Nail Care', 'Scissors', '#E3F2FD', '#1565C0', 'grooming', 3),
    (grooming_id, 'Accessories', 'ShoppingBag', '#FFF3E0', '#E65100', 'accessories', 4);
END $$;
