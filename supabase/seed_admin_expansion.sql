-- ============================================================
-- Pet Corner — Admin Console Expansion Seed Script
-- Run this once in your Supabase SQL Editor.
-- It is safe to run multiple times (uses INSERT ... ON CONFLICT DO NOTHING).
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- 1. Extend the promotions table with new optional columns
-- ─────────────────────────────────────────────────────────────
ALTER TABLE promotions
  ADD COLUMN IF NOT EXISTS placement    TEXT NOT NULL DEFAULT 'homepage',
  ADD COLUMN IF NOT EXISTS sort_order   INT  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS expires_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS badge_label  TEXT;


-- ─────────────────────────────────────────────────────────────
-- 2. Create content_blocks table for editable page copy
--    (FAQ items, About page text, Trust ribbon items)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_blocks (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  block_key  TEXT UNIQUE NOT NULL,  -- e.g. "faq_health_question"
  title      TEXT,                   -- FAQ question / section heading
  body       TEXT,                   -- FAQ answer / paragraph body
  sort_order INT         NOT NULL DEFAULT 0,
  is_active  BOOLEAN     NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- 3. Seed FAQ items (currently hardcoded in about/page.tsx)
-- ─────────────────────────────────────────────────────────────
INSERT INTO content_blocks (block_key, title, body, sort_order) VALUES
  (
    'faq_verified_breeders',
    'How do I know the breeders are verified?',
    'We personally visit and audit every breeder in our network to ensure they meet our strict ethical and health standards. Every pet comes with a certified health guarantee.',
    1
  ),
  (
    'faq_health_guarantee',
    'What happens if my pet has a health issue after adoption?',
    'All pets adopted through us are covered by our 30-day comprehensive health guarantee. Our 24/7 vet support is also available to help you immediately.',
    2
  ),
  (
    'faq_shipping_time',
    'How long does shipping take for supplies?',
    'Orders are typically processed within 24 hours. Delivery takes 1–3 business days depending on your location. We offer free shipping on orders over ₦50,000.',
    3
  ),
  (
    'faq_pre_purchase_vet',
    'Can I talk to a vet before making a purchase?',
    'Absolutely! You can book a consultation with one of our certified vets anytime to discuss your pet needs or get advice on which companion is right for you.',
    4
  )
ON CONFLICT (block_key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 4. Seed About page copy blocks
-- ─────────────────────────────────────────────────────────────
INSERT INTO content_blocks (block_key, title, body, sort_order) VALUES
  (
    'about_hero_headline',
    'Connecting Pets with Loving Homes',
    'We are dedicated to ensuring every pet finds a family, and every family finds their perfect companion. With verified breeders, premium care, and expert vets.',
    1
  ),
  (
    'about_body_paragraph_1',
    'Why Choose Us?',
    'Founded on the principle that pets deserve the absolute best, we were created to bridge the gap between ethical breeders, essential pet care, and future pet parents.',
    2
  ),
  (
    'about_body_paragraph_2',
    'A Lifelong Ecosystem',
    'We don''t just facilitate adoptions; we provide a lifelong ecosystem. From finding your pet to ensuring they have the best nutrition, toys, and medical care, we are with you every step of the way.',
    3
  )
ON CONFLICT (block_key) DO NOTHING;


-- ─────────────────────────────────────────────────────────────
-- 5. Seed new site_settings rows
--    All values are defaults — admin edits them in the Settings page.
-- ─────────────────────────────────────────────────────────────
INSERT INTO site_settings (key, value, description) VALUES

  -- Brand & Identity
  ('site_name',        'Pet Corner',        'The public name of your platform, shown in the Navbar, Footer, and Admin sidebar.'),
  ('company_name',     'Pet Corner Ltd.',   'Legal company name, shown in the Footer copyright line.'),
  ('site_tagline',     'Your premium destination for everything pets. From verified adoptions to expert vet care.', 'Short brand tagline shown in the Footer.'),
  ('site_url',         'https://petcorner.com', 'Your live website URL, used in legal pages and metadata.'),

  -- SEO
  ('seo_title',        'Pet Corner | Premium Pet Care & Supplies', 'The browser tab title used across the entire site.'),
  ('seo_description',  'The one-stop destination for premium pet sales, high-quality accessories, specialised medication, and professional vet consultations.', 'The meta description shown in Google search results.'),
  ('seo_keywords',     'pet sales, buy dogs, buy cats, pet shop, pet supplies, vet consultation, dog breeders', 'Comma-separated SEO keywords.'),

  -- Social Media Links (leave blank to hide the icon)
  ('social_facebook',  '', 'Full URL to your Facebook page. Leave blank to hide the icon.'),
  ('social_instagram', '', 'Full URL to your Instagram profile. Leave blank to hide the icon.'),
  ('social_twitter',   '', 'Full URL to your X (Twitter) profile. Leave blank to hide the icon.'),
  ('social_youtube',   '', 'Full URL to your YouTube channel. Leave blank to hide the icon.'),

  -- App Store Links (leave blank to hide the badges)
  ('app_store_url',    '', 'Apple App Store link. Leave blank to hide the badge in the Footer.'),
  ('play_store_url',   '', 'Google Play Store link. Leave blank to hide the badge in the Footer.'),

  -- Currency Exchange Rates (relative to GBP base)
  ('currency_usd_rate', '1.25',  'USD exchange rate relative to GBP. e.g. 1.25 means £1 = $1.25.'),
  ('currency_eur_rate', '1.17',  'EUR exchange rate relative to GBP. e.g. 1.17 means £1 = €1.17.'),
  ('currency_ngn_rate', '1450',  'NGN exchange rate relative to GBP. e.g. 1450 means £1 = ₦1,450.'),

  -- Platform Limits (control how many items appear in sections)
  ('homepage_pet_limit',     '4', 'How many pet cards to show in the homepage "Newest Arrivals" preview.'),
  ('homepage_product_limit', '4', 'How many product cards to show in the homepage "Shop the Best" preview.'),
  ('homepage_promo_limit',   '3', 'How many promo cards to show in the homepage promotions carousel.'),
  ('search_result_limit',    '3', 'How many results to show per category in the search dropdown.'),

  -- Pricing & Policies (used in FAQ and legal pages)
  ('free_shipping_threshold', '50000', 'Order value (in base currency) that qualifies for free shipping. Shown in FAQ and checkout.'),
  ('health_guarantee_days',   '30',    'Number of days covered by the pet health guarantee. Shown in FAQ and legal pages.'),

  -- Copy Snippets
  ('whatsapp_inquiry_template',
   'Hi! I''m interested in {name}. Can I get more details?',
   'WhatsApp message template when a user enquires about a pet. Use {name} as a placeholder for the pet/product name.')

ON CONFLICT (key) DO NOTHING;
