const db = require('../config/db');
const { hashPassword } = require('../utils/hash');

/**
 * userModel.js
 * ------------
 * Database interactions for Users.
 */
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const { v4: uuidv4 } = require('uuid');
const { hashPassword } = require('../utils/hash');

/**
 * userModel.js
 * ------------
 * Database interactions for Users.
 */
class UserModel {
    /**
     * Create a new user
     * 
     * @param {Object} userData - User details
     * @returns {Promise<Object>} Created user object
     */
    static async create(userData) {
        const id = uuidv4();
        const { name, email, password, phone, role = 'customer' } = userData;

        const hashedPw = await hashPassword(password);

        await db.query(
            'INSERT INTO users (id, name, email, password, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
            [id, name, email, hashedPw, phone, role]
        );

        return { id, name, email, phone, role };
    }

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
     * Update user (for admin/profile)
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
        // Add more fields if needed, but NOT password here (use specific method)

        if (updates.length === 0) return false;

        params.push(id);
        const sql = `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`;

        const [result] = await db.query(sql, params);
        return result.affectedRows > 0;
    }

    /**
     * Update password (force set)
     * 
     * @param {number|string} id - User ID
     * @param {string} newPassword - Plain text password (will be hashed)
     */
    static async forceSetPassword(id, newPassword) {
        const hashedPassword = await hashPassword(newPassword);
        await db.query(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, id]);
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
     * @param {Object} userData - { name, email, password, phone, role }
     * @returns {Promise<Object>} Created user object
     */
    static async create({ name, email, password, phone, role = 'user' }) {
        const { hashPassword } = require('../utils/hash');
        const hashedPassword = await hashPassword(password);

        const sql = `
            INSERT INTO users (name, email, password, phone, role)
            VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(sql, [name, email, hashedPassword, phone, role]);

        return {
            id: result.insertId,
            name,
            email,
            phone,
            role,
            created_at: new Date()
        };
    }

    /**
     * Force set password (for reset password feature)
     * 
     * @param {number|string} id - User ID
     * @param {string} password - New raw password
     * @returns {Promise<boolean>} True if updated
     */
    static async forceSetPassword(id, password) {
        const { hashPassword } = require('../utils/hash');
        const hashedPassword = await hashPassword(password);

        const [result] = await db.query(
            `UPDATE users SET password = ? WHERE id = ?`,
            [hashedPassword, id]
        );

        return result.affectedRows > 0;
    }
}

module.exports = UserModel;
