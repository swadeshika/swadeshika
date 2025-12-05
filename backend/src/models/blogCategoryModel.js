const db = require('../config/db');

/**
 * BlogCategoryModel
 * Handles database interactions for blog categories
 */
class BlogCategoryModel {
    /**
     * Get all blog categories
     * @returns {Promise<Array>}
     */
    static async findAll() {
        const [rows] = await db.query(
            'SELECT * FROM blog_categories ORDER BY display_order ASC, name ASC'
        );
        return rows;
    }

    /**
     * Get active blog categories only
     * @returns {Promise<Array>}
     */
    static async findActive() {
        const [rows] = await db.query(
            'SELECT * FROM blog_categories WHERE is_active = TRUE ORDER BY display_order ASC, name ASC'
        );
        return rows;
    }

    /**
     * Find category by ID
     * @param {number} id
     * @returns {Promise<Object>}
     */
    static async findById(id) {
        const [rows] = await db.query(
            'SELECT * FROM blog_categories WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    /**
     * Find category by slug
     * @param {string} slug
     * @returns {Promise<Object>}
     */
    static async findBySlug(slug) {
        const [rows] = await db.query(
            'SELECT * FROM blog_categories WHERE slug = ?',
            [slug]
        );
        return rows[0];
    }

    /**
     * Create a new category
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    static async create(data) {
        const { name, slug, description, display_order = 0, is_active = true } = data;
        
        const [result] = await db.query(
            `INSERT INTO blog_categories (name, slug, description, display_order, is_active)
             VALUES (?, ?, ?, ?, ?)`,
            [name, slug, description, display_order, is_active]
        );

        return this.findById(result.insertId);
    }

    /**
     * Update a category
     * @param {number} id
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    static async update(id, data) {
        const fields = [];
        const values = [];

        const allowedFields = ['name', 'slug', 'description', 'display_order', 'is_active'];
        
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(data[field]);
            }
        }

        if (fields.length === 0) {
            return this.findById(id);
        }

        values.push(id);
        await db.query(
            `UPDATE blog_categories SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return this.findById(id);
    }

    /**
     * Delete a category
     * @param {number} id
     * @returns {Promise<boolean>}
     */
    static async delete(id) {
        const [result] = await db.query('DELETE FROM blog_categories WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    /**
     * Check if category exists by slug
     * @param {string} slug
     * @param {number} excludeId - ID to exclude from check (for updates)
     * @returns {Promise<boolean>}
     */
    static async existsBySlug(slug, excludeId = null) {
        let query = 'SELECT COUNT(*) as count FROM blog_categories WHERE slug = ?';
        const params = [slug];

        if (excludeId) {
            query += ' AND id != ?';
            params.push(excludeId);
        }

        const [rows] = await db.query(query, params);
        return rows[0].count > 0;
    }
}

module.exports = BlogCategoryModel;
