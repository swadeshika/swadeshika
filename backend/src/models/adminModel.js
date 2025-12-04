const db = require('../config/db');
const { hashPassword, comparePasswords } = require('../utils/hash');
const { USER_MESSAGES } = require('../constants/messages');

class AdminModel {
    /**
     * Update admin password
     * ---------------------
     * Steps:
     *  1. Fetch user password
     *  2. Compare with oldPassword
     *  3. Hash newPassword
     *  4. Update DB
     */
    static async updatePassword(userId, oldPassword, newPassword) {
        const [rows] = await db.query(
            'SELECT password FROM users WHERE id = ?',
            [userId]
        );

        if (!rows.length)
            throw new Error(USER_MESSAGES.USER_NOT_FOUND || 'User not found');

        const user = rows[0];

        // Check if old password matches
        const ok = await comparePasswords(oldPassword, user.password);
        if (!ok)
            throw new Error('Incorrect current password');

        // Hash new password
        const hashed = await hashPassword(newPassword);

        // Update DB
        await db.query(
            'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
            [hashed, userId]
        );

        return true;
    }
}

module.exports = AdminModel;
