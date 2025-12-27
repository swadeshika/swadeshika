const db = require('../config/db');

class BlogAuthorModel {
    /**
     * Get all authors
     */
    static async findAll() {
        const sql = `SELECT * FROM blog_authors ORDER BY name ASC`;
        const [rows] = await db.query(sql);
        return rows;
    }

    /**
     * Find author by ID
     */
    static async findById(id) {
        const sql = `SELECT * FROM blog_authors WHERE id = ?`;
        const [rows] = await db.query(sql, [id]);
        return rows[0];
    }

    /**
     * Create new author
     */
    static async create(data) {
        const sql = `
            INSERT INTO blog_authors (name, email, bio, avatar, social_links)
            VALUES (?, ?, ?, ?, ?)
        `;
        const params = [
            data.name,
            data.email,
            data.bio,
            data.avatar,
            JSON.stringify(data.social_links || {})
        ];
        const [result] = await db.query(sql, params);
        return result.insertId;
    }

    /**
     * Update author
     */
    static async update(id, data) {
        const fields = [];
        const params = [];

        if (data.name) { fields.push('name = ?'); params.push(data.name); }
        if (data.email) { fields.push('email = ?'); params.push(data.email); }
        if (data.bio) { fields.push('bio = ?'); params.push(data.bio); }
        if (data.avatar) { fields.push('avatar = ?'); params.push(data.avatar); }
        if (data.social_links) { fields.push('social_links = ?'); params.push(JSON.stringify(data.social_links)); }

        if (fields.length === 0) return false;

        const sql = `UPDATE blog_authors SET ${fields.join(', ')} WHERE id = ?`;
        params.push(id);

        const [result] = await db.query(sql, params);
        return result.affectedRows > 0;
    }

    /**
     * Delete author
     */
    static async delete(id) {
        const sql = `DELETE FROM blog_authors WHERE id = ?`;
        const [result] = await db.query(sql, [id]);
        return result.affectedRows > 0;
    }
}

module.exports = BlogAuthorModel;
