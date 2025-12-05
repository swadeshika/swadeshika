const ReviewService = require('../services/reviewService');

/**
 * ReviewController
 * Handles product reviews and ratings.
 */
class ReviewController {
    /**
     * Create a new review
     * @param {Object} req 
     * @param {Object} res 
     * @param {Function} next 
     */
    static async createReview(req, res, next) {
        try {
            const review = await ReviewService.createReview(req.user.id, req.body);
            res.status(201).json({ success: true, message: 'Review submitted successfully', data: review });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get reviews for a specific product
     * @param {Object} req 
     * @param {Object} res 
     * @param {Function} next 
     */
    static async getProductReviews(req, res, next) {
        try {
            const reviews = await ReviewService.getProductReviews(req.params.productId);
            res.json({ success: true, data: reviews });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get reviews written by the logged-in user
     * @param {Object} req 
     * @param {Object} res 
     * @param {Function} next 
     */
    static async getMyReviews(req, res, next) {
        try {
            const reviews = await ReviewService.getUserReviews(req.user.id);
            res.json({ success: true, data: reviews });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get pending reviews for orders the user has placed
     * @param {Object} req 
     * @param {Object} res 
     * @param {Function} next 
     */
    static async getPendingReviews(req, res, next) {
        try {
            const reviews = await ReviewService.getPendingReviews(req.user.id);
            res.json({ success: true, data: reviews });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ReviewController;
