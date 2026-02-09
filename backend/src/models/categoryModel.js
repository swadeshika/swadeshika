const db = require('../config/db');

/**
 * categoryModel.js
 * ----------------
 * Database interactions for Categories.
 * Uses raw SQL queries via mysql2 pool.
 */
class CategoryModel {
    /**
     * Find all categories
     * 
     * @param {Object} options - Options object
     * @param {boolean} options.includeSubcategories - Whether to build a nested tree
     * @returns {Promise<Array>} List of categories (flat or nested)
     */
    static async findAll({ includeSubcategories = false } = {}) {
        let sql = `
      SELECT 
        c.id, c.name, c.slug, c.parent_id, c.description, c.image_url, c.display_order, c.is_active, c.created_at, c.updated_at,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id, c.name, c.slug, c.parent_id, c.description, c.image_url, c.display_order, c.is_active, c.created_at, c.updated_at
      ORDER BY c.display_order ASC, c.name ASC
    `;

        const [rows] = await db.query(sql);

        // Calculate recursive counts
        const categoryMap = new Map();
        rows.forEach(row => {
            row.direct_count = row.product_count; // Keep original direct count if needed internally
            row.total_product_count = row.product_count; // Initialize total with direct count
            categoryMap.set(row.id, row);
        });

        // We need to process from bottom up (deepest level first) or just recurse.
        // A simple way is to build the tree or valid parent pointers, but since `rows` is flat:
        // Let's iterate. Since usually category depth is shallow, a few passes or recursion works.
        // Let's use specific recursion for accuracy.

        const getRecursiveCount = (catId) => {
            const cat = categoryMap.get(catId);
            if (!cat) return 0;

            // If already calculated (marked by a flag, or we trust the order?), 
            // actually, to avoid double counting if called multiple times, we need care.
            // But here we just want to update the `row` objects in place for the output.

            // Find children
            const children = rows.filter(r => r.parent_id === catId);

            let childSum = 0;
            for (const child of children) {
                childSum += getRecursiveCount(child.id);
            }

            return cat.direct_count + childSum;
        };

        // Update all rows with recursive count
        rows.forEach(row => {
            // We can re-calculate for every node (inefficient but safe for correctness) 
            // or perform a memoized approach. Given strictly hierarchical (no loops), 
            // let's do a simple memoized helper if performance matters, 
            // but for <100 categories, simple recursion for each root is fine.
            // Wait, if I call getRecursiveCount(root), it traverses everything.
            // If I call it for leaf, it just returns direct.
            // Let's just update the product_count property directly.

            // Optimization: Only compute if we haven't 'finalized' it? 
            // Actually, calculating on the fly is easiest to write correctly here.

            // Note: This naive 2-pass approach (filter for children every time) is O(N^2). 
            // Better: Build adjacency list first.
        });

        // 1. Build Adjacency List
        const childrenMap = new Map();
        rows.forEach(row => {
            if (row.parent_id) {
                if (!childrenMap.has(row.parent_id)) childrenMap.set(row.parent_id, []);
                childrenMap.get(row.parent_id).push(row.id);
            }
        });

        // 2. Recursive Aggregation with Memoization
        const memo = new Map();
        const aggregate = (id) => {
            if (memo.has(id)) return memo.get(id);
            const cat = categoryMap.get(id);
            if (!cat) return 0;

            let total = cat.direct_count;
            const childrenIds = childrenMap.get(id) || [];
            for (const childId of childrenIds) {
                total += aggregate(childId);
            }
            memo.set(id, total);
            return total;
        };

        rows.forEach(row => {
            row.product_count = aggregate(row.id); // Overwrite with total
        });

        if (includeSubcategories) {
            return this.buildCategoryTree(rows);
        }

        return rows;
    }

    /**
     * Helper to build category tree
     * 
     * @param {Array} categories - Flat list of categories
     * @param {number|null} parentId - Parent ID to filter by
     * @returns {Array} Nested category tree
     */
    static buildCategoryTree(categories, parentId = null) {
        const categoryList = [];
        let category;

        if (parentId == null) {
            categoryList.push(...categories.filter(cat => cat.parent_id == null));
        } else {
            categoryList.push(...categories.filter(cat => cat.parent_id == parentId));
        }

        return categoryList.map(cat => {
            const children = this.buildCategoryTree(categories, cat.id);
            return {
                ...cat,
                subcategories: children.length ? children : []
            };
        });
    }

    /**
     * Find category by ID
     * 
     * @param {number|string} id - Category ID
     * @returns {Promise<Object|undefined>} Category object or undefined
     */
    static async findById(id) {
        const sql = `
      SELECT 
        c.id, c.name, c.slug, c.parent_id, c.description, c.image_url, c.display_order, c.is_active, c.created_at, c.updated_at,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      WHERE c.id = ?
      GROUP BY c.id, c.name, c.slug, c.parent_id, c.description, c.image_url, c.display_order, c.is_active, c.created_at, c.updated_at
    `;
        const [rows] = await db.query(sql, [id]);
        return rows[0];
    }

    /**
     * Find category by Slug
     * 
     * @param {string} slug - Category slug
     * @returns {Promise<Object|undefined>} Category object or undefined
     */
    static async findBySlug(slug) {
        const sql = `SELECT id, name, slug, parent_id, description, image_url, display_order, is_active, created_at, updated_at FROM categories WHERE slug = ?`;
        const [rows] = await db.query(sql, [slug]);
        return rows[0];
    }

    /**
     * Find multiple categories by IDs
     * @param {Array|string} ids 
     * @returns {Promise<Array>}
     */
    static async findByIds(ids) {
        if (!ids || ids.length === 0) return [];

        const idList = Array.isArray(ids) ? ids : String(ids).split(',').map(s => s.trim());
        if (idList.length === 0) return [];

        const placeholders = idList.map(() => '?').join(',');
        const sql = `SELECT id, name, slug, image_url FROM categories WHERE id IN (${placeholders})`;

        const [rows] = await db.query(sql, idList);
        return rows;
    }

    /**
     * Create new category
     * 
     * @param {Object} data - Category data
     * @returns {Promise<number>} Inserted ID
     */
    static async create(data) {
        const sql = `
      INSERT INTO categories (name, slug, parent_id, description, image_url, display_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
        const [result] = await db.query(sql, [
            data.name,
            data.slug,
            data.parent_id || null,
            data.description || null,
            data.image_url || null,
            data.display_order || 0,
            data.is_active !== undefined ? data.is_active : true
        ]);
        return result.insertId;
    }

    /**
     * Update category
     * 
     * @param {number|string} id - Category ID
     * @param {Object} data - Update data
     * @returns {Promise<boolean>} True if updated
     */
    static async update(id, data) {
        const sql = `
      UPDATE categories 
      SET name = ?, slug = ?, parent_id = ?, description = ?, image_url = ?, display_order = ?, is_active = ?, updated_at = NOW()
      WHERE id = ?
    `;
        const [result] = await db.query(sql, [
            data.name,
            data.slug,
            data.parent_id || null,
            data.description || null,
            data.image_url || null,
            data.display_order || 0,
            data.is_active !== undefined ? data.is_active : true,
            id
        ]);

        return result.affectedRows > 0;
    }

    /**
     * Delete category
     * 
     * @param {number|string} id - Category ID
     * @returns {Promise<boolean>} True if deleted
     */
    static async delete(id) {
        const sql = `DELETE FROM categories WHERE id = ?`;
        const [result] = await db.query(sql, [id]);
        return result.affectedRows > 0;
    }
}

module.exports = CategoryModel;
