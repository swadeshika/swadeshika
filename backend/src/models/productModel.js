// src/models/productModel.js

const db = require('../config/db');

class ProductModel {

  /**
   * Find all products with pagination and filters
   */
  static async findAll({ page = 1, limit = 20, category, search, minPrice, maxPrice, sort, inStock, featured, fields }) {
    const offset = (page - 1) * limit;
    const params = [];

    // Whitelist of allowed columns to prevent SQL injection
    const allowedColumns = [
      'id', 'name', 'slug', 'description', 'short_description', 'sku',
      'price', 'compare_price', 'cost_price', 'weight', 'weight_unit',
      'stock_quantity', 'is_featured', 'review_count', 'average_rating',
      'created_at', 'updated_at'
    ];

    // Default selection
    let selectClause = 'p.*';

    // If specific fields are requested
    if (fields) {
      const requestedFields = fields.split(',').map(f => f.trim());
      const validFields = requestedFields.filter(f => allowedColumns.includes(f));

      if (validFields.length > 0) {
        // Always include ID and ensure fields are prefixed with table alias 'p'
        const dbFields = validFields.map(f => `p.${f}`);
        if (!validFields.includes('id')) dbFields.unshift('p.id');
        selectClause = dbFields.join(', ');
      }
    }

    let sql = `
      SELECT ${selectClause}, c.name as category_name, c.slug as category_slug,
             (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;

    if (category) {
      sql += ` AND c.slug = ?`;
      params.push(category);
    }

    if (search) {
      sql += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (minPrice) {
      sql += ` AND p.price >= ?`;
      params.push(minPrice);
    }

    if (maxPrice) {
      sql += ` AND p.price <= ?`;
      params.push(maxPrice);
    }

    if (inStock === 'true') {
      sql += ` AND p.in_stock = 1`;
    }

    if (featured === 'true') {
      sql += ` AND p.is_featured = 1`;
    }

    // Sorting
    if (sort === 'price_asc') sql += ` ORDER BY p.price ASC`;
    else if (sort === 'price_desc') sql += ` ORDER BY p.price DESC`;
    else if (sort === 'name_asc') sql += ` ORDER BY p.name ASC`;
    else if (sort === 'name_desc') sql += ` ORDER BY p.name DESC`;
    else if (sort === 'newest') sql += ` ORDER BY p.created_at DESC`;
    else if (sort === 'popular') sql += ` ORDER BY p.review_count DESC`;
    else sql += ` ORDER BY p.created_at DESC`; // Default sort

    // Pagination
    sql += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [products] = await db.query(sql, params);

    // Get total count for pagination
    let countSql = `
      SELECT COUNT(*) as total 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE 1=1
    `;

    // Re-use filter logic for count (excluding limit/offset/sort)
    const countParams = [];
    if (category) { countSql += ` AND c.slug = ?`; countParams.push(category); }
    if (search) { countSql += ` AND (p.name LIKE ? OR p.description LIKE ?)`; countParams.push(`%${search}%`, `%${search}%`); }
    if (minPrice) { countSql += ` AND p.price >= ?`; countParams.push(minPrice); }
    if (maxPrice) { countSql += ` AND p.price <= ?`; countParams.push(maxPrice); }
    if (inStock === 'true') countSql += ` AND p.in_stock = 1`;
    if (featured === 'true') countSql += ` AND p.is_featured = 1`;

    const [countResult] = await db.query(countSql, countParams);
    const total = countResult[0].total;

    return { products, total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) };
  }

  /**
   * Find product by ID or Slug with all details
   * 
   * CRITICAL FIX: Proper ID vs Slug Detection
   * ==========================================
   * 
   * PROBLEM (Before):
   * - Used !isNaN(identifier) which doesn't work correctly
   * - isNaN("123") returns false, so !isNaN("123") returns true ✓
   * - isNaN("pure-desi-cow-ghee") returns true, so !isNaN() returns false ✓
   * - BUT: isNaN() has edge cases with empty strings, whitespace, etc.
   * 
   * SOLUTION (Now):
   * - Check if identifier is a string that contains only digits
   * - Use Number.isInteger(Number(identifier)) for robust detection
   * - This correctly identifies "123" as ID and "pure-desi-cow-ghee" as slug
   * 
   * WHY THIS MATTERS:
   * - Product details pages use slugs in URLs (/products/pure-desi-cow-ghee)
   * - Admin panel uses IDs (/admin/products/123)
   * - Wrong detection = 404 errors for all product pages
   */
  static async findByIdOrSlug(identifier) {
    // Robust check: Is this a numeric ID or a string slug?
    // Number.isInteger(Number(x)) correctly handles:
    // - "123" → true (numeric ID)
    // - "pure-desi-cow-ghee" → false (string slug)
    // - 123 → true (numeric ID)
    const isId = Number.isInteger(Number(identifier)) && String(identifier) === String(Number(identifier));
    
    const sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${isId ? 'p.id = ?' : 'p.slug = ?'}
    `;

    const [rows] = await db.query(sql, [identifier]);
    if (!rows.length) return null;

    const product = rows[0];

    // Fetch related data in parallel
    const [images] = await db.query(`SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order`, [product.id]);
    const [variants] = await db.query(`SELECT * FROM product_variants WHERE product_id = ?`, [product.id]);
    const [features] = await db.query(`SELECT * FROM product_features WHERE product_id = ? ORDER BY display_order`, [product.id]);
    const [specs] = await db.query(`SELECT * FROM product_specifications WHERE product_id = ? ORDER BY display_order`, [product.id]);
    const [tags] = await db.query(`SELECT tag FROM product_tags WHERE product_id = ?`, [product.id]);

    return {
      ...product,
      images,
      variants,
      features: features.map(f => f.feature_text),
      specifications: specs.reduce((acc, s) => ({ ...acc, [s.spec_key]: s.spec_value }), {}),
      tags: tags.map(t => t.tag)
    };
  }

  /**
   * Create a new product with all related data (Transaction)
   */
  static async create(data) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Insert Product
      const [res] = await conn.query(
        `INSERT INTO products (name, slug, description, short_description, category_id, sku, price, compare_price, cost_price, weight, weight_unit, stock_quantity, is_featured, meta_title, meta_description) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.name, data.slug, data.description, data.short_description, data.category_id, data.sku,
          data.price, data.compare_price, data.cost_price, data.weight, data.weight_unit || 'kg',
          data.stock_quantity || 0, data.is_featured || false, data.meta_title, data.meta_description
        ]
      );
      const productId = res.insertId;

      // 2. Insert Images
      if (data.images && data.images.length) {
        const imageValues = data.images.map(img => [productId, img.url, img.alt_text, img.is_primary || false, img.display_order || 0]);
        await conn.query(
          `INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order) VALUES ?`,
          [imageValues]
        );
      }

      // 3. Insert Variants
      if (data.variants && data.variants.length) {
        const variantValues = data.variants.map(v => [productId, v.name, v.sku, v.price, v.compare_price || null, v.stock_quantity || 0]);
        await conn.query(
          `INSERT INTO product_variants (product_id, name, sku, price, compare_price, stock_quantity) VALUES ?`,
          [variantValues]
        );
      }

      // 4. Insert Features
      if (data.features && data.features.length) {
        const featureValues = data.features.map((f, i) => [productId, f, i]);
        await conn.query(
          `INSERT INTO product_features (product_id, feature_text, display_order) VALUES ?`,
          [featureValues]
        );
      }

      // 5. Insert Specifications
      if (data.specifications) {
        const specValues = Object.entries(data.specifications).map(([key, value], i) => [productId, key, value, i]);
        if (specValues.length) {
          await conn.query(
            `INSERT INTO product_specifications (product_id, spec_key, spec_value, display_order) VALUES ?`,
            [specValues]
          );
        }
      }

      // 6. Insert Tags
      if (data.tags && data.tags.length) {
        const tagValues = data.tags.map(t => [productId, t]);
        await conn.query(
          `INSERT INTO product_tags (product_id, tag) VALUES ?`,
          [tagValues]
        );
      }

      await conn.commit();
      return productId;

    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Update product and related data
   */
  static async update(id, data) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Update Product Fields
      await conn.query(
        `UPDATE products SET 
         name=?, slug=?, description=?, short_description=?, category_id=?, sku=?, price=?, compare_price=?, 
         weight=?, weight_unit=?, stock_quantity=?, is_featured=?, meta_title=?, meta_description=?, updated_at=NOW()
         WHERE id=?`,
        [
          data.name, data.slug, data.description, data.short_description, data.category_id, data.sku,
          data.price, data.compare_price, data.weight, data.weight_unit,
          data.stock_quantity, data.is_featured, data.meta_title, data.meta_description, id
        ]
      );

      // 2. Update Related Data (Strategy: Delete all and Re-insert for simplicity, or smart update)
      // For simplicity in this iteration, we will clear and re-insert lists if provided.

      if (data.images) {
        await conn.query(`DELETE FROM product_images WHERE product_id = ?`, [id]);
        if (data.images.length) {
          const imageValues = data.images.map(img => [id, img.url, img.alt_text, img.is_primary || false, img.display_order || 0]);
          await conn.query(`INSERT INTO product_images (product_id, image_url, alt_text, is_primary, display_order) VALUES ?`, [imageValues]);
        }
      }

      if (data.variants) {
        // Note: Deleting variants might be risky if they are referenced in orders/cart. 
        // Ideally we should update existing ones and insert new ones.
        // For now, assuming full replacement is requested.
        // TODO: Handle referential integrity if variants are used.
        await conn.query(`DELETE FROM product_variants WHERE product_id = ?`, [id]);
        if (data.variants.length) {
          const variantValues = data.variants.map(v => [id, v.name, v.sku, v.price, v.compare_price || null, v.stock_quantity || 0]);
          await conn.query(`INSERT INTO product_variants (product_id, name, sku, price, compare_price, stock_quantity) VALUES ?`, [variantValues]);
        }
      }

      if (data.features) {
        await conn.query(`DELETE FROM product_features WHERE product_id = ?`, [id]);
        if (data.features.length) {
          const featureValues = data.features.map((f, i) => [id, f, i]);
          await conn.query(`INSERT INTO product_features (product_id, feature_text, display_order) VALUES ?`, [featureValues]);
        }
      }

      if (data.specifications) {
        await conn.query(`DELETE FROM product_specifications WHERE product_id = ?`, [id]);
        const specValues = Object.entries(data.specifications).map(([key, value], i) => [id, key, value, i]);
        if (specValues.length) {
          await conn.query(`INSERT INTO product_specifications (product_id, spec_key, spec_value, display_order) VALUES ?`, [specValues]);
        }
      }

      if (data.tags) {
        await conn.query(`DELETE FROM product_tags WHERE product_id = ?`, [id]);
        if (data.tags.length) {
          const tagValues = data.tags.map(t => [id, t]);
          await conn.query(`INSERT INTO product_tags (product_id, tag) VALUES ?`, [tagValues]);
        }
      }

      await conn.commit();
      return true;

    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  /**
   * Delete product
   */
  static async delete(id) {
    // Cascading delete in DB handles related tables, but good to be explicit or check constraints
    await db.query(`DELETE FROM products WHERE id = ?`, [id]);
    return true;
  }
}

module.exports = ProductModel;
