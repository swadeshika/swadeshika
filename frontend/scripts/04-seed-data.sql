-- Insert sample categories
INSERT INTO public.categories (name, slug, description, display_order, is_active) VALUES
  ('Ghee', 'ghee', 'Pure and authentic ghee products', 1, true),
  ('Spices', 'spices', 'Premium quality spices', 2, true),
  ('Dry Fruits', 'dry-fruits', 'Fresh and nutritious dry fruits', 3, true),
  ('Oils', 'oils', 'Cold-pressed and traditional oils', 4, true),
  ('Grains & Pulses', 'grains-pulses', 'Organic grains and pulses', 5, true),
  ('Honey & Sweeteners', 'honey-sweeteners', 'Natural honey and sweeteners', 6, true)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products
INSERT INTO public.products (name, slug, description, short_description, category_id, base_price, compare_at_price, sku, track_quantity, quantity, is_featured, is_active, tags, meta_title, meta_description) 
SELECT 
  'Pure Desi Cow Ghee',
  'pure-desi-cow-ghee',
  'Made from the milk of grass-fed cows using traditional bilona method. Rich in vitamins A, D, E, and K. Perfect for cooking, baking, and Ayurvedic remedies.',
  'Traditional bilona method ghee from grass-fed cows',
  id,
  850.00,
  1000.00,
  'GHEE-001',
  true,
  100,
  true,
  true,
  ARRAY['ghee', 'organic', 'traditional', 'bilona'],
  'Pure Desi Cow Ghee - Traditional Bilona Method | Swadeshika',
  'Buy pure desi cow ghee made using traditional bilona method. 100% natural, rich in nutrients, perfect for cooking and health.'
FROM public.categories WHERE slug = 'ghee'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, description, short_description, category_id, base_price, compare_at_price, sku, track_quantity, quantity, is_featured, is_active, tags) 
SELECT 
  'Organic Turmeric Powder',
  'organic-turmeric-powder',
  'Premium quality organic turmeric powder with high curcumin content. Sourced from certified organic farms. Perfect for cooking and health benefits.',
  'High curcumin organic turmeric powder',
  id,
  180.00,
  220.00,
  'SPICE-001',
  true,
  150,
  true,
  true,
  ARRAY['spices', 'organic', 'turmeric', 'health']
FROM public.categories WHERE slug = 'spices'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (name, slug, description, short_description, category_id, base_price, sku, track_quantity, quantity, is_featured, is_active, tags) 
SELECT 
  'Premium Kashmiri Almonds',
  'premium-kashmiri-almonds',
  'Hand-picked premium Kashmiri almonds. Rich in protein, fiber, and healthy fats. Perfect for snacking and cooking.',
  'Hand-picked Kashmiri almonds',
  id,
  650.00,
  'DRY-001',
  true,
  80,
  true,
  true,
  ARRAY['dry-fruits', 'almonds', 'premium', 'kashmiri']
FROM public.categories WHERE slug = 'dry-fruits'
ON CONFLICT (slug) DO NOTHING;

-- Insert product variants for ghee
INSERT INTO public.product_variants (product_id, name, sku, price, quantity, weight, weight_unit, attributes, is_active)
SELECT 
  id,
  '500g',
  'GHEE-001-500G',
  450.00,
  50,
  0.5,
  'kg',
  '{"size": "500g"}'::jsonb,
  true
FROM public.products WHERE slug = 'pure-desi-cow-ghee'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.product_variants (product_id, name, sku, price, quantity, weight, weight_unit, attributes, is_active)
SELECT 
  id,
  '1kg',
  'GHEE-001-1KG',
  850.00,
  30,
  1.0,
  'kg',
  '{"size": "1kg"}'::jsonb,
  true
FROM public.products WHERE slug = 'pure-desi-cow-ghee'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.product_variants (product_id, name, sku, price, quantity, weight, weight_unit, attributes, is_active)
SELECT 
  id,
  '2kg',
  'GHEE-001-2KG',
  1600.00,
  20,
  2.0,
  'kg',
  '{"size": "2kg"}'::jsonb,
  true
FROM public.products WHERE slug = 'pure-desi-cow-ghee'
ON CONFLICT (sku) DO NOTHING;

-- Insert product variants for turmeric
INSERT INTO public.product_variants (product_id, name, sku, price, quantity, weight, weight_unit, attributes, is_active)
SELECT 
  id,
  '100g',
  'SPICE-001-100G',
  90.00,
  100,
  0.1,
  'kg',
  '{"size": "100g"}'::jsonb,
  true
FROM public.products WHERE slug = 'organic-turmeric-powder'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.product_variants (product_id, name, sku, price, quantity, weight, weight_unit, attributes, is_active)
SELECT 
  id,
  '250g',
  'SPICE-001-250G',
  180.00,
  80,
  0.25,
  'kg',
  '{"size": "250g"}'::jsonb,
  true
FROM public.products WHERE slug = 'organic-turmeric-powder'
ON CONFLICT (sku) DO NOTHING;

-- Insert product variants for almonds
INSERT INTO public.product_variants (product_id, name, sku, price, quantity, weight, weight_unit, attributes, is_active)
SELECT 
  id,
  '250g',
  'DRY-001-250G',
  350.00,
  50,
  0.25,
  'kg',
  '{"size": "250g"}'::jsonb,
  true
FROM public.products WHERE slug = 'premium-kashmiri-almonds'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.product_variants (product_id, name, sku, price, quantity, weight, weight_unit, attributes, is_active)
SELECT 
  id,
  '500g',
  'DRY-001-500G',
  650.00,
  40,
  0.5,
  'kg',
  '{"size": "500g"}'::jsonb,
  true
FROM public.products WHERE slug = 'premium-kashmiri-almonds'
ON CONFLICT (sku) DO NOTHING;

-- Insert sample coupon
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_purchase_amount, usage_limit, valid_from, valid_until, is_active) VALUES
  ('WELCOME10', 'Welcome discount for new customers', 'percentage', 10.00, 500.00, 100, NOW(), NOW() + INTERVAL '30 days', true),
  ('FLAT100', 'Flat 100 rupees off on orders above 1000', 'fixed', 100.00, 1000.00, 50, NOW(), NOW() + INTERVAL '15 days', true)
ON CONFLICT (code) DO NOTHING;
