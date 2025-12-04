const db = require('../config/db');
const { slugify } = require('../utils/stringUtils');

class BlogModel {

    /**
     * Find all blog posts with pagination and filters
     */
    static async findAll({ page = 1, limit = 10, category, search, status }) {
        const offset = (page - 1) * limit;
        const params = [];

        let sql = `
      SELECT b.id, b.title, b.slug, b.excerpt, b.featured_image, b.author_id, b.category_id, b.tags, b.status, b.published_at, b.created_at, b.updated_at, c.name as category_name, c.slug as category_slug, u.name as author_name
      FROM blog_posts b
      LEFT JOIN blog_categories c ON b.category_id = c.id
      LEFT JOIN users u ON b.author_id = u.id
      WHERE 1=1
    `;

        if (category) {
            sql += ` AND c.slug = ?`;
            params.push(category);
        }

        if (search) {
            sql += ` AND (b.title LIKE ? OR b.content LIKE ? OR b.excerpt LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (status) {
            sql += ` AND b.status = ?`;
            params.push(status);
        }

        // Sort by published_at desc, then created_at desc
        sql += ` ORDER BY b.published_at DESC, b.created_at DESC`;

        // Pagination
        sql += ` LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const [posts] = await db.query(sql, params);

        // Get total count
        let countSql = `
      SELECT COUNT(*) as total 
      FROM blog_posts b 
      LEFT JOIN blog_categories c ON b.category_id = c.id 
      WHERE 1=1
    `;

        const countParams = [];
        if (category) { countSql += ` AND c.slug = ?`; countParams.push(category); }
        if (search) { countSql += ` AND (b.title LIKE ? OR b.content LIKE ? OR b.excerpt LIKE ?)`; countParams.push(`%${search}%`, `%${search}%`, `%${search}%`); }
        if (status) { countSql += ` AND b.status = ?`; countParams.push(status); }

        const [countResult] = await db.query(countSql, countParams);
        const total = countResult[0].total;

        return { posts, total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) };
    }

    /**
     * Find post by Slug
     */
    static async findBySlug(slug) {
        const sql = `
      SELECT b.*, c.name as category_name, c.slug as category_slug, u.name as author_name
      FROM blog_posts b
      LEFT JOIN blog_categories c ON b.category_id = c.id
      LEFT JOIN users u ON b.author_id = u.id
      WHERE b.slug = ?
    `;

        const [rows] = await db.query(sql, [slug]);
        return rows[0] || null;
    }

    /**
     * Create a new blog post
     */
    static async create(data) {
        const sql = `
      INSERT INTO blog_posts (title, slug, excerpt, content, featured_image, author_id, category_id, tags, status, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const params = [
            data.title,
            data.slug,
            data.excerpt,
            data.content,
            data.featured_image,
            data.author_id,
            data.category_id,
            data.tags,
            data.status || 'draft',
            data.status === 'published' ? new Date() : null
        ];

        const [result] = await db.query(sql, params);
        return result.insertId;
    }

    /**
     * Update a blog post
     */
    static async update(id, data) {
        // Build dynamic update query
        const fields = [];
        const params = [];

        if (data.title) { fields.push('title = ?'); params.push(data.title); }
        if (data.slug) { fields.push('slug = ?'); params.push(data.slug); }
        if (data.excerpt) { fields.push('excerpt = ?'); params.push(data.excerpt); }
        if (data.content) { fields.push('content = ?'); params.push(data.content); }
        if (data.featured_image) { fields.push('featured_image = ?'); params.push(data.featured_image); }
        if (data.category_id) { fields.push('category_id = ?'); params.push(data.category_id); }
        if (data.tags) { fields.push('tags = ?'); params.push(data.tags); }
        if (data.status) {
            fields.push('status = ?');
            params.push(data.status);
            if (data.status === 'published') {
                fields.push('published_at = COALESCE(published_at, NOW())');
            }
        }

        if (fields.length === 0) return false;

        const sql = `UPDATE blog_posts SET ${fields.join(', ')} WHERE id = ?`;
        params.push(id);

        const [result] = await db.query(sql, params);
        return result.affectedRows > 0;
    }

    /**
     * Delete a blog post
     */
    static async delete(id) {
        const sql = `DELETE FROM blog_posts WHERE id = ?`;
        const [result] = await db.query(sql, [id]);
        return result.affectedRows > 0;
    }

    /**
     * Get category ID by name or slug
     */
    static async getCategoryIdByName(nameOrSlug) {
        const sql = `SELECT id FROM blog_categories WHERE name = ? OR slug = ?`;
        const [rows] = await db.query(sql, [nameOrSlug, nameOrSlug]);
        return rows[0] ? rows[0].id : null;
    }

    /**
     * Create a new category
     */
    static async createCategory(name) {
        const slug = slugify(name);
        const sql = `INSERT INTO blog_categories (name, slug) VALUES (?, ?)`;
        const [result] = await db.query(sql, [name, slug]);
        return result.insertId;
    }
}

module.exports = BlogModel;
