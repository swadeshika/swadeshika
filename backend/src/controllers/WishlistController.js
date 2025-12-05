const WishlistService = require('../services/WishlistService');

class WishlistController {
    static async addToWishlist(req, res) {
        try {
            const userId = req.user.id; // Assumes authMiddleware populates req.user
            const { productId } = req.body;

            await WishlistService.addToWishlist(userId, productId);

            res.status(201).json({ message: 'Product added to wishlist' });
        } catch (error) {
            if (error.message === 'Product already in wishlist') {
                return res.status(409).json({ message: error.message });
            }
            res.status(500).json({ message: 'Error adding to wishlist', error: error.message });
        }
    }

    static async removeFromWishlist(req, res) {
        try {
            const userId = req.user.id;
            const { productId } = req.params;

            const removed = await WishlistService.removeFromWishlist(userId, productId);

            if (!removed) {
                return res.status(404).json({ message: 'Product not found in wishlist' });
            }

            res.status(200).json({ message: 'Product removed from wishlist' });
        } catch (error) {
            res.status(500).json({ message: 'Error removing from wishlist', error: error.message });
        }
    }

    static async getWishlist(req, res) {
        try {
            const userId = req.user.id;
            const wishlist = await WishlistService.getWishlist(userId);

            res.status(200).json(wishlist);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching wishlist', error: error.message });
        }
    }
}

module.exports = WishlistController;
