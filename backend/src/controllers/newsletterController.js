const NewsletterModel = require('../models/newsletterModel');

/**
 * NewsletterController
 * Handles newsletter subscriptions.
 */

/**
 * Subscribe to newsletter
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
exports.subscribe = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const result = await NewsletterModel.subscribe(email);

        res.status(200).json({
            success: true,
            message: result.status === 'already_subscribed' ? 'Already subscribed' : 'Subscribed successfully',
            status: result.status
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all subscribers (Admin)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
exports.getAllSubscribers = async (req, res, next) => {
    try {
        const result = await NewsletterModel.findAll(req.query);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a subscriber (Admin)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
exports.deleteSubscriber = async (req, res, next) => {
    try {
        const { id } = req.params;
        const success = await NewsletterModel.delete(id);

        if (!success) {
            return res.status(404).json({ success: false, message: 'Subscriber not found' });
        }

        res.status(200).json({ success: true, message: 'Subscriber deleted successfully' });
    } catch (error) {
        next(error);
    }
};
