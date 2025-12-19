-- seed-products.sql
-- Run this in phpMyAdmin SQL tab to populate products

-- Ensure categories exist first (from migration script)
-- 1: Ghee, 2: Spices, 3: Dry Fruits, 4: Oils, 5: Honey & Sweeteners

INSERT INTO products (id, name, slug, description, short_description, category_id, sku, price, stock_quantity, is_active, created_at, updated_at)
VALUES
  (1, 'Pure Desi Cow Ghee 500ml', 'pure-desi-cow-ghee-500ml', 'Traditional bilona method ghee from grass-fed cows.', 'Traditional bilona method ghee', 1, 'GHEE-001-500ML', 450.00, 100, 1, NOW(), NOW()),
  (2, 'Pure Desi Cow Ghee 1L', 'pure-desi-cow-ghee-1l', 'Traditional bilona method ghee from grass-fed cows.', 'Traditional bilona method ghee', 1, 'GHEE-001-1L', 850.00, 100, 1, NOW(), NOW()),
  (3, 'Organic Turmeric Powder 250g', 'organic-turmeric-250g', 'High curcumin organic turmeric powder.', 'Organic turmeric powder', 2, 'SPICE-001-250G', 180.00, 100, 1, NOW(), NOW()),
  (4, 'Premium Kashmiri Almonds 250g', 'kashmiri-almonds-250g', 'Handpicked Kashmiri almonds.', 'Premium Kashmiri almonds', 3, 'DRY-001-250G', 350.00, 100, 1, NOW(), NOW()),
  (6, 'Cold Pressed Coconut Oil 500ml', 'coconut-oil-500ml', 'Cold pressed coconut oil for cooking and beauty.', 'Cold pressed coconut oil', 4, 'OIL-001-500ML', 320.00, 100, 1, NOW(), NOW());

-- Optionally add an entry for product 5 if needed for the Honey category
INSERT INTO products (id, name, slug, description, short_description, category_id, sku, price, stock_quantity, is_active, created_at, updated_at)
VALUES
  (5, 'Organic Honey 500g', 'organic-honey-500g', '100% pure organic honey from forest bees.', 'Pure organic honey', 5, 'HONEY-001-500G', 450.00, 100, 1, NOW(), NOW());
