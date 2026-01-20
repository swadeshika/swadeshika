// src/models/productModel.js

const db = require('../config/db');

// Helper to convert relative upload paths to absolute URLs
function toAssetUrl(p) {
  if (!p) return p;
  
  // CRITICAL FIX: Handle Cloudinary URLs and strip double-prefixes if present
  if (String(p).includes('cloudinary.com')) {
      // If the URL is double-prefixed (e.g. https://backend...https://res.cloudinary...), strip the prefix
      const match = String(p).match(/(https?:\/\/res\.cloudinary\.com.*)/);
      return match ? match[1] : p;
  }

  const backendBase = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;

  // If already absolute URL but points to old dev host (127.0.0.1:5000 or localhost:5000), rewrite it
  if (p.startsWith('http://') || p.startsWith('https://')) {
    const oldHostRegex = /^https?:\/\/(?:127\.0\.0\.1|localhost):5000/;
    if (oldHostRegex.test(p)) {
      return p.replace(oldHostRegex, backendBase);
    }
    return p;
  }

  // Relative path -> prefix with backend base
  if (p.startsWith('/')) return `${backendBase}${p}`;
  return `${backendBase}/${p}`;
}

// Small HTML entity unescape helper to convert &lt; &gt; &amp; etc. back to characters
function unescapeHtml(s) {
  if (s == null) return s;
  // Iteratively unescape common HTML entities up to a few passes to handle
  // strings that were encoded multiple times (e.g. &amp;lt; becomes &lt; then <)
  let out = String(s);
  for (let i = 0; i < 3; i++) {
    const prev = out;
    out = out
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'");
    if (out === prev) break;
  }
  return out;
}

class ProductModel {

  /**
   * Find all products with pagination and filters
   */
  static async findAll({ page = 1, limit = 20, category, search, minPrice, maxPrice, sort, inStock, isActive, featured, fields, ids }) {
    const offset = (page - 1) * limit;
    const params = [];

    // Whitelist of allowed columns to prevent SQL injection
    /**
     * CRITICAL FIX: Missing in_stock Field
     * =====================================
     * 
     * PROBLEM:
     * - in_stock field was not in allowedColumns list
     * - API was not returning in_stock field
     * - Frontend couldn't determine stock status
     * - All products showed "Out of Stock"
     * 
     * SOLUTION:
     * - Added 'in_stock' to allowedColumns
     * - Added 'is_active' for future use
     * - Now API will return these fields
     */
    const allowedColumns = [
      'id', 'name', 'slug', 'description', 'short_description', 'sku',
      'price', 'compare_price', 'cost_price', 'weight', 'weight_unit',
      'stock_quantity', 'in_stock', 'is_active', 'is_featured', 'review_count', 'average_rating', 'status',
      'related_products',
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

    // Global Low Stock Threshold Subquery/Join (Optimized: Get value once or subquery)
    // For simplicity and correctness per row:
    const thresholdLogic = `COALESCE(p.low_stock_threshold, (SELECT low_stock_threshold FROM admin_settings LIMIT 1), 10)`;

    // Modified Select Clause to include effective threshold
    let finalSelectClause = selectClause;
    if (selectClause === 'p.*') {
      finalSelectClause = `p.*, ${thresholdLogic} as effective_low_stock_threshold`;
    }

    let sql = `
    SELECT ${finalSelectClause}, c.name as category_name, c.slug as category_slug,
           (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image,
           (SELECT COUNT(*) FROM product_variants WHERE product_id = p.id AND is_active = 1) as variant_count,
           COALESCE(
             (SELECT SUM(stock_quantity) FROM product_variants WHERE product_id = p.id),
             p.stock_quantity
           ) as stock_quantity
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

    if (ids) {
      // ids can be "1,2,3" or [1,2,3]
      const idList = Array.isArray(ids) ? ids : String(ids).split(',').map(id => id.trim());
      if (idList.length > 0) {
        const placeholders = idList.map(() => '?').join(',');
        sql += ` AND p.id IN (${placeholders})`;
        params.push(...idList);
      }
    }

    if (inStock === 'true') {
      sql += ` AND p.in_stock = 1`;
    }

    if (isActive === 'true') {
      sql += ` AND p.is_active = 1`;
    } else if (isActive === 'false') {
      sql += ` AND p.is_active = 0`;
    }
    // If isActive is undefined/null (or anything else), we don't filter, showing all (Admin behavior)

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
    else if (sort === 'featured') sql += ` ORDER BY p.is_featured DESC, p.created_at DESC`;
    else sql += ` ORDER BY p.created_at DESC`; // Default sort

    // Pagination
    sql += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [products] = await db.query(sql, params);

    // Fetch variants for all products if any exist
    if (products.length > 0) {
      const productIds = products.map(p => p.id);
      // Create placeholders for IN clause
      const placeholders = productIds.map(() => '?').join(',');
      const [variants] = await db.query(
        `SELECT id, product_id, name as variant_name, sku, price, compare_price, stock_quantity, is_active
         FROM product_variants 
         WHERE product_id IN (${placeholders}) AND is_active = 1
         ORDER BY product_id, id ASC`,
        productIds
      );

      // Group variants by product_id
      const variantsByProduct = {};
      variants.forEach(v => {
        if (!variantsByProduct[v.product_id]) {
          variantsByProduct[v.product_id] = [];
        }
        variantsByProduct[v.product_id].push(v);
      });

      // Attach variants to each product
      products.forEach(p => {
        p.variants = variantsByProduct[p.id] || [];
      });
    }

    // Normalize primary_image URLs to absolute URLs so frontend can load them
    products.forEach(p => {
      if (p.primary_image) p.primary_image = toAssetUrl(p.primary_image);
      if (p.description) p.description = unescapeHtml(p.description);
      if (p.short_description) p.short_description = unescapeHtml(p.short_description);

      // Calculate is_low_stock boolean for frontend convenience
      if (p.effective_low_stock_threshold !== undefined) {
        p.is_low_stock = p.stock_quantity <= p.effective_low_stock_threshold;
      }
    });

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
    if (isActive === 'true') {
        countSql += ` AND p.is_active = 1`;
    } else if (isActive === 'false') {
        countSql += ` AND p.is_active = 0`;
    }
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

    // Normalize image URLs and unescape description fields
    const normalizedImages = images.map(img => ({ ...img, image_url: toAssetUrl(img.image_url) }));
    if (product.description) product.description = unescapeHtml(product.description);
    if (product.short_description) product.short_description = unescapeHtml(product.short_description);

    return {
      ...product,
      images: normalizedImages,
      variants,
      features: features.map(f => f.feature_text),
      specifications: specs.reduce((acc, s) => ({ ...acc, [s.spec_key]: s.spec_value }), {}),
      tags: tags.map(t => t.tag),
      related_products: product.related_products || []
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
        `INSERT INTO products (name, slug, description, short_description, category_id, sku, price, compare_price, cost_price, weight, weight_unit, stock_quantity, in_stock, is_active, is_featured, meta_title, meta_description, related_products) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.name, data.slug, data.description, data.short_description, data.category_id, data.sku,
          data.price, data.compare_price, data.cost_price, data.weight, data.weight_unit || 'kg',
          data.stock_quantity || 0,
          // in_stock and is_active: allow frontend to control publish/status; default true
          (data.in_stock === undefined ? true : !!data.in_stock),
          (data.is_active === undefined ? true : !!data.is_active),
          data.is_featured || false, data.meta_title, data.meta_description,
          JSON.stringify(data.related_products || [])
        ]
      );
      const productId = res.insertId;

      // 2. Insert Images
      /**
       * CRITICAL FIX: Image Field Name Compatibility
       * =============================================
       * 
       * PROBLEM:
       * - Frontend sends: { url: "...", alt_text: "...", is_primary: true }
       * - Backend expects: image_url column in database
       * - Mismatch caused images not to save
       * 
       * SOLUTION:
       * - Accept both 'url' and 'image_url' from frontend
       * - Map to correct database column name
       * 
       * WHY THIS MATTERS:
       * - Product images now save correctly
       * - Works with both old and new frontend code
       * - Prevents data loss during product creation/editing
       */
      if (data.images && data.images.length) {
        const imageValues = data.images.map(img => [
          productId,
          img.image_url || img.url,  // Accept both field names
          img.alt_text,
          img.is_primary || false,
          img.display_order || 0
        ]);
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
         weight=?, weight_unit=?, stock_quantity=?, in_stock = COALESCE(?, in_stock), is_active = COALESCE(?, is_active), is_featured=?, meta_title=?, meta_description=?, related_products = COALESCE(?, related_products), updated_at=NOW()
         WHERE id=?`,
        [
          data.name, data.slug, data.description, data.short_description, data.category_id, data.sku,
          data.price, data.compare_price, data.weight, data.weight_unit,
          data.stock_quantity,
          // Pass NULL to COALESCE when the frontend did not specify these fields so existing values are preserved
          (data.in_stock === undefined ? null : (data.in_stock ? 1 : 0)),
          (data.is_active === undefined ? null : (data.is_active ? 1 : 0)),
          data.is_featured, data.meta_title, data.meta_description, 
          // Use JSON_SET or just full replace. Since we pass full array, full replace is fine. 
          // But SQL needs valid JSON string.
          (data.related_products ? JSON.stringify(data.related_products) : null), // Use COALESCE in query or handle here?
          // Let's modify query to UPDATE ... related_products = COALESCE(?, related_products)
          id
        ]
      );

      // 2. Update Related Data (Strategy: Delete all and Re-insert for simplicity, or smart update)
      // For simplicity in this iteration, we will clear and re-insert lists if provided.

      if (data.images) {
        await conn.query(`DELETE FROM product_images WHERE product_id = ?`, [id]);
        if (data.images.length) {
          /**
           * CRITICAL FIX: Image Field Name Compatibility (UPDATE)
           * ======================================================
           * Same fix as in CREATE method - accept both 'url' and 'image_url'
           */
          const imageValues = data.images.map(img => [
            id,
            img.image_url || img.url,  // Accept both field names
            img.alt_text,
            img.is_primary || false,
            img.display_order || 0
          ]);
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
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Clean up related data (referential integrity)
      await conn.query(`DELETE FROM product_images WHERE product_id = ?`, [id]);
      await conn.query(`DELETE FROM product_features WHERE product_id = ?`, [id]);
      await conn.query(`DELETE FROM product_variants WHERE product_id = ?`, [id]);
      
      // Keep reviews but set product_id to NULL for history
      await conn.query(`UPDATE reviews SET product_id = NULL WHERE product_id = ?`, [id]);
      
      // Note: order_items are NOT deleted - must preserve order history
      
      // Finally delete the product
      await conn.query(`DELETE FROM products WHERE id = ?`, [id]);

      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
}

module.exports = ProductModel;
