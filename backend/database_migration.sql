-- ============================================================
-- Swadeshika E-commerce Database Schema
-- Migration Script - Complete Database Setup (FIXED VERSION)
-- ============================================================
-- 
-- SCHEMA OVERVIEW:
-- ----------------
-- Total Tables: 26
-- - Users & Auth: users, addresses (2)
-- - Products: products, categories, product_images, product_variants, 
--   product_features, product_specifications, product_tags (7)
-- - Shopping: cart_items, orders, order_items, wishlist (4)
-- - Discounts: coupons, coupon_usage, coupon_products, coupon_categories (4)
-- - Content: blog_posts, blog_categories, blog_authors, contact_submissions, 
--   newsletter_subscribers (5)
-- - Reviews: reviews (1)
-- - Admin: admin_settings (1)
-- - Analytics: site_analytics, visitor_logs (2)
--
-- ID CONVENTIONS:
-- ---------------
-- VARCHAR(36) - UUIDs for user-related: users, addresses, orders
-- INT AUTO_INCREMENT - For products, categories, variants, etc.
--
-- NAMING CONVENTIONS:
-- -------------------
-- All columns use snake_case
-- Exception: users.name (single field, not first_name/last_name)
--
-- IMPORTANT NOTES:
-- ----------------
-- 1. Users table has single 'name' column (NOT first_name/last_name)
-- 2. Addresses use: full_name, address_line1, address_line2
-- 3. All timestamps auto-managed (created_at, updated_at)
-- 4. Enum fields enforce strict validation
-- 5. Foreign keys with proper CASCADE/SET NULL
--
-- FIXES APPLIED:
-- ✅ Issue 1: Changed product_variants.id from VARCHAR(36) to INT AUTO_INCREMENT
-- ✅ Issue 2: Consistent ID types (INT for products/categories, VARCHAR for user-related)
-- ✅ Issue 3: Added INDEX on product_tags.tag (already present)
-- ✅ Issue 4: Added INDEX idx_primary on product_images
-- ✅ Issue 5: Kept simplified cart model (user → cart_items directly)
-- ✅ Issue 6: Added coupon_products and coupon_categories tables
-- ✅ Issue 7: Added blog_categories table with proper foreign key
-- ✅ Issue 8: Added blog_authors table
-- ============================================================


-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS visitor_logs;
DROP TABLE IF EXISTS site_analytics;
DROP TABLE IF EXISTS newsletter_subscribers;
DROP TABLE IF EXISTS contact_submissions;
DROP TABLE IF EXISTS admin_settings;
DROP TABLE IF EXISTS blog_posts;
DROP TABLE IF EXISTS blog_categories;
DROP TABLE IF EXISTS blog_authors;
DROP TABLE IF EXISTS blog_categories;
DROP TABLE IF EXISTS coupon_categories;
DROP TABLE IF EXISTS coupon_products;
DROP TABLE IF EXISTS coupon_usage;
DROP TABLE IF EXISTS coupons;
DROP TABLE IF EXISTS wishlist;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS addresses;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS product_tags;
DROP TABLE IF EXISTS product_specifications;
DROP TABLE IF EXISTS product_features;
DROP TABLE IF EXISTS product_variants;
DROP TABLE IF EXISTS product_images;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
-- ============================================================
-- 1. USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('customer', 'admin') DEFAULT 'customer',
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 1.1 CUSTOMERS TABLE (CRM)
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  status ENUM('Active', 'Inactive', 'Blocked') DEFAULT 'Active',
  join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_orders INT DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 1. CATEGORIES TABLE
-- ============================================================
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  parent_id INT NULL,
  description TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_slug (slug),
  INDEX idx_parent (parent_id),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. PRODUCTS TABLE
-- ============================================================
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  category_id INT,
  sku VARCHAR(100) UNIQUE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  compare_price DECIMAL(10, 2),
  cost_price DECIMAL(10, 2),
  weight DECIMAL(10, 2),
  weight_unit VARCHAR(20) DEFAULT 'kg',
  in_stock BOOLEAN DEFAULT TRUE,
  stock_quantity INT DEFAULT 0,
  low_stock_threshold INT DEFAULT 10,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  review_count INT DEFAULT 0,
  badge VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_slug (slug),
  INDEX idx_sku (sku),
  INDEX idx_category (category_id),
  INDEX idx_active (is_active),
  INDEX idx_featured (is_featured),
  FULLTEXT idx_search (name, description, short_description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. PRODUCT IMAGES TABLE
-- ✅ FIXED: Added INDEX idx_primary for faster primary image lookup
-- ============================================================
CREATE TABLE product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product (product_id),
  INDEX idx_primary (product_id, is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. PRODUCT VARIANTS TABLE
-- ✅ FIXED: Changed from VARCHAR(36) to INT AUTO_INCREMENT
-- ============================================================
CREATE TABLE product_variants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  sku VARCHAR(100) UNIQUE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  compare_price DECIMAL(10, 2),
  weight DECIMAL(10, 2),
  weight_unit VARCHAR(20) DEFAULT 'kg',
  stock_quantity INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product (product_id),
  INDEX idx_sku (sku),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. PRODUCT FEATURES TABLE
-- ============================================================
CREATE TABLE product_features (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  feature_text VARCHAR(500) NOT NULL,
  display_order INT DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. PRODUCT SPECIFICATIONS TABLE
-- ============================================================
CREATE TABLE product_specifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  spec_key VARCHAR(100) NOT NULL,
  spec_value VARCHAR(500) NOT NULL,
  display_order INT DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. PRODUCT TAGS TABLE
-- ✅ INDEX on tag already present
-- ============================================================
CREATE TABLE product_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  tag VARCHAR(50) NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product (product_id),
  INDEX idx_tag (tag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. CART ITEMS TABLE
-- ✅ FIXED: variant_id now INT to match product_variants.id
-- ============================================================
CREATE TABLE cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  product_id INT NOT NULL,
  variant_id INT,
  quantity INT NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
  UNIQUE KEY unique_cart_item (user_id, product_id, variant_id),
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. ADDRESSES TABLE
-- ============================================================
CREATE TABLE addresses (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address_line1 VARCHAR(500) NOT NULL,
  address_line2 VARCHAR(500),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) DEFAULT 'India',
  address_type ENUM('home', 'work', 'other') DEFAULT 'home',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_default (user_id, is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. ORDERS TABLE
-- ============================================================
CREATE TABLE orders (
  id VARCHAR(36) PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  address_id VARCHAR(36),
  subtotal DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0.00,
  shipping_fee DECIMAL(10, 2) DEFAULT 0.00,
  tax_amount DECIMAL(10, 2) DEFAULT 0.00,
  total_amount DECIMAL(10, 2) NOT NULL,
  coupon_code VARCHAR(50),
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  payment_id VARCHAR(255),
  notes TEXT,
  tracking_number VARCHAR(100),
  shipped_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  cancelled_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL,
  INDEX idx_order_number (order_number),
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_payment_status (payment_status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. ORDER ITEMS TABLE
-- ✅ FIXED: variant_id now INT to match product_variants.id
-- ============================================================
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  product_id INT NOT NULL,
  variant_id INT,
  product_name VARCHAR(255) NOT NULL,
  variant_name VARCHAR(100),
  sku VARCHAR(100) NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL,
  INDEX idx_order (order_id),
  INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12. REVIEWS TABLE
-- ============================================================
CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  order_id VARCHAR(36),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(255),
  comment TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  helpful_count INT DEFAULT 0,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  UNIQUE KEY unique_review (product_id, user_id, order_id),
  INDEX idx_product (product_id),
  INDEX idx_user (user_id),
  INDEX idx_approved (is_approved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 13. WISHLIST TABLE
-- ============================================================
CREATE TABLE wishlist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_wishlist (user_id, product_id),
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 14. COUPONS TABLE
-- ============================================================
CREATE TABLE coupons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description VARCHAR(500),
  discount_type ENUM('percentage', 'fixed') NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order_amount DECIMAL(10, 2) DEFAULT 0.00,
  max_discount_amount DECIMAL(10, 2),
  usage_limit INT,
  used_count INT DEFAULT 0,
  per_user_limit INT DEFAULT 1,
  valid_from TIMESTAMP NULL,
  valid_until TIMESTAMP NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 15. COUPON USAGE TABLE
-- ============================================================
CREATE TABLE coupon_usage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coupon_id INT NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  order_id VARCHAR(36) NOT NULL,
  discount_amount DECIMAL(10, 2) NOT NULL,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_coupon (coupon_id),
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 16. COUPON PRODUCTS TABLE (Product-specific coupons)
-- ✅ ADDED: For product-specific discount coupons
-- ============================================================
CREATE TABLE coupon_products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coupon_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_coupon_product (coupon_id, product_id),
  INDEX idx_coupon (coupon_id),
  INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 17. COUPON CATEGORIES TABLE (Category-specific coupons)
-- ✅ ADDED: For category-specific discount coupons
-- ============================================================
CREATE TABLE coupon_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  coupon_id INT NOT NULL,
  category_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE KEY unique_coupon_category (coupon_id, category_id),
  INDEX idx_coupon (coupon_id),
  INDEX idx_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 18. BLOG AUTHORS TABLE
-- ============================================================
CREATE TABLE blog_authors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  bio TEXT,
  avatar LONGTEXT,
  social_links JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 19. BLOG CATEGORIES TABLE
-- ✅ ADDED: Proper blog category management
-- ✅ APIs AVAILABLE: Full CRUD via /api/v1/blog/categories
--    - GET /api/v1/blog/categories/active (public)
--    - GET/POST/PUT/DELETE /api/v1/blog/categories (admin)
-- ============================================================
CREATE TABLE blog_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 20. BLOG POSTS TABLE
-- ✅ FIXED: Now uses category_id foreign key
-- ✅ FIXED: Now uses author_id foreign key to blog_authors
-- ============================================================
CREATE TABLE blog_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt VARCHAR(500),
  content LONGTEXT NOT NULL,
  featured_image LONGTEXT,
  author_id INT,
  category_id INT,
  tags TEXT,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES blog_authors(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE SET NULL,
  INDEX idx_slug (slug),
  INDEX idx_category (category_id),
  INDEX idx_status (status),
  INDEX idx_published (published_at),
  FULLTEXT idx_search (title, excerpt, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 20. ADMIN SETTINGS TABLE
-- ============================================================
CREATE TABLE admin_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  store_name VARCHAR(255) DEFAULT 'Swadeshika',
  support_email VARCHAR(255) DEFAULT 'support@swadeshika.com',
  support_phone VARCHAR(50) DEFAULT '+91 98765 43210',
  store_address TEXT,
  logo_data_url LONGTEXT,
  guest_checkout BOOLEAN DEFAULT TRUE,
  default_order_status ENUM('pending', 'confirmed', 'processing') DEFAULT 'pending',
  currency ENUM('inr', 'usd') DEFAULT 'inr',
  shipping_method ENUM('standard', 'express', 'pickup') DEFAULT 'standard',
  free_shipping_threshold DECIMAL(10, 2),
  flat_rate DECIMAL(10, 2),
  gst_percent DECIMAL(5, 2),
  prices_include_tax BOOLEAN DEFAULT FALSE,
  ga_id VARCHAR(50),
  search_console_id VARCHAR(50),
  timezone ENUM('asia-kolkata', 'utc') DEFAULT 'asia-kolkata',
  units ENUM('metric', 'imperial') DEFAULT 'metric',
  low_stock_threshold INT DEFAULT 10,
  allow_backorders BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 21. CONTACT SUBMISSIONS TABLE
-- ============================================================
CREATE TABLE contact_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(255) NOT NULL,
  order_number VARCHAR(50),
  message TEXT NOT NULL,
  attachment_url VARCHAR(500),
  attachment_name VARCHAR(255),
  status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 22. NEWSLETTER SUBSCRIBERS TABLE
-- ============================================================
CREATE TABLE newsletter_subscribers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at TIMESTAMP NULL,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 23. SITE ANALYTICS TABLE (Simple Counters)
-- ============================================================
CREATE TABLE IF NOT EXISTS site_analytics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  metric_key VARCHAR(100) UNIQUE NOT NULL,
  metric_value BIGINT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 24. VISITOR LOGS TABLE (Detailed Tracking)
-- ============================================================
CREATE TABLE IF NOT EXISTS visitor_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  page_url VARCHAR(500),
  visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ip (ip_address),
  INDEX idx_date (visited_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 25. REPORTS TABLE
-- ✅ ADDED: For storing generated reports and analytics snapshots
-- ============================================================
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_type ENUM('sales', 'inventory', 'customers', 'financial', 'custom') NOT NULL,
  name VARCHAR(255) NOT NULL,
  parameters JSON COMMENT 'Filters used: date range, category, etc.',
  data_snapshot JSON COMMENT 'Stores the summary data for quick retrieval',
  file_url VARCHAR(500) COMMENT 'URL to downloadable PDF/CSV if generated',
  format ENUM('json', 'pdf', 'csv', 'excel') DEFAULT 'json',
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  error_message TEXT,
  generated_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_type (report_type),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================

-- Insert sample categories
INSERT INTO categories (name, slug, parent_id, description, display_order) VALUES
('Ghee', 'ghee', NULL, 'Pure and organic ghee products', 1),
('Spices', 'spices', NULL, 'Authentic Indian spices', 2),
('Dry Fruits', 'dry-fruits', NULL, 'Premium quality dry fruits', 3),
('Oils', 'oils', NULL, 'Cold-pressed and organic oils', 4),
('Honey & Sweeteners', 'honey-sweeteners', NULL, 'Natural sweeteners', 5);

-- Insert subcategories
INSERT INTO categories (name, slug, parent_id, description, display_order) VALUES
('Turmeric', 'turmeric', 2, 'Organic turmeric powder', 1),
('Chili Powder', 'chili-powder', 2, 'Red chili powder', 2);

-- Insert default blog author
INSERT INTO blog_authors (name, email, bio, avatar, social_links) VALUES
('Admin Team', 'admin@swadeshika.com', 'The official editorial team of Swadeshika.', '/images/default-avatar.png', '{"twitter": "", "facebook": "", "instagram": "", "linkedin": ""}');

-- Insert sample blog categories
INSERT INTO blog_categories (name, slug, description, display_order) VALUES
('Health & Wellness', 'health-wellness', 'Articles about health benefits', 1),
('Recipes', 'recipes', 'Traditional and modern recipes', 2),
('Farming', 'farming', 'Stories from our farmers', 3),
('Product News', 'product-news', 'New product launches and updates', 4);

-- Insert default admin settings
INSERT INTO admin_settings (store_name, support_email, support_phone, currency, timezone) VALUES
('Swadeshika Store', 'admin@swadeshika.com', '+91 98765 43210', 'inr', 'asia-kolkata');

-- Initialize Visitor Count
INSERT INTO site_analytics (metric_key, metric_value) VALUES ('visitor_count', 1000);

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Run these queries to verify the schema was created successfully:

-- Show all tables
-- SHOW TABLES;

-- Show table structure
-- DESCRIBE products;
-- DESCRIBE product_variants;
-- DESCRIBE coupons;
-- DESCRIBE blog_posts;

-- Count records
-- SELECT COUNT(*) FROM categories;
-- SELECT COUNT(*) FROM blog_categories;

-- Verify foreign keys
-- SHOW CREATE TABLE product_variants;
-- SHOW CREATE TABLE blog_posts;

-- ============================================================
-- NOTES FOR INTERNS
-- ============================================================

-- FIXES APPLIED IN THIS VERSION:
-- 
-- 1. ✅ product_variants.id changed from VARCHAR(36) to INT AUTO_INCREMENT
--    - Faster joins and better performance
--    - No need to manually generate UUIDs
--    - Consistent with products table
-- 
-- 2. ✅ variant_id in cart_items and order_items updated to INT
--    - Matches the new product_variants.id type
--    - Maintains referential integrity
-- 
-- 3. ✅ Added INDEX idx_primary on product_images
--    - Faster lookup for primary images
--    - Composite index on (product_id, is_primary)
-- 
-- 4. ✅ Added coupon_products table
--    - Enables product-specific discount coupons
--    - Many-to-many relationship between coupons and products
-- 
-- 5. ✅ Added coupon_categories table
--    - Enables category-specific discount coupons
--    - Many-to-many relationship between coupons and categories
-- 
-- 6. ✅ Added blog_categories table
--    - Proper category management for blog posts
--    - Foreign key relationship in blog_posts table
-- 
-- 7. ✅ blog_posts.category changed from VARCHAR to category_id INT
--    - Proper relational design
--    - Foreign key to blog_categories table
--
-- DESIGN DECISIONS:
-- 
-- - Cart model: Simplified (user → cart_items directly)
--   Pros: Simpler, faster queries
--   Cons: Cannot support multiple carts per user
--   Decision: Acceptable for current requirements
-- 
-- - ID types: Mixed but consistent
--   INT: products, categories, variants, reviews (performance-critical)
--   VARCHAR(36): users, orders, addresses (UUID for security/distribution)
--   Decision: Best of both worlds
--
-- NEXT STEPS:
-- 1. Run this script in MySQL Workbench or command line
-- 2. Verify all tables created: SHOW TABLES;
-- 3. Check foreign keys: SHOW CREATE TABLE product_variants;
-- 4. Test with sample data
-- 5. Begin implementing models and controllers

-- ============================================================
-- END OF MIGRATION SCRIPT
-- ============================================================

-- ============================================================
-- 23. HERO SLIDES TABLE
-- ============================================================
CREATE TABLE hero_slides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  image_url VARCHAR(500) NOT NULL,
  button_text VARCHAR(50) DEFAULT 'ORDER NOW',
  button_link VARCHAR(255) DEFAULT '/shop',
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO hero_slides (title, subtitle, image_url, button_text, button_link, display_order) VALUES
('Pure Forest Honey', 'Directly from the tribes of Central India', '/hero-slide-1.jpg', 'SHOP HONEY', '/shop/honey', 1),
('Organic Cold Pressed Oils', 'Nutritious & flavorful for healthy cooking', '/hero-slide-2-spices.jpg', 'EXPLORE OILS', '/shop/oils', 2);


-- ============================================================
-- 24. QUICK LINKS TABLE
-- ============================================================
CREATE TABLE quick_links (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  href VARCHAR(255) NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO quick_links (name, icon, href, display_order) VALUES
('Festival Specials', '', '/shop/festival', 1),
('Membership Deals', '', '/membership', 2),
('New Launches', '', '/shop/new', 3),
('Under ?499', '', '/shop/under-499', 4),
('Under ?999', '', '/shop/under-999', 5),
('All Products', '', '/shop', 6);


-- ============================================================
-- 25. HOME BANNERS TABLE
-- ============================================================
CREATE TABLE home_banners (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('big', 'small') NOT NULL,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  image_url VARCHAR(500) NOT NULL,
  button_text VARCHAR(50) DEFAULT 'ORDER NOW',
  button_link VARCHAR(255) DEFAULT '/shop',
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO home_banners (type, title, subtitle, image_url, button_text, button_link, display_order) VALUES
('big', 'Festival Special Offers', 'Pure Desi Ghee at Best Prices', 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Ex8VxC2U7ANMfELBQuhxanzrVb8gEz.png', 'ORDER NOW', '/shop/festival', 1),
('small', 'A2 Ghee from Free-Grazing Gir Cows', 'Pure & Authentic', '/hero-slide-2-spices.jpg', 'Shop Now', '/shop/a2-ghee', 2),
('small', 'Farmers to get more back to Your Roots', NULL, '/pattern-leaves.jpg', 'ORDER NOW', '/about/farmers', 3);


COMMIT;

