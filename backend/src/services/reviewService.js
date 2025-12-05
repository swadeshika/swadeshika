const ReviewModel = require('../models/reviewModel');
const ProductModel = require('../models/productModel');

/**
 * Review Service
 * Business logic for product reviews
 */
class ReviewService {
    /**
     * Create a new review
     * @param {string} userId 
     * @param {Object} data 
     * @returns {Promise<Object>} Created review
     */
    static async createReview(userId, data) {
        const { product_id, order_id, rating, title, comment } = data;

        // Check if already reviewed
        const hasReviewed = await ReviewModel.hasReviewed(userId, product_id, order_id);
        if (hasReviewed) {
            throw { statusCode: 409, message: 'You have already reviewed this product for this order' };
        }

        // Create review
        const review = await ReviewModel.create({
            user_id: userId,
            product_id,
            order_id,
            rating,
            title,
            comment,
            is_verified: true, // Assuming if order_id is present, it's verified
            is_approved: true // Auto-approve for now
        });

        // Update product rating stats (could be async/background)
        await this.updateProductRating(product_id);

        return review;
    }

    /**
     * Get reviews for a product
     * @param {string} productId 
     * @returns {Promise<Array>}
     */
    static async getProductReviews(productId) {
        return await ReviewModel.findByProductId(productId);
    }

    /**
     * Get reviews by a user
     * @param {string} userId 
     * @returns {Promise<Array>}
     */
    static async getUserReviews(userId) {
        return await ReviewModel.findByUserId(userId);
    }

    /**
     * Get pending reviews for a user
     * @param {string} userId 
     * @returns {Promise<Array>}
     */
    static async getPendingReviews(userId) {
        return await ReviewModel.getPendingReviews(userId);
    }

    /**
     * Update product rating statistics
     * @param {string} productId 
     * @returns {Promise<void>}
     */
    static async updateProductRating(productId) {
        // Recalculate average rating and count
        // This would ideally be a method in ProductModel or a raw query here
        // For simplicity, we'll assume ProductModel has a method or we do it here
        // Let's do a raw query to get stats
        const db = require('../config/db');
        const [rows] = await db.query(
            'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE product_id = ? AND is_approved = TRUE',
            [productId]
        );
        
        const { avg_rating, count } = rows[0];
        
        await db.query(
            'UPDATE products SET rating = ?, review_count = ? WHERE id = ?',
            [avg_rating || 0, count || 0, productId]
        );
    }
}

module.exports = ReviewService;
