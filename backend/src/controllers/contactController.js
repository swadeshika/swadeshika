const ContactService = require('../services/contactService');

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
        // DEBUGGING LOGS
        console.log('--- Contact Submission Debug ---');
        console.log('Headers Content-Type:', req.headers['content-type']);
        console.log('Body keys:', Object.keys(req.body));
        console.log('File:', req.file);

        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const data = { ...req.body };

        // Handle file upload
        if (req.file) {
            // Construct public URL
            // If served from localhost:5000/uploads/...
            // We'll just store the relative path or full URL. 
            // Storing relative path /uploads/contacts/filename is better.
            data.attachment_url = `/uploads/contacts/${req.file.filename}`;
            data.attachment_name = req.file.originalname;
        }

        await ContactService.createSubmission(data);

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
 */
exports.getAllSubmissions = async (req, res, next) => {
    try {
        const result = await ContactService.getAllSubmissions(req.query);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single submission
 */
exports.getSubmissionById = async (req, res, next) => {
    try {
        const result = await ContactService.getSubmissionById(req.params.id);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }
        res.status(200).json({
            success: true,
            data: result
        });
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
        if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

        const result = await ContactService.updateStatus(req.params.id, status);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Submission not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Status updated successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Reply to submission
 */
exports.replyToSubmission = async (req, res, next) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ success: false, message: 'Reply message is required' });

        await ContactService.replyToSubmission(req.params.id, message);

        res.status(200).json({
            success: true,
            message: 'Reply sent successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete submission (Archive)
 */
exports.deleteSubmission = async (req, res, next) => {
    try {
        await ContactService.deleteSubmission(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Submission archived successfully'
        });
    } catch (error) {
        next(error);
    }
};
