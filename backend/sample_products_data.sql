-- ============================================================
-- Swadeshika E-commerce - Sample Product Data
-- Complete data with all fields for testing
-- ============================================================

-- Clear existing sample data (if any)
DELETE FROM product_tags WHERE product_id BETWEEN 1 AND 10;
DELETE FROM product_specifications WHERE product_id BETWEEN 1 AND 10;
DELETE FROM product_features WHERE product_id BETWEEN 1 AND 10;
DELETE FROM product_variants WHERE product_id BETWEEN 1 AND 10;
DELETE FROM product_images WHERE product_id BETWEEN 1 AND 10;
DELETE FROM products WHERE id BETWEEN 1 AND 10;
DELETE FROM categories WHERE id BETWEEN 1 AND 6;

-- First, let's add categories
INSERT INTO categories (name, slug, description, is_active, display_order) VALUES
('Ghee & Dairy', 'ghee-dairy', 'Pure desi ghee and traditional dairy products', 1, 1),
('Spices', 'spices', 'Authentic Indian spices and masalas', 1, 2),
('Oils', 'oils', 'Cold-pressed and traditional cooking oils', 1, 3),
('Dry Fruits', 'dry-fruits', 'Premium quality dry fruits and nuts', 1, 4),
('Honey & Sweeteners', 'honey-sweeteners', 'Natural honey and traditional sweeteners', 1, 5),
('Pulses & Grains', 'pulses-grains', 'Organic pulses and whole grains', 1, 6);

-- Now add products with complete details
INSERT INTO products (
  name, slug, description, short_description, category_id, sku, price, compare_price, cost_price,
  weight, weight_unit, in_stock, stock_quantity, low_stock_threshold, rating, review_count,
  is_active, is_featured, meta_title, meta_description
) VALUES
-- Product 1: Pure Desi Cow Ghee
(
  'Pure Desi Cow Ghee',
  'pure-desi-cow-ghee',
  'Our Pure Desi Cow Ghee is made using the traditional bilona method from A2 milk of indigenous Gir cows. The cows are grass-fed and free-grazing, ensuring the highest quality and nutritional value. Rich in omega-3 fatty acids, vitamins A, D, E, and K, this ghee is perfect for cooking, religious ceremonies, and Ayurvedic treatments. The golden color and rich aroma are testament to its purity and traditional preparation method.',
  'Traditional bilona method ghee from grass-fed Gir cows, rich in nutrients and authentic taste',
  1, 'GHE-001', 850, 1000, 650,
  1, 'kg', 1, 50, 10, 4.9, 234,
  1, 1, 'Pure Desi Cow Ghee - A2 Bilona Ghee | Swadeshika', 'Buy pure desi cow ghee made from A2 milk using traditional bilona method. 100% natural, grass-fed, and chemical-free.'
),

-- Product 2: Organic Turmeric Powder
(
  'Organic Turmeric Powder (Haldi)',
  'organic-turmeric-powder',
  'Premium quality organic turmeric powder sourced directly from certified organic farms in Sangli, Maharashtra. Known for its high curcumin content (5-7%), vibrant color, and strong aroma. Our turmeric is sun-dried and stone-ground to preserve its natural oils and medicinal properties. Free from artificial colors, preservatives, and additives. Perfect for cooking, skincare, and traditional remedies.',
  'High curcumin organic turmeric from Sangli farms, stone-ground for maximum potency',
  2, 'SPI-001', 180, 220, 120,
  0.25, 'kg', 1, 100, 20, 4.8, 156,
  1, 1, 'Organic Turmeric Powder - High Curcumin Haldi | Swadeshika', 'Buy organic turmeric powder with high curcumin content. Stone-ground, chemical-free, perfect for cooking and wellness.'
),

-- Product 3: Cold Pressed Coconut Oil
(
  'Cold Pressed Coconut Oil',
  'cold-pressed-coconut-oil',
  'Virgin coconut oil extracted using traditional cold-press method from fresh coconuts sourced from Kerala. Retains all natural nutrients, aroma, and flavor. Rich in medium-chain fatty acids (MCFAs) and lauric acid. Perfect for cooking, hair care, and skin care. No heat, no chemicals, no preservatives - just pure coconut goodness. The oil solidifies at room temperature, which is a sign of purity.',
  'Virgin coconut oil from Kerala, cold-pressed to retain all natural nutrients',
  3, 'OIL-001', 320, 380, 220,
  1, 'L', 1, 75, 15, 4.7, 98,
  1, 0, 'Cold Pressed Coconut Oil - Virgin Coconut Oil | Swadeshika', 'Buy pure cold-pressed coconut oil from Kerala. Virgin, chemical-free, perfect for cooking and beauty care.'
),

-- Product 4: Premium Kashmiri Almonds
(
  'Premium Kashmiri Almonds (Badam)',
  'premium-kashmiri-almonds',
  'Handpicked premium quality Kashmiri almonds known for their rich flavor, crunchy texture, and high oil content. These almonds are larger and sweeter than regular almonds. Rich in vitamin E, magnesium, and healthy fats. Perfect for snacking, desserts, and traditional sweets. Each almond is carefully selected and cleaned. Store in a cool, dry place to maintain freshness.',
  'Large, sweet Kashmiri almonds rich in vitamin E and healthy fats',
  4, 'DRY-001', 650, 750, 480,
  0.5, 'kg', 1, 40, 10, 4.9, 189,
  1, 1, 'Premium Kashmiri Almonds - Badam | Swadeshika', 'Buy premium Kashmiri almonds. Large, sweet, rich in nutrients. Perfect for health and taste.'
),

-- Product 5: Raw Forest Honey
(
  'Raw Forest Honey (Jungle Honey)',
  'raw-forest-honey',
  'Pure, raw, and unprocessed forest honey collected from wild bee hives in the forests of Madhya Pradesh. This multi-floral honey is rich in enzymes, antioxidants, and minerals. Never heated or filtered, preserving all natural nutrients and pollen. The honey may crystallize naturally, which is a sign of purity. Perfect for boosting immunity, soothing coughs, and as a natural sweetener.',
  'Unprocessed wild forest honey rich in enzymes and antioxidants',
  5, 'HON-001', 450, 550, 320,
  0.5, 'kg', 1, 60, 12, 4.8, 145,
  1, 1, 'Raw Forest Honey - Pure Jungle Honey | Swadeshika', 'Buy raw forest honey collected from wild hives. Unprocessed, enzyme-rich, perfect for health and wellness.'
),

-- Product 6: Organic Chana Dal
(
  'Organic Chana Dal (Split Bengal Gram)',
  'organic-chana-dal',
  'Premium quality organic chana dal sourced from certified organic farms. High in protein, fiber, and essential nutrients. Perfect for making dal, snacks, and traditional Indian dishes. Our chana dal is cleaned, sorted, and packed hygienically. Free from pesticides and chemicals. Cooks evenly and has a rich, nutty flavor.',
  'Protein-rich organic chana dal, perfect for healthy Indian cooking',
  6, 'PUL-001', 120, 150, 85,
  1, 'kg', 1, 120, 25, 4.6, 67,
  1, 0, 'Organic Chana Dal - Split Bengal Gram | Swadeshika', 'Buy organic chana dal rich in protein and fiber. Chemical-free, perfect for dal and snacks.'
),

-- Product 7: Red Chili Powder
(
  'Kashmiri Red Chili Powder (Lal Mirch)',
  'kashmiri-red-chili-powder',
  'Authentic Kashmiri red chili powder known for its vibrant red color and mild heat. Perfect for adding color to your dishes without making them too spicy. Stone-ground from sun-dried Kashmiri chilies. Rich in vitamin C and capsaicin. Free from artificial colors and additives. Essential for Indian cooking.',
  'Vibrant Kashmiri chili powder for color and mild heat',
  2, 'SPI-002', 200, 250, 140,
  0.25, 'kg', 1, 90, 18, 4.7, 112,
  1, 0, 'Kashmiri Red Chili Powder - Lal Mirch | Swadeshika', 'Buy authentic Kashmiri red chili powder. Vibrant color, mild heat, perfect for Indian cooking.'
),

-- Product 8: Mustard Oil
(
  'Kachi Ghani Mustard Oil (Sarson Ka Tel)',
  'kachi-ghani-mustard-oil',
  'Traditional kachi ghani (cold-pressed) mustard oil extracted from premium quality mustard seeds. Rich, pungent aroma and strong flavor. High in omega-3 fatty acids and vitamin E. Perfect for cooking, pickling, and massage. Our mustard oil is extracted using traditional wooden press (ghani) method, preserving all natural nutrients.',
  'Traditional cold-pressed mustard oil with pungent aroma',
  3, 'OIL-002', 280, 330, 200,
  1, 'L', 1, 65, 13, 4.6, 78,
  1, 0, 'Kachi Ghani Mustard Oil - Sarson Ka Tel | Swadeshika', 'Buy traditional cold-pressed mustard oil. Rich in omega-3, perfect for cooking and health.'
),

-- Product 9: Cashew Nuts
(
  'Premium Whole Cashews (Kaju)',
  'premium-whole-cashews',
  'Premium quality whole cashew nuts sourced from Kerala and Karnataka. Creamy texture and rich, buttery flavor. Rich in healthy fats, protein, and minerals like copper and magnesium. Perfect for snacking, cooking, and making sweets. Each cashew is carefully selected for size and quality.',
  'Creamy whole cashews rich in healthy fats and minerals',
  4, 'DRY-002', 720, 850, 550,
  0.5, 'kg', 1, 35, 8, 4.8, 156,
  1, 1, 'Premium Whole Cashews - Kaju | Swadeshika', 'Buy premium whole cashews from Kerala. Creamy, rich in nutrients, perfect for snacking and cooking.'
),

-- Product 10: Jaggery
(
  'Organic Jaggery (Gur)',
  'organic-jaggery',
  'Pure organic jaggery made from sugarcane juice using traditional methods. No chemicals or additives. Rich in iron, magnesium, and potassium. Perfect natural sweetener for tea, desserts, and traditional recipes. Our jaggery has a rich, caramel-like flavor and is free from sulfur and other preservatives.',
  'Pure organic jaggery, natural sweetener rich in iron',
  5, 'HON-002', 90, 120, 65,
  1, 'kg', 1, 150, 30, 4.7, 89,
  1, 0, 'Organic Jaggery - Natural Gur | Swadeshika', 'Buy pure organic jaggery. Chemical-free, iron-rich, perfect natural sweetener.'
);

-- Add product images
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order) VALUES
-- Ghee images
(1, '/products/ghee-1.jpg', 'Pure Desi Cow Ghee in glass jar', 1, 1),
(1, '/products/ghee-2.jpg', 'Ghee texture close-up', 0, 2),
(1, '/products/ghee-3.jpg', 'Ghee being poured', 0, 3),

-- Turmeric images
(2, '/products/turmeric-1.jpg', 'Organic Turmeric Powder', 1, 1),
(2, '/products/turmeric-2.jpg', 'Turmeric powder in bowl', 0, 2),

-- Coconut Oil images
(3, '/products/coconut-oil-1.jpg', 'Cold Pressed Coconut Oil bottle', 1, 1),
(3, '/products/coconut-oil-2.jpg', 'Coconut oil texture', 0, 2),

-- Almonds images
(4, '/products/almonds-1.jpg', 'Premium Kashmiri Almonds', 1, 1),
(4, '/products/almonds-2.jpg', 'Almonds close-up', 0, 2),

-- Honey images
(5, '/products/honey-1.jpg', 'Raw Forest Honey jar', 1, 1),
(5, '/products/honey-2.jpg', 'Honey being drizzled', 0, 2),

-- Chana Dal images
(6, '/products/chana-dal-1.jpg', 'Organic Chana Dal', 1, 1),

-- Red Chili Powder images
(7, '/products/chili-powder-1.jpg', 'Kashmiri Red Chili Powder', 1, 1),

-- Mustard Oil images
(8, '/products/mustard-oil-1.jpg', 'Kachi Ghani Mustard Oil', 1, 1),

-- Cashews images
(9, '/products/cashews-1.jpg', 'Premium Whole Cashews', 1, 1),

-- Jaggery images
(10, '/products/jaggery-1.jpg', 'Organic Jaggery blocks', 1, 1);

-- Add product variants (different sizes/weights)
INSERT INTO product_variants (product_id, name, sku, price, compare_price, weight, weight_unit, stock_quantity, is_active) VALUES
-- Ghee variants
(1, '500g', 'GHE-001-500G', 450, 550, 0.5, 'kg', 80, 1),
(1, '1kg', 'GHE-001-1KG', 850, 1000, 1, 'kg', 50, 1),
(1, '2kg', 'GHE-001-2KG', 1650, 1900, 2, 'kg', 25, 1),

-- Turmeric variants
(2, '100g', 'SPI-001-100G', 80, 100, 0.1, 'kg', 150, 1),
(2, '250g', 'SPI-001-250G', 180, 220, 0.25, 'kg', 100, 1),
(2, '500g', 'SPI-001-500G', 340, 420, 0.5, 'kg', 60, 1),

-- Coconut Oil variants
(3, '500ml', 'OIL-001-500ML', 180, 220, 0.5, 'L', 100, 1),
(3, '1L', 'OIL-001-1L', 320, 380, 1, 'L', 75, 1),
(3, '2L', 'OIL-001-2L', 600, 720, 2, 'L', 40, 1),

-- Almonds variants
(4, '250g', 'DRY-001-250G', 350, 420, 0.25, 'kg', 60, 1),
(4, '500g', 'DRY-001-500G', 650, 750, 0.5, 'kg', 40, 1),
(4, '1kg', 'DRY-001-1KG', 1250, 1450, 1, 'kg', 20, 1),

-- Honey variants
(5, '250g', 'HON-001-250G', 250, 300, 0.25, 'kg', 80, 1),
(5, '500g', 'HON-001-500G', 450, 550, 0.5, 'kg', 60, 1),
(5, '1kg', 'HON-001-1KG', 850, 1000, 1, 'kg', 30, 1),

-- Chana Dal variants
(6, '500g', 'PUL-001-500G', 65, 80, 0.5, 'kg', 150, 1),
(6, '1kg', 'PUL-001-1KG', 120, 150, 1, 'kg', 120, 1),
(6, '5kg', 'PUL-001-5KG', 550, 700, 5, 'kg', 50, 1),

-- Chili Powder variants
(7, '100g', 'SPI-002-100G', 90, 110, 0.1, 'kg', 120, 1),
(7, '250g', 'SPI-002-250G', 200, 250, 0.25, 'kg', 90, 1),
(7, '500g', 'SPI-002-500G', 380, 470, 0.5, 'kg', 50, 1),

-- Mustard Oil variants
(8, '500ml', 'OIL-002-500ML', 160, 190, 0.5, 'L', 90, 1),
(8, '1L', 'OIL-002-1L', 280, 330, 1, 'L', 65, 1),
(8, '2L', 'OIL-002-2L', 530, 630, 2, 'L', 35, 1),

-- Cashews variants
(9, '250g', 'DRY-002-250G', 380, 450, 0.25, 'kg', 50, 1),
(9, '500g', 'DRY-002-500G', 720, 850, 0.5, 'kg', 35, 1),
(9, '1kg', 'DRY-002-1KG', 1400, 1650, 1, 'kg', 15, 1),

-- Jaggery variants
(10, '500g', 'HON-002-500G', 50, 65, 0.5, 'kg', 200, 1),
(10, '1kg', 'HON-002-1KG', 90, 120, 1, 'kg', 150, 1),
(10, '5kg', 'HON-002-5KG', 420, 550, 5, 'kg', 60, 1);

-- Add product features
INSERT INTO product_features (product_id, feature) VALUES
-- Ghee features
(1, '100% Pure A2 Desi Cow Ghee'),
(1, 'Traditional Bilona Method'),
(1, 'Grass-Fed Free-Grazing Cows'),
(1, 'Rich in Omega-3 & Vitamins'),
(1, 'No Preservatives or Additives'),

-- Turmeric features
(2, 'Certified Organic'),
(2, 'High Curcumin Content (5-7%)'),
(2, 'Stone Ground'),
(2, 'No Artificial Colors'),
(2, 'Direct from Sangli Farms'),

-- Coconut Oil features
(3, 'Virgin Cold-Pressed'),
(3, 'From Fresh Kerala Coconuts'),
(3, 'Rich in MCFAs'),
(3, 'No Heat or Chemicals'),
(3, 'Multi-Purpose Use'),

-- Almonds features
(4, 'Premium Kashmiri Quality'),
(4, 'Handpicked & Sorted'),
(4, 'Rich in Vitamin E'),
(4, 'Large Size'),
(4, 'Sweet & Crunchy'),

-- Honey features
(5, 'Raw & Unprocessed'),
(5, 'Wild Forest Collection'),
(5, 'Rich in Enzymes'),
(5, 'Never Heated or Filtered'),
(5, 'Natural Immunity Booster');

-- Add product specifications
INSERT INTO product_specifications (product_id, spec_key, spec_value) VALUES
-- Ghee specifications
(1, 'Source', 'Indigenous Gir Cows'),
(1, 'Method', 'Traditional Bilona'),
(1, 'Shelf Life', '12 months'),
(1, 'Storage', 'Cool, dry place'),
(1, 'Certification', 'FSSAI Approved'),

-- Turmeric specifications
(2, 'Origin', 'Sangli, Maharashtra'),
(2, 'Curcumin Content', '5-7%'),
(2, 'Processing', 'Stone Ground'),
(2, 'Shelf Life', '18 months'),
(2, 'Certification', 'Organic Certified'),

-- Coconut Oil specifications
(3, 'Origin', 'Kerala'),
(3, 'Extraction', 'Cold-Pressed'),
(3, 'Type', 'Virgin'),
(3, 'Shelf Life', '24 months'),
(3, 'Melting Point', '24°C'),

-- Almonds specifications
(4, 'Origin', 'Kashmir'),
(4, 'Grade', 'Premium'),
(4, 'Size', 'Large (18-20mm)'),
(4, 'Shelf Life', '6 months'),
(4, 'Storage', 'Airtight container'),

-- Honey specifications
(5, 'Source', 'Wild Forest Hives'),
(5, 'Type', 'Multi-floral'),
(5, 'Processing', 'Raw & Unfiltered'),
(5, 'Shelf Life', '24 months'),
(5, 'Region', 'Madhya Pradesh');

-- Add product tags
INSERT INTO product_tags (product_id, tag) VALUES
-- Ghee tags
(1, 'ghee'), (1, 'dairy'), (1, 'a2'), (1, 'bilona'), (1, 'traditional'),
-- Turmeric tags
(2, 'spices'), (2, 'organic'), (2, 'turmeric'), (2, 'haldi'), (2, 'ayurvedic'),
-- Coconut Oil tags
(3, 'oil'), (3, 'coconut'), (3, 'cold-pressed'), (3, 'virgin'), (3, 'kerala'),
-- Almonds tags
(4, 'dry-fruits'), (4, 'almonds'), (4, 'badam'), (4, 'kashmiri'), (4, 'premium'),
-- Honey tags
(5, 'honey'), (5, 'raw'), (5, 'forest'), (5, 'natural'), (5, 'immunity');

-- ============================================================
-- DONE! All products added with complete data
-- ============================================================
