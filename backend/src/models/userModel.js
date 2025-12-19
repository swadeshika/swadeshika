const db = require('../config/db');
const { hashPassword } = require('../utils/hash');
const { v4: uuidv4 } = require('uuid');

/**
 * userModel.js
 * ------------
 * Database interactions for Users.
 */
class UserModel {
    /**
     * Find all users with pagination
     * 
     * @param {Object} options - { page, limit, search }
     * @returns {Promise<Object>} Users and pagination info
     */
    static async findAll({ page = 1, limit = 20, search } = {}) {
        const offset = (page - 1) * limit;
        let sql = `SELECT id, name, email, phone, role, created_at FROM users WHERE 1=1`;
        const params = [];

        if (search) {
            sql += ` AND (name LIKE ? OR email LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        // Count total
        const countSql = `SELECT COUNT(*) as total FROM users WHERE 1=1 ${search ? 'AND (name LIKE ? OR email LIKE ?)' : ''}`;
        const countParams = search ? [`%${search}%`, `%${search}%`] : [];
        const [countResult] = await db.query(countSql, countParams);
        const total = countResult[0].total;

        // Fetch data
        sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const [users] = await db.query(sql, params);

        return { users, total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) };
    }

    /**
     * Find user by ID
     * 
     * @param {number|string} id - User ID
     * @returns {Promise<Object|undefined>} User object
     */
    static async findById(id) {
        const [rows] = await db.query(
            `SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?`,
            [id]
        );
        return rows[0];
    }

    /**
     * Find user by email
     * 
     * @param {string} email - User email
     * @returns {Promise<Object|undefined>} User object with password
     */
    static async findByEmail(email) {
        const [rows] = await db.query(
            `SELECT id, name, email, password, phone, role, created_at FROM users WHERE email = ?`,
            [email]
        );
        return rows[0];
    }

    /**
     * Update user
     * 
     * @param {number|string} id - User ID
     * @param {Object} data - Update data
     * @returns {Promise<boolean>} True if updated
     */
    static async update(id, data) {
        const updates = [];
        const params = [];

        if (data.name) { updates.push('name = ?'); params.push(data.name); }
        if (data.phone) { updates.push('phone = ?'); params.push(data.phone); }

        if (updates.length === 0) return false;

        params.push(id);
        const sql = `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`;

        const [result] = await db.query(sql, params);
        return result.affectedRows > 0;
    }

    /**
     * Delete user
     * 
     * @param {number|string} id - User ID
     * @returns {Promise<boolean>} True if deleted
     */
    static async delete(id) {
        const [result] = await db.query(`DELETE FROM users WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    }


    /**
     * Create a new user
     * 
     * @param {Object} data - User data { name, email, password, phone }
     * @returns {Promise<Object>} Created user object
     */
    static async create(data) {
        const { name, email, password, phone } = data;
        const hashedPassword = await hashPassword(password);
        const id = uuidv4();

        const [result] = await db.query(
            `INSERT INTO users (id, name, email, password, phone) VALUES (?, ?, ?, ?, ?)`,
            [id, name, email, hashedPassword, phone]
        );

        return this.findById(id);
    }

    /**
     * Force update password (no old password check)
     * Used for Forgot Password / Reset Password
     * 
     * @param {number|string} id - User ID
     * @param {string} password - New plain text password
     * @returns {Promise<boolean>} True if updated
     */
    static async forceSetPassword(id, password) {
        const hashedPassword = await hashPassword(password);
        const [result] = await db.query(
            `UPDATE users SET password = ? WHERE id = ?`,
            [hashedPassword, id]
        );
        return result.affectedRows > 0;
    }
}

module.exports = UserModel;
