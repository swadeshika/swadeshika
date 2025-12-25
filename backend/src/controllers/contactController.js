const ContactModel = require('../models/contactModel');

/**
 * ContactController
 * Handles contact form submissions and retrieval.
 */

/**
 * Submit a new contact form
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
exports.submitContactForm = async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        await ContactModel.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Message sent successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all contact submissions (Admin)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
exports.getAllSubmissions = async (req, res, next) => {
    try {
        const result = await ContactModel.findAll(req.query);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get submission by ID (Admin)
 */
exports.getSubmissionById = async (req, res, next) => {
    try {
        const submission = await ContactModel.findById(req.params.id);
        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }
        res.status(200).json({ success: true, data: submission });
    } catch (error) {
        next(error);
    }
};

/**
 * Update submission status (Admin)
 */
exports.updateSubmissionStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const result = await ContactModel.update(req.params.id, { status });

        if (!result) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        res.status(200).json({ success: true, message: 'Status updated successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete submission (Admin)
 */
exports.deleteSubmission = async (req, res, next) => {
    try {
        const result = await ContactModel.delete(req.params.id);

        if (!result) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        res.status(200).json({ success: true, message: 'Submission deleted successfully' });
    } catch (error) {
        next(error);
    }
};
