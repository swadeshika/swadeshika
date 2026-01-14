const UserModel = require('../models/userModel');

/**
 * userService.js
 * --------------
 * Business logic for User operations.
 */
class UserService {
    /**
     * Get all users
     * 
     * @param {Object} query - Query parameters (page, limit, search)
     * @returns {Promise<Object>} List of users with pagination
     */
    static async getAllUsers(query) {
        return await UserModel.findAll(query);
    }

    /**
     * Get user by ID
     * 
     * @param {number|string} id - User ID
     * @returns {Promise<Object>} User object
     * @throws {Error} If user not found
     */
    static async getUserById(id) {
        const user = await UserModel.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    /**
     * Update user
     * 
     * @param {number|string} id - User ID
     * @param {Object} data - Update data
     * @returns {Promise<Object>} Updated user object
     * @throws {Error} If user not found
     */
    static async updateUser(id, data) {
        const user = await UserModel.findById(id);
        if (!user) {
            throw new Error('User not found');
        }

        // Check for email uniqueness if email is changing
        if (data.email && data.email !== user.email) {
            const existingUser = await UserModel.findByEmail(data.email);
            if (existingUser && existingUser.id !== id) {
                const error = new Error('Email is already in use by another account');
                error.statusCode = 409; // Conflict
                throw error;
            }
        }

        await UserModel.update(id, data);
        return await UserModel.findById(id);
    }

    /**
     * Delete user
     * 
     * @param {number|string} id - User ID
     * @returns {Promise<boolean>} True if deleted
     * @throws {Error} If user not found
     */
    static async deleteUser(id) {
        const user = await UserModel.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return await UserModel.delete(id);
    }
}

module.exports = UserService;
