const WishlistModel = require('../models/WishlistModel');

/**
 * WishlistService.js
 * ------------------
 * Business logic for Wishlist operations.
 */
class WishlistService {
    /**
     * Add product to wishlist
     * 
     * @param {number|string} userId - User ID
     * @param {number|string} productId - Product ID
     * @returns {Promise<number>} Insert ID
     * @throws {Error} If productId is missing
     */
    static async addToWishlist(userId, productId) {
        if (!productId) {
            throw new Error('Product ID is required');
        }
        return await WishlistModel.addToWishlist(userId, productId);
    }

    /**
     * Remove product from wishlist
     * 
     * @param {number|string} userId - User ID
     * @param {number|string} productId - Product ID
     * @returns {Promise<boolean>} True if removed
     * @throws {Error} If productId is missing
     */
    static async removeFromWishlist(userId, productId) {
        if (!productId) {
            throw new Error('Product ID is required');
        }
        return await WishlistModel.removeFromWishlist(userId, productId);
    }

    /**
     * Get user's wishlist
     * 
     * @param {number|string} userId - User ID
     * @returns {Promise<Array>} List of wishlist items
     */
    static async getWishlist(userId) {
        return await WishlistModel.getWishlist(userId);
    }
}

module.exports = WishlistService;
