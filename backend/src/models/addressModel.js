const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

/**
 * Address Model
 * Handles database interactions for user addresses
 */
class AddressModel {
    /**
     * Create a new address
     * @param {Object} addressData - Address data
     * @returns {Promise<Object>} Created address
     */
    static async create(addressData) {
        const {
            user_id,
            full_name,
            phone,
            address_line1,
            address_line2,
            city,
            state,
            postal_code,
            country = 'India',
            address_type = 'home',
            is_default = false
        } = addressData;

        const id = uuidv4();

        const query = `
            INSERT INTO addresses 
            (id, user_id, full_name, phone, address_line1, address_line2, city, state, postal_code, country, address_type, is_default)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.query(query, [
            id, user_id, full_name, phone, address_line1, address_line2, city, state, postal_code, country, address_type, is_default
        ]);

        return this.findById(id);
    }

    /**
     * Find address by ID
     * @param {string} id - Address ID
     * @returns {Promise<Object>} Address object
     */
    static async findById(id) {
        const query = 'SELECT * FROM addresses WHERE id = ?';
        const [rows] = await db.query(query, [id]);
        return rows[0];
    }

    /**
     * Find all addresses for a user
     * @param {string} userId - User ID
     * @returns {Promise<Array>} List of addresses
     */
    static async findByUserId(userId) {
        const query = 'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC';
        const [rows] = await db.query(query, [userId]);
        return rows;
    }

    /**
     * Update an address
     * @param {string} id - Address ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<Object>} Updated address
     */
    static async update(id, updateData) {
        const allowedFields = [
            'full_name', 'phone', 'address_line1', 'address_line2', 
            'city', 'state', 'postal_code', 'country', 'address_type', 'is_default'
        ];

        const updates = [];
        const values = [];

        for (const [key, value] of Object.entries(updateData)) {
            if (allowedFields.includes(key)) {
                updates.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (updates.length === 0) return null;

        values.push(id);
        const query = `UPDATE addresses SET ${updates.join(', ')} WHERE id = ?`;
        
        await db.query(query, values);
        return this.findById(id);
    }

    /**
     * Delete an address
     * @param {string} id - Address ID
     * @returns {Promise<boolean>} True if deleted
     */
    static async delete(id) {
        const query = 'DELETE FROM addresses WHERE id = ?';
        const [result] = await db.query(query, [id]);
        return result.affectedRows > 0;
    }

    /**
     * Set default address for a user
     * @param {string} userId - User ID
     * @param {string} addressId - Address ID to set as default
     */
    static async setDefault(userId, addressId) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // Unset current default
            await connection.query(
                'UPDATE addresses SET is_default = FALSE WHERE user_id = ?',
                [userId]
            );

            // Set new default
            await connection.query(
                'UPDATE addresses SET is_default = TRUE WHERE id = ? AND user_id = ?',
                [addressId, userId]
            );

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Count addresses for a user
     * @param {string} userId 
     * @returns {Promise<number>}
     */
    static async countByUserId(userId) {
        const [rows] = await db.query('SELECT COUNT(*) as count FROM addresses WHERE user_id = ?', [userId]);
        return rows[0].count;
    }
}

module.exports = AddressModel;
