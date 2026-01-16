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

    /**
     * Get all reviews (Admin)
     * @route GET /api/v1/reviews
     */
    static async getAllReviews(req, res, next) {
        try {
            const { status } = req.query;
            const reviews = await ReviewService.getAllReviews({ status });
            res.status(200).json({
                success: true,
                data: reviews
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update review status
     * @route PATCH /api/v1/reviews/:id/status
     */
    static async updateStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            await ReviewService.updateReviewStatus(id, status);
            res.status(200).json({
                success: true,
                message: 'Review status updated'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Delete review
     * @route DELETE /api/v1/reviews/:id
     */
    static async deleteReview(req, res, next) {
        try {
            const { id } = req.params;
            await ReviewService.deleteReview(id);
            res.status(200).json({
                success: true,
                message: 'Review deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    }
    /**
     * Get featured home page reviews
     * @route GET /api/v1/reviews/featured
     */
    static async getFeaturedReviews(req, res, next) {
        try {
            const reviews = await ReviewService.getFeaturedReviews(3);
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
