const UserService = require('../services/userService');

/**
 * userController.js
 * -----------------
 * Handles user profile and admin user management operations.
 * 
 * Operations:
 * 1. Get Profile (Self)
 * 2. Update Profile (Self)
 * 3. Get All Users (Admin)
 * 4. Get User By ID (Admin)
 * 5. Delete User (Admin)
 */
class UserController {
    /**
     * Get current user profile
     * 
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    static async getProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const user = await UserService.getUserById(userId);
            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update current user profile
     * 
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    static async updateProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const updatedUser = await UserService.updateUser(userId, req.body);
            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: updatedUser
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all users (Admin)
     * 
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    static async getAllUsers(req, res, next) {
        try {
            const users = await UserService.getAllUsers(req.query);
            res.status(200).json({
                success: true,
                data: users
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get user by ID (Admin)
     * 
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    static async getUserById(req, res, next) {
        try {
            const user = await UserService.getUserById(req.params.id);
            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            if (error.message === 'User not found') {
                return res.status(404).json({ success: false, message: error.message });
            }
            next(error);
        }
    }

    /**
     * Delete user (Admin)
     * 
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    static async deleteUser(req, res, next) {
        try {
            await UserService.deleteUser(req.params.id);
            res.status(200).json({
                success: true,
                message: 'User deleted successfully'
            });
        } catch (error) {
            if (error.message === 'User not found') {
                return res.status(404).json({ success: false, message: error.message });
            }
            next(error);
        }
    }
}

module.exports = UserController;
