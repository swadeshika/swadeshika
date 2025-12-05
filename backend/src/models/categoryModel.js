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
        c.id, c.name, c.slug, c.parent_id, c.description, c.display_order, c.is_active, c.created_at, c.updated_at,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id, c.name, c.slug, c.parent_id, c.description, c.display_order, c.is_active, c.created_at, c.updated_at
      ORDER BY c.display_order ASC, c.name ASC
    `;

        const [rows] = await db.query(sql);

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
        c.id, c.name, c.slug, c.parent_id, c.description, c.display_order, c.is_active, c.created_at, c.updated_at,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      WHERE c.id = ?
      GROUP BY c.id, c.name, c.slug, c.parent_id, c.description, c.display_order, c.is_active, c.created_at, c.updated_at
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
        const sql = `SELECT id, name, slug, parent_id, description, display_order, is_active, created_at, updated_at FROM categories WHERE slug = ?`;
        const [rows] = await db.query(sql, [slug]);
        return rows[0];
    }

    /**
     * Create new category
     * 
     * @param {Object} data - Category data
     * @returns {Promise<number>} Inserted ID
     */
    static async create(data) {
        const sql = `
      INSERT INTO categories (name, slug, parent_id, description, display_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
        const [result] = await db.query(sql, [
            data.name,
            data.slug,
            data.parent_id || null,
            data.description,
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
      SET name = ?, slug = ?, parent_id = ?, description = ?, display_order = ?, is_active = ?, updated_at = NOW()
      WHERE id = ?
    `;
        const [result] = await db.query(sql, [
            data.name,
            data.slug,
            data.parent_id || null,
            data.description,
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
