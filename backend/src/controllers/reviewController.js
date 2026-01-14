const ReviewService = require('../services/reviewService');

/**
 * Review Controller
 * Handles incoming review-related requests
 */
class ReviewController {
    /**
     * Create a new review
     * @route POST /api/v1/reviews
     */
    static async createReview(req, res, next) {
        try {
            const review = await ReviewService.createReview(req.user.id, req.body);
            res.status(201).json({
                success: true,
                message: 'Review submitted successfully',
                data: review
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get reviews for a product
     * @route GET /api/v1/reviews/product/:productId
     */
    static async getProductReviews(req, res, next) {
        try {
            console.log(`[ReviewController] Fetching reviews for product ID: ${req.params.productId}`);
            const reviews = await ReviewService.getProductReviews(req.params.productId);
            console.log(`[ReviewController] Found ${reviews.length} reviews`);
            res.status(200).json({
                success: true,
                data: reviews
            });
        } catch (error) {
            console.error(`[ReviewController] Error:`, error);
            next(error);
        }
    }

    /**
     * Get current user's reviews
     * @route GET /api/v1/reviews/me
     */
    static async getMyReviews(req, res, next) {
        try {
            const reviews = await ReviewService.getUserReviews(req.user.id);
            res.status(200).json({
                success: true,
                data: reviews
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get pending reviews for current user
     * @route GET /api/v1/reviews/pending
     */
    static async getPendingReviews(req, res, next) {
        try {
            const reviews = await ReviewService.getPendingReviews(req.user.id);
            res.status(200).json({
                success: true,
                data: reviews
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ReviewController;
