const db = require('../config/db');

class CategoryModel {
    /**
     * Find all categories
     * @param {Object} options - { includeSubcategories: boolean }
     */
    static async findAll({ includeSubcategories = false } = {}) {
        let sql = `
      SELECT c.*, 
             (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
      FROM categories c
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
     */
    static async findById(id) {
        const sql = `
      SELECT c.*, 
             (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
      FROM categories c
      WHERE c.id = ?
    `;
        const [rows] = await db.query(sql, [id]);
        return rows[0];
    }

    /**
     * Find category by Slug
     */
    static async findBySlug(slug) {
        const sql = `SELECT * FROM categories WHERE slug = ?`;
        const [rows] = await db.query(sql, [slug]);
        return rows[0];
    }

    /**
     * Create new category
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
     */
    static async delete(id) {
        const sql = `DELETE FROM categories WHERE id = ?`;
        const [result] = await db.query(sql, [id]);
        return result.affectedRows > 0;
    }
}

module.exports = CategoryModel;
