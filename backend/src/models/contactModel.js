const db = require('../config/db');

/**
 * ContactModel
 * Interacts with contact_submissions table.
 */
class ContactModel {
    /**
     * Create a new contact submission
     * @param {Object} data - Submission data (name, email, subject, etc.)
     * @returns {Promise<number>} Insert ID
     */
    static async create(data) {
        const { name, email, phone, subject, order_number, message, attachment_url, attachment_name } = data;
        const [result] = await db.query(
            `INSERT INTO contact_submissions (name, email, phone, subject, order_number, message, attachment_url, attachment_name) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, email, phone || null, subject, order_number || null, message, attachment_url || null, attachment_name || null]
        );
        return result.insertId;
    }

    /**
     * Find all submissions with pagination and filtering
     * @param {Object} options - { page, limit, status, search }
     * @returns {Promise<Object>} { submissions, total, page, limit, pages }
     */
    static async findAll({ page = 1, limit = 20, status, search }) {
        const offset = (page - 1) * limit;
        let query = 'SELECT * FROM contact_submissions';
        const params = [];

        // Dynamic filtering
        const conditions = [];
        if (status) {
            conditions.push('status = ?');
            params.push(status);
        }
        // Exclude archived unless specifically requested
        if (status !== 'archived') {
            conditions.push("status != 'archived'");
        }

        if (search) {
            conditions.push('(name LIKE ? OR email LIKE ? OR subject LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [submissions] = await db.query(query, params);

        // Count query
        let countQuery = 'SELECT COUNT(*) as total FROM contact_submissions';
        // Reuse conditions for count
        if (conditions.length > 0) {
            countQuery += ' WHERE ' + conditions.join(' AND ');
        }
        // Slice params to match count query (remove limit/offset)
        const countParams = params.slice(0, params.length - 2);

        const [countResult] = await db.query(countQuery, countParams);
        const total = countResult[0].total;

        return { submissions, total, page, limit: parseInt(limit), pages: Math.ceil(total / limit) };
    }

    /**
     * Find submission by ID
     * @param {number} id 
     */
    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM contact_submissions WHERE id = ?', [id]);
        return rows[0];
    }

    /**
     * Update submission (status, etc.)
     * @param {number} id 
     * @param {Object} data 
     */
    static async update(id, data) {
        const { status } = data;
        if (!status) return false;

        const [result] = await db.query('UPDATE contact_submissions SET status = ? WHERE id = ?', [status, id]);
        return result.affectedRows > 0;
    }

    /**
     * Delete (Soft delete/Archive)
     * @param {number} id 
     */
    static async delete(id) {
        const [result] = await db.query("UPDATE contact_submissions SET status = 'archived' WHERE id = ?", [id]);
        return result.affectedRows > 0;
    }
}

module.exports = ContactModel;
