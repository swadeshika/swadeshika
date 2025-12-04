const WishlistModel = require('../models/WishlistModel');

class WishlistService {
    static async addToWishlist(userId, productId) {
        if (!productId) {
            throw new Error('Product ID is required');
        }
        return await WishlistModel.addToWishlist(userId, productId);
    }

    static async removeFromWishlist(userId, productId) {
        if (!productId) {
            throw new Error('Product ID is required');
        }
        return await WishlistModel.removeFromWishlist(userId, productId);
    }

    static async getWishlist(userId) {
        return await WishlistModel.getWishlist(userId);
    }
}

module.exports = WishlistService;
