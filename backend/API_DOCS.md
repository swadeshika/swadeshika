# Swadeshika E-commerce API Documentation

**Complete Backend Implementation Guide for Interns**

This document provides comprehensive details about the database schema, API endpoints, and implementation guidelines for the Swadeshika e-commerce platform backend.

---

## Table of Contents

1. [Overview](#overview)
2. [Database Schema](#database-schema)
3. [Entity Relationship Diagram](#entity-relationship-diagram)
4. [Authentication](#authentication)
5. [API Endpoints](#api-endpoints)
   - [Authentication](#1-authentication-endpoints)
   - [Products](#2-products-endpoints)
   - [Categories](#3-categories-endpoints)
   - [Cart](#4-cart-endpoints)
   - [Orders](#5-orders-endpoints)
   - [Reviews](#6-reviews-endpoints)
   - [Wishlist](#7-wishlist-endpoints)
   - [Addresses](#8-addresses-endpoints)
   - [Coupons](#9-coupons-endpoints-admin)
   - [Customers](#10-customers-endpoints-admin)
   - [Blog](#11-blog-endpoints)
   - [Reports](#12-reports-endpoints-admin)
6. [Implementation Guidelines](#implementation-guidelines)
7. [Error Handling](#error-handling)
8. [Testing](#testing)

---

## Overview

### Base URL
```
Development: http://localhost:5000/api/v1
Production: https://api.swadeshika.com/api/v1
```

### Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL 8.0+
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: helmet, cors, xss-clean, express-rate-limit

### Rate Limiting
- **100 requests** per 15 minutes per IP address
- Exceeding limit returns HTTP `429 Too Many Requests`

---

## Database Schema

### Complete SQL Schema

```sql
-- ============================================================
-- 1. USERS TABLE (Already Implemented)
-- ============================================================
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('customer', 'admin') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. CATEGORIES TABLE
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
-- 3. PRODUCTS TABLE
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
-- 4. PRODUCT IMAGES TABLE
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
  INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. PRODUCT VARIANTS TABLE
-- ============================================================
CREATE TABLE product_variants (
  id VARCHAR(36) PRIMARY KEY,
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
-- 6. PRODUCT FEATURES TABLE
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
-- 7. PRODUCT SPECIFICATIONS TABLE
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
-- 8. PRODUCT TAGS TABLE
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
-- 9. CART ITEMS TABLE
-- ============================================================
CREATE TABLE cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  product_id INT NOT NULL,
  variant_id VARCHAR(36),
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
-- 10. ADDRESSES TABLE
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
-- 11. ORDERS TABLE
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
-- 12. ORDER ITEMS TABLE
-- ============================================================
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  product_id INT NOT NULL,
  variant_id VARCHAR(36),
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
-- 13. REVIEWS TABLE
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
-- 14. WISHLIST TABLE
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
-- 15. COUPONS TABLE
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
-- 16. COUPON USAGE TABLE
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
-- 17. BLOG POSTS TABLE
-- ============================================================
CREATE TABLE blog_posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt VARCHAR(500),
  content TEXT NOT NULL,
  featured_image VARCHAR(500),
  author_id VARCHAR(36) NOT NULL,
  category VARCHAR(100),
  tags TEXT,
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id),
  INDEX idx_slug (slug),
  INDEX idx_status (status),
  INDEX idx_published (published_at),
  FULLTEXT idx_search (title, excerpt, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ CART_ITEMS : has
    USERS ||--o{ ORDERS : places
    USERS ||--o{ ADDRESSES : has
    USERS ||--o{ REVIEWS : writes
    USERS ||--o{ WISHLIST : maintains
    USERS ||--o{ BLOG_POSTS : authors
    
    CATEGORIES ||--o{ CATEGORIES : "parent-child"
    CATEGORIES ||--o{ PRODUCTS : contains
    
    PRODUCTS ||--o{ PRODUCT_IMAGES : has
    PRODUCTS ||--o{ PRODUCT_VARIANTS : has
    PRODUCTS ||--o{ PRODUCT_FEATURES : has
    PRODUCTS ||--o{ PRODUCT_SPECIFICATIONS : has
    PRODUCTS ||--o{ PRODUCT_TAGS : has
    PRODUCTS ||--o{ CART_ITEMS : "added to"
    PRODUCTS ||--o{ ORDER_ITEMS : "ordered in"
    PRODUCTS ||--o{ REVIEWS : receives
    PRODUCTS ||--o{ WISHLIST : "saved in"
    
    PRODUCT_VARIANTS ||--o{ CART_ITEMS : selected
    PRODUCT_VARIANTS ||--o{ ORDER_ITEMS : selected
    
    ADDRESSES ||--o{ ORDERS : "shipped to"
    
    ORDERS ||--o{ ORDER_ITEMS : contains
    ORDERS ||--o{ REVIEWS : "reviewed from"
    ORDERS ||--o{ COUPON_USAGE : uses
    
    COUPONS ||--o{ COUPON_USAGE : "used in"
```

---

## Authentication

### JWT Token System

**Access Token**
- Lifetime: 15 minutes
- Used for: API authorization
- Header: `Authorization: Bearer <token>`

**Refresh Token**
- Lifetime: 7 days
- Storage: HTTP-only cookie
- Used for: Generating new access tokens

### Protected Routes

Include access token in Authorization header:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Role-Based Access Control

- **customer**: Regular users (shopping, orders, reviews)
- **admin**: Full access (manage products, orders, users)

---

## API Endpoints

### 1. Authentication Endpoints

#### 1.1 Register User
```http
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+919876543210"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "accessToken": "jwt-token"
  }
}
```

#### 1.2 Login User
```http
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "customer"
    },
    "accessToken": "jwt-token"
  }
}
```

#### 1.3 Get Current User
```http
GET /api/v1/auth/me
Auth: Required
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "phone": "+919876543210",
    "role": "customer",
    "created_at": "2025-01-16T10:00:00.000Z"
  }
}
```

#### 1.4 Refresh Token
```http
POST /api/v1/auth/refresh-token
Cookie: refreshToken=<token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new-jwt-token"
  }
}
```

#### 1.5 Logout
```http
POST /api/v1/auth/logout
Auth: Required
```

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

---

### 2. Products Endpoints

#### 2.1 Get All Products
```http
GET /api/v1/products
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `category` (string): Filter by category slug
- `search` (string): Search in name/description
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `sort` (string): Sort by (price_asc, price_desc, name_asc, name_desc, newest, popular)
- `inStock` (boolean): Filter in-stock products
- `featured` (boolean): Filter featured products

**Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Pure Desi Cow Ghee",
        "slug": "pure-desi-cow-ghee",
        "price": 850,
        "comparePrice": 1000,
        "images": ["/golden-ghee.jpg"],
        "category": {
          "id": 1,
          "name": "Ghee",
          "slug": "ghee"
        },
        "rating": 4.8,
        "reviewCount": 234,
        "inStock": true,
        "badge": "Bestseller"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

#### 2.2 Get Product by ID/Slug
```http
GET /api/v1/products/:identifier
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Pure Desi Cow Ghee",
    "slug": "pure-desi-cow-ghee",
    "description": "Full description...",
    "shortDescription": "Brief description",
    "price": 850,
    "comparePrice": 1000,
    "images": [
      {
        "id": 1,
        "url": "/golden-ghee.jpg",
        "altText": "Pure Desi Cow Ghee",
        "isPrimary": true
      }
    ],
    "category": {
      "id": 1,
      "name": "Ghee",
      "slug": "ghee"
    },
    "variants": [
      {
        "id": "var-1",
        "name": "500g",
        "price": 450,
        "sku": "GHEE-001-500G",
        "stockQuantity": 50
      }
    ],
    "features": [
      "Made from A2 milk",
      "Traditional bilona method"
    ],
    "specifications": {
      "Weight": "500g",
      "Shelf Life": "12 months"
    },
    "tags": ["ghee", "organic", "traditional"],
    "rating": 4.8,
    "reviewCount": 234,
    "inStock": true
  }
}
```

#### 2.3 Create Product (Admin Only)
```http
POST /api/v1/products
Auth: Required (Admin)
```

**Request Body:**
```json
{
  "name": "Organic Honey",
  "description": "Pure organic honey...",
  "shortDescription": "Pure honey from Himalayas",
  "categoryId": 5,
  "sku": "HONEY-001",
  "price": 450,
  "comparePrice": 550,
  "weight": 0.5,
  "weightUnit": "kg",
  "stockQuantity": 100,
  "images": [
    {
      "url": "/honey.jpg",
      "altText": "Organic Honey",
      "isPrimary": true
    }
  ],
  "variants": [
    {
      "name": "250g",
      "sku": "HONEY-001-250G",
      "price": 250,
      "stockQuantity": 50
    }
  ],
  "features": [
    "100% pure and natural",
    "No added sugar"
  ],
  "specifications": {
    "Origin": "Himalayas",
    "Type": "Raw Honey"
  },
  "tags": ["honey", "organic", "natural"]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 10,
    "slug": "organic-honey"
  }
}
```

#### 2.4 Update Product (Admin Only)
```http
PUT /api/v1/products/:id
Auth: Required (Admin)
```

**Request Body:** Same as create (partial updates allowed)

**Response (200):**
```json
{
  "success": true,
  "message": "Product updated successfully"
}
```

#### 2.5 Delete Product (Admin Only)
```http
DELETE /api/v1/products/:id
Auth: Required (Admin)
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

### 3. Categories Endpoints

#### 3.1 Get All Categories
```http
GET /api/v1/categories
```

**Query Parameters:**
- `includeSubcategories` (boolean): Include child categories

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Ghee",
      "slug": "ghee",
      "parent": null,
      "productCount": 12,
      "subcategories": []
    },
    {
      "id": 2,
      "name": "Spices",
      "slug": "spices",
      "parent": null,
      "productCount": 24,
      "subcategories": [
        {
          "id": 3,
          "name": "Turmeric",
          "slug": "turmeric",
          "productCount": 8
        }
      ]
    }
  ]
}
```

#### 3.2 Create Category (Admin Only)
```http
POST /api/v1/categories
Auth: Required (Admin)
```

**Request Body:**
```json
{
  "name": "Dry Fruits",
  "parentId": null,
  "description": "Premium dry fruits"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": 5,
    "slug": "dry-fruits"
  }
}
```

#### 3.3 Update Category (Admin Only)
```http
PUT /api/v1/categories/:id
Auth: Required (Admin)
```

#### 3.4 Delete Category (Admin Only)
```http
DELETE /api/v1/categories/:id
Auth: Required (Admin)
```

---

### 4. Cart Endpoints

#### 4.1 Get User Cart
```http
GET /api/v1/cart
Auth: Required
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "product": {
          "id": 1,
          "name": "Pure Desi Cow Ghee",
          "image": "/ghee.jpg",
          "price": 850
        },
        "variant": {
          "id": "var-1",
          "name": "1kg"
        },
        "quantity": 2,
        "price": 850,
        "subtotal": 1700
      }
    ],
    "summary": {
      "subtotal": 1700,
      "discount": 0,
      "shipping": 0,
      "tax": 0,
      "total": 1700,
      "itemCount": 2
    }
  }
}
```

#### 4.2 Add Item to Cart
```http
POST /api/v1/cart
Auth: Required
```

**Request Body:**
```json
{
  "productId": 1,
  "variantId": "var-1",
  "quantity": 2
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "itemId": 1
  }
}
```

#### 4.3 Update Cart Item Quantity
```http
PUT /api/v1/cart/:itemId
Auth: Required
```

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Cart updated successfully"
}
```

#### 4.4 Remove Item from Cart
```http
DELETE /api/v1/cart/:itemId
Auth: Required
```

**Response (200):**
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

#### 4.5 Clear Cart
```http
DELETE /api/v1/cart
Auth: Required
```

**Response (200):**
```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

---

### 5. Orders Endpoints

#### 5.1 Create Order
```http
POST /api/v1/orders
Auth: Required
```

**Request Body:**
```json
{
  "addressId": "addr-uuid",
  "paymentMethod": "cod",
  "couponCode": "WELCOME10",
  "notes": "Please deliver before 5 PM"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "orderId": "order-uuid",
    "orderNumber": "ORD-20250116-1234",
    "totalAmount": 1700,
    "status": "pending"
  }
}
```

#### 5.2 Get User Orders
```http
GET /api/v1/orders
Auth: Required
```

**Query Parameters:**
- `page`, `limit`, `status`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order-uuid",
        "orderNumber": "ORD-20250116-1234",
        "totalAmount": 1700,
        "status": "delivered",
        "itemCount": 2,
        "createdAt": "2025-01-16T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "total": 10
    }
  }
}
```

#### 5.3 Get Order Details
```http
GET /api/v1/orders/:id
Auth: Required
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "order-uuid",
    "orderNumber": "ORD-20250116-1234",
    "status": "delivered",
    "paymentStatus": "paid",
    "items": [
      {
        "productName": "Pure Desi Cow Ghee",
        "variantName": "1kg",
        "quantity": 2,
        "price": 850,
        "subtotal": 1700
      }
    ],
    "address": {
      "fullName": "John Doe",
      "phone": "+919876543210",
      "addressLine1": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "postalCode": "400001"
    },
    "summary": {
      "subtotal": 1700,
      "discount": 0,
      "shipping": 0,
      "tax": 0,
      "total": 1700
    },
    "trackingNumber": "TRACK123",
    "createdAt": "2025-01-16T10:00:00.000Z",
    "deliveredAt": "2025-01-18T15:30:00.000Z"
  }
}
```

#### 5.4 Cancel Order
```http
POST /api/v1/orders/:id/cancel
Auth: Required
```

**Response (200):**
```json
{
  "success": true,
  "message": "Order cancelled successfully"
}
```

#### 5.5 Get All Orders (Admin Only)
```http
GET /api/v1/admin/orders
Auth: Required (Admin)
```

**Query Parameters:**
- `page`, `limit`, `status`, `search`

#### 5.6 Update Order Status (Admin Only)
```http
PUT /api/v1/admin/orders/:id/status
Auth: Required (Admin)
```

**Request Body:**
```json
{
  "status": "shipped",
  "trackingNumber": "TRACK123"
}
```

---

### 6. Reviews Endpoints

#### 6.1 Get Product Reviews
```http
GET /api/v1/products/:productId/reviews
```

**Query Parameters:**
- `page`, `limit`, `sort` (newest, helpful, rating_high, rating_low)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": 1,
        "user": {
          "name": "Priya Sharma",
          "initials": "PS"
        },
        "rating": 5,
        "title": "Best ghee ever!",
        "comment": "Amazing quality...",
        "isVerified": true,
        "helpfulCount": 24,
        "createdAt": "2025-01-15T10:00:00.000Z"
      }
    ],
    "summary": {
      "averageRating": 4.8,
      "totalReviews": 234,
      "ratingDistribution": {
        "5": 180,
        "4": 40,
        "3": 10,
        "2": 3,
        "1": 1
      }
    }
  }
}
```

#### 6.2 Create Review
```http
POST /api/v1/products/:productId/reviews
Auth: Required
```

**Request Body:**
```json
{
  "orderId": "order-uuid",
  "rating": 5,
  "title": "Excellent product",
  "comment": "Very satisfied with the quality..."
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Review submitted successfully"
}
```

#### 6.3 Mark Review as Helpful
```http
POST /api/v1/reviews/:id/helpful
Auth: Required
```

---

### 7. Wishlist Endpoints

#### 7.1 Get User Wishlist
```http
GET /api/v1/wishlist
Auth: Required
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "product": {
        "id": 3,
        "name": "Premium Kashmiri Almonds",
        "slug": "premium-kashmiri-almonds",
        "price": 650,
        "image": "/almonds.jpg",
        "inStock": true
      },
      "addedAt": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

#### 7.2 Add to Wishlist
```http
POST /api/v1/wishlist
Auth: Required
```

**Request Body:**
```json
{
  "productId": 3
}
```

#### 7.3 Remove from Wishlist
```http
DELETE /api/v1/wishlist/:productId
Auth: Required
```

---

### 8. Addresses Endpoints

#### 8.1 Get User Addresses
```http
GET /api/v1/addresses
Auth: Required
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "addr-uuid",
      "fullName": "John Doe",
      "phone": "+919876543210",
      "addressLine1": "123 Main St",
      "addressLine2": "Apt 4B",
      "city": "Mumbai",
      "state": "Maharashtra",
      "postalCode": "400001",
      "country": "India",
      "addressType": "home",
      "isDefault": true
    }
  ]
}
```

#### 8.2 Create Address
```http
POST /api/v1/addresses
Auth: Required
```

**Request Body:**
```json
{
  "fullName": "John Doe",
  "phone": "+919876543210",
  "addressLine1": "123 Main St",
  "addressLine2": "Apt 4B",
  "city": "Mumbai",
  "state": "Maharashtra",
  "postalCode": "400001",
  "addressType": "home",
  "isDefault": true
}
```

#### 8.3 Update Address
```http
PUT /api/v1/addresses/:id
Auth: Required
```

#### 8.4 Delete Address
```http
DELETE /api/v1/addresses/:id
Auth: Required
```

#### 8.5 Set Default Address
```http
PUT /api/v1/addresses/:id/default
Auth: Required
```

---

### 9. Coupons Endpoints (Admin)

#### 9.1 Get All Coupons
```http
GET /api/v1/admin/coupons
Auth: Required (Admin)
```

#### 9.2 Create Coupon
```http
POST /api/v1/admin/coupons
Auth: Required (Admin)
```

**Request Body:**
```json
{
  "code": "WELCOME10",
  "description": "10% off for new users",
  "discountType": "percentage",
  "discountValue": 10,
  "minOrderAmount": 500,
  "maxDiscountAmount": 200,
  "usageLimit": 100,
  "perUserLimit": 1,
  "validFrom": "2025-01-01T00:00:00.000Z",
  "validUntil": "2025-12-31T23:59:59.000Z"
}
```

#### 9.3 Validate Coupon (Customer)
```http
POST /api/v1/coupons/validate
Auth: Required
```

**Request Body:**
```json
{
  "code": "WELCOME10",
  "orderAmount": 1000
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "discountAmount": 100,
    "finalAmount": 900
  }
}
```

---

### 10. Customers Endpoints (Admin)

#### 10.1 Get All Customers
```http
GET /api/v1/admin/customers
Auth: Required (Admin)
```

**Query Parameters:**
- `page`, `limit`, `search`, `sort`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "id": "user-uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+919876543210",
        "totalOrders": 5,
        "totalSpent": 8500,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "total": 150
    }
  }
}
```

#### 10.2 Get Customer Details
```http
GET /api/v1/admin/customers/:id
Auth: Required (Admin)
```

---

### 11. Blog Endpoints

#### 11.1 Get All Blog Posts
```http
GET /api/v1/blog
```

**Query Parameters:**
- `page`, `limit`, `category`, `search`

#### 11.2 Get Blog Post by Slug
```http
GET /api/v1/blog/:slug
```

#### 11.3 Create Blog Post (Admin)
```http
POST /api/v1/admin/blog
Auth: Required (Admin)
```

**Request Body:**
```json
{
  "title": "Health Benefits of Ghee",
  "content": "Full article content...",
  "excerpt": "Discover the amazing benefits...",
  "featuredImage": "/blog/ghee-benefits.jpg",
  "category": "Health",
  "tags": ["ghee", "health", "nutrition"],
  "status": "published"
}
```

---

### 12. Reports Endpoints (Admin)

#### 12.1 Get Dashboard Stats
```http
GET /api/v1/admin/reports/dashboard
Auth: Required (Admin)
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 125000,
    "totalOrders": 450,
    "totalCustomers": 180,
    "averageOrderValue": 2777,
    "revenueGrowth": 12.5,
    "ordersGrowth": 8.3,
    "topProducts": [
      {
        "id": 1,
        "name": "Pure Desi Cow Ghee",
        "revenue": 45000,
        "unitsSold": 530
      }
    ],
    "recentOrders": [],
    "salesChart": {
      "labels": ["Jan", "Feb", "Mar"],
      "data": [35000, 42000, 48000]
    }
  }
}
```

#### 12.2 Get Sales Report
```http
GET /api/v1/admin/reports/sales
Auth: Required (Admin)
```

**Query Parameters:**
- `startDate`, `endDate`, `groupBy` (day, week, month)

---

## Implementation Guidelines

### File Structure

```
backend/src/
├── controllers/
│   ├── authController.js (✅ Already implemented)
│   ├── productController.js (❌ TO IMPLEMENT)
│   ├── categoryController.js (❌ TO IMPLEMENT)
│   ├── cartController.js (❌ TO IMPLEMENT)
│   ├── orderController.js (❌ TO IMPLEMENT)
│   ├── reviewController.js (❌ TO IMPLEMENT)
│   ├── wishlistController.js (❌ TO IMPLEMENT)
│   ├── addressController.js (❌ TO IMPLEMENT)
│   ├── couponController.js (❌ TO IMPLEMENT)
│   ├── customerController.js (❌ TO IMPLEMENT)
│   ├── blogController.js (❌ TO IMPLEMENT)
│   └── reportController.js (❌ TO IMPLEMENT)
├── models/
│   ├── userModel.js (✅ Already implemented)
│   ├── productModel.js (❌ TO IMPLEMENT)
│   ├── categoryModel.js (❌ TO IMPLEMENT)
│   ├── cartModel.js (❌ TO IMPLEMENT)
│   ├── orderModel.js (❌ TO IMPLEMENT)
│   ├── reviewModel.js (❌ TO IMPLEMENT)
│   ├── wishlistModel.js (❌ TO IMPLEMENT)
│   ├── addressModel.js (❌ TO IMPLEMENT)
│   ├── couponModel.js (❌ TO IMPLEMENT)
│   └── blogModel.js (❌ TO IMPLEMENT)
├── routes/
│   ├── authRoutes.js (✅ Already implemented)
│   ├── productRoutes.js (❌ TO IMPLEMENT)
│   ├── categoryRoutes.js (❌ TO IMPLEMENT)
│   ├── cartRoutes.js (❌ TO IMPLEMENT)
│   ├── orderRoutes.js (❌ TO IMPLEMENT)
│   ├── reviewRoutes.js (❌ TO IMPLEMENT)
│   ├── wishlistRoutes.js (❌ TO IMPLEMENT)
│   ├── addressRoutes.js (❌ TO IMPLEMENT)
│   ├── couponRoutes.js (❌ TO IMPLEMENT)
│   ├── adminRoutes.js (❌ TO IMPLEMENT)
│   └── blogRoutes.js (❌ TO IMPLEMENT)
└── services/
    ├── authService.js (✅ Already implemented)
    ├── productService.js (❌ TO IMPLEMENT)
    ├── orderService.js (❌ TO IMPLEMENT)
    └── reportService.js (❌ TO IMPLEMENT)
```

### Implementation Steps

1. **Database Setup**
   - Run the SQL schema to create all tables
   - Verify foreign key relationships
   - Add indexes for performance

2. **Models Layer**
   - Create model classes for each entity
   - Follow the pattern from `userModel.js`
   - Include CRUD operations and business logic

3. **Controllers Layer**
   - Implement request handlers
   - Validate input using `express-validator`
   - Call model/service methods
   - Return consistent JSON responses

4. **Routes Layer**
   - Define API endpoints
   - Apply authentication middleware
   - Apply role-based authorization
   - Add validation middleware

5. **Testing**
   - Test each endpoint with Postman
   - Verify authentication and authorization
   - Test error cases
   - Check database integrity

### Code Example: Product Model

```javascript
// src/models/productModel.js
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

class ProductModel {
  
  static async findAll(filters = {}) {
    const { page = 1, limit = 20, category, search, minPrice, maxPrice, sort = 'newest' } = filters;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug,
             (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = TRUE
    `;
    
    const params = [];
    
    if (category) {
      query += ` AND c.slug = ?`;
      params.push(category);
    }
    
    if (search) {
      query += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    if (minPrice) {
      query += ` AND p.price >= ?`;
      params.push(minPrice);
    }
    
    if (maxPrice) {
      query += ` AND p.price <= ?`;
      params.push(maxPrice);
    }
    
    // Add sorting
    switch(sort) {
      case 'price_asc':
        query += ` ORDER BY p.price ASC`;
        break;
      case 'price_desc':
        query += ` ORDER BY p.price DESC`;
        break;
      case 'name_asc':
        query += ` ORDER BY p.name ASC`;
        break;
      case 'popular':
        query += ` ORDER BY p.review_count DESC, p.rating DESC`;
        break;
      default:
        query += ` ORDER BY p.created_at DESC`;
    }
    
    query += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    const [products] = await db.query(query, params);
    
    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM products WHERE is_active = TRUE`,
      []
    );
    
    return {
      products,
      total: countResult[0].total,
      page,
      pages: Math.ceil(countResult[0].total / limit)
    };
  }
  
  static async findById(id) {
    const [products] = await db.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );
    
    if (!products.length) return null;
    
    const product = products[0];
    
    // Get images
    const [images] = await db.query(
      `SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order`,
      [id]
    );
    product.images = images;
    
    // Get variants
    const [variants] = await db.query(
      `SELECT * FROM product_variants WHERE product_id = ? AND is_active = TRUE`,
      [id]
    );
    product.variants = variants;
    
    // Get features
    const [features] = await db.query(
      `SELECT feature_text FROM product_features WHERE product_id = ? ORDER BY display_order`,
      [id]
    );
    product.features = features.map(f => f.feature_text);
    
    // Get specifications
    const [specs] = await db.query(
      `SELECT spec_key, spec_value FROM product_specifications WHERE product_id = ? ORDER BY display_order`,
      [id]
    );
    product.specifications = specs.reduce((acc, s) => {
      acc[s.spec_key] = s.spec_value;
      return acc;
    }, {});
    
    // Get tags
    const [tags] = await db.query(
      `SELECT tag FROM product_tags WHERE product_id = ?`,
      [id]
    );
    product.tags = tags.map(t => t.tag);
    
    return product;
  }
  
  static async create(productData) {
    const {
      name, description, shortDescription, categoryId, sku,
      price, comparePrice, weight, weightUnit, stockQuantity,
      images, variants, features, specifications, tags
    } = productData;
    
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    // Insert product
    const [result] = await db.query(
      `INSERT INTO products (name, slug, description, short_description, category_id, sku, price, compare_price, weight, weight_unit, stock_quantity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, slug, description, shortDescription, categoryId, sku, price, comparePrice, weight, weightUnit, stockQuantity]
    );
    
    const productId = result.insertId;
    
    // Insert images
    if (images && images.length) {
      for (let i = 0; i < images.length; i++) {
        await db.query(
          `INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
           VALUES (?, ?, ?, ?, ?)`,
          [productId, images[i].url, images[i].altText || name, i, images[i].isPrimary || i === 0]
        );
      }
    }
    
    // Insert variants
    if (variants && variants.length) {
      for (const variant of variants) {
        await db.query(
          `INSERT INTO product_variants (id, product_id, name, sku, price, stock_quantity)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [uuidv4(), productId, variant.name, variant.sku, variant.price, variant.stockQuantity]
        );
      }
    }
    
    // Insert features
    if (features && features.length) {
      for (let i = 0; i < features.length; i++) {
        await db.query(
          `INSERT INTO product_features (product_id, feature_text, display_order)
           VALUES (?, ?, ?)`,
          [productId, features[i], i]
        );
      }
    }
    
    // Insert specifications
    if (specifications) {
      let order = 0;
      for (const [key, value] of Object.entries(specifications)) {
        await db.query(
          `INSERT INTO product_specifications (product_id, spec_key, spec_value, display_order)
           VALUES (?, ?, ?, ?)`,
          [productId, key, value, order++]
        );
      }
    }
    
    // Insert tags
    if (tags && tags.length) {
      for (const tag of tags) {
        await db.query(
          `INSERT INTO product_tags (product_id, tag) VALUES (?, ?)`,
          [productId, tag]
        );
      }
    }
    
    return { id: productId, slug };
  }
  
  static async update(id, productData) {
    // Similar to create but with UPDATE queries
    // Implementation left as exercise
  }
  
  static async delete(id) {
    await db.query(`DELETE FROM products WHERE id = ?`, [id]);
    return true;
  }
}

module.exports = ProductModel;
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "value": "invalid-email"
    }
  ]
}
```

### HTTP Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate resource
- `422 Unprocessable Entity` - Validation failed
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

## Testing

### Testing Checklist

- [ ] All database tables created successfully
- [ ] Foreign key constraints working
- [ ] Authentication endpoints tested
- [ ] Product CRUD operations tested
- [ ] Cart operations tested
- [ ] Order creation and management tested
- [ ] Review system tested
- [ ] Admin endpoints tested with proper authorization
- [ ] Error handling verified
- [ ] Input validation working
- [ ] Rate limiting tested

### Postman Collection

Create a Postman collection with:
1. Environment variables (API_URL, ACCESS_TOKEN)
2. Pre-request scripts for authentication
3. Test scripts for response validation
4. Organized folders for each endpoint group

---

## Next Steps for Interns

1. **Week 1: Database & Models**
   - Set up database with all tables
   - Implement Product, Category, and Cart models
   - Test CRUD operations

2. **Week 2: Core Features**
   - Implement Product endpoints
   - Implement Category endpoints
   - Implement Cart endpoints

3. **Week 3: Orders & Reviews**
   - Implement Order endpoints
   - Implement Review endpoints
   - Implement Wishlist endpoints

4. **Week 4: Admin & Polish**
   - Implement Admin endpoints
   - Implement Reports
   - Testing and bug fixes

---

## Support & Questions

For any questions or clarifications:
- Review existing `authController.js` for reference
- Check `userModel.js` for model patterns
- Follow the same coding style and patterns
- Add comprehensive comments
- Test thoroughly before committing

**Good luck with the implementation! 🚀**
