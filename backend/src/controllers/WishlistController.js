const WishlistService = require('../services/WishlistService');

/**
 * WishlistController.js
 * ---------------------
 * Handles wishlist operations for authenticated users.
 * 
 * Operations:
 * 1. Add to Wishlist
 * 2. Remove from Wishlist
 * 3. Get Wishlist
 */
class WishlistController {
    /**
     * Add product to wishlist
     * 
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    static async addToWishlist(req, res, next) {
        try {
            const userId = req.user.id; // Assumes authMiddleware populates req.user
            const { productId } = req.body;

            await WishlistService.addToWishlist(userId, productId);

            res.status(201).json({ message: 'Product added to wishlist' });
        } catch (error) {
            if (error.message === 'Product already in wishlist') {
                return res.status(409).json({ message: error.message });
            }
            next(error);
        }
    }

    /**
     * Remove product from wishlist
     * 
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    static async removeFromWishlist(req, res, next) {
        try {
            const userId = req.user.id;
            const { productId } = req.params;

            const removed = await WishlistService.removeFromWishlist(userId, productId);

            if (!removed) {
                return res.status(404).json({ message: 'Product not found in wishlist' });
            }

            res.status(200).json({ message: 'Product removed from wishlist' });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get user's wishlist
     * 
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    static async getWishlist(req, res, next) {
        try {
            const userId = req.user.id;
            const wishlist = await WishlistService.getWishlist(userId);

            res.status(200).json(wishlist);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = WishlistController;
