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
        const { name, email, phone, subject, order_number, message } = data;
        const [result] = await db.query(
            `INSERT INTO contact_submissions (name, email, phone, subject, order_number, message) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, email, phone, subject, order_number, message]
        );
        return result.insertId;
    }

    /**
     * Find all submissions with pagination and filtering
     * @param {Object} options - { page, limit, status }
     * @returns {Promise<Object>} { submissions, total, page, limit, pages }
     */
    static async findAll({ page = 1, limit = 20, status }) {
        const offset = (page - 1) * limit;
        let query = 'SELECT * FROM contact_submissions';
        const params = [];

        if (status) {
            query += ' WHERE status = ?';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const [submissions] = await db.query(query, params);

        const [countResult] = await db.query('SELECT COUNT(*) as total FROM contact_submissions');
        const total = countResult[0].total;

        return { submissions, total, page, limit, pages: Math.ceil(total / limit) };
    }

    /**
     * Find submission by ID
     * @param {number} id - Submission ID
     * @returns {Promise<Object>} Submission object
     */
    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM contact_submissions WHERE id = ?', [id]);
        return rows[0];
    }

    /**
     * Update submission status
     * @param {number} id - Submission ID
     * @param {string} status - New status
     * @returns {Promise<boolean>} True if updated
     */
    static async update(id, { status }) {
        const [result] = await db.query(
            'UPDATE contact_submissions SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows > 0;
    }

    /**
     * Delete submission
     * @param {number} id - Submission ID
     * @returns {Promise<boolean>} True if deleted
     */
    static async delete(id) {
        const [result] = await db.query('DELETE FROM contact_submissions WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = ContactModel;
