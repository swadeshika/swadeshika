const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

/**
 * Main Router
 * Mounts all API routes.
 */

// Import Route Modules
const authRoutes = require('./authRoutes');
const adminSettingsRoutes = require('./adminSettingsRoutes');
const productRoutes = require('./productRoutes');
const categoryRoutes = require('./categoryRoutes');
const wishlistRoutes = require('./wishlistRoutes');
const cartRoutes = require('./cartRoutes');
const userRoutes = require('./userRoutes');
const addressRoutes = require('./addressRoutes');
const adminOrderRoutes = require('./adminOrderRoutes');
const blogRoutes = require('./blogRoutes');
const adminBlogRoutes = require('./adminBlogRoutes');
const blogCategoryRoutes = require('./blogCategoryRoutes');
const adminBlogAuthorRoutes = require('./adminBlogAuthorRoutes');
const couponRoutes = require('./couponRoutes');
const reviewRoutes = require('./reviewRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const contactRoutes = require('./contactRoutes');
const newsletterRoutes = require('./newsletterRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const customersRoutes = require('./customers.routes');
const reportRoutes = require('./reportRoutes');
const uploadRoutes = require('./uploadRoutes'); // File upload routes
const notificationRoutes = require('./notificationRoutes'); // Real-time notifications

// Dynamic loading for Order Routes (as it might be fragile or WIP)
const orderRoutes = require('./orderRoutes');
const settingsRoutes = require('./settingsRoutes'); // Public settings

// Mount Routes
router.use('/auth', authRoutes);
router.use('/settings', settingsRoutes); // Public settings endpoint
router.use('/users/addresses', addressRoutes); // Address routes mounted BEFORE /users to prevent collision with /users/:id
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/orders', orderRoutes);
router.use('/coupons', couponRoutes);
router.use('/reviews', reviewRoutes);
router.use('/blog/categories', blogCategoryRoutes);
router.use('/blog', blogRoutes);
router.use('/contact', contactRoutes);
router.use('/newsletter', newsletterRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/customers', customersRoutes);
router.use('/upload', uploadRoutes); // File upload endpoints

// Admin Routes
router.use('/admin/settings', adminSettingsRoutes);
router.use('/admin/orders', adminOrderRoutes);
router.use('/admin/blog/authors', adminBlogAuthorRoutes);
router.use('/admin/blog', adminBlogRoutes);
router.use('/admin/dashboard', dashboardRoutes);
router.use('/admin/reports', reportRoutes);
router.use('/admin/analytics', analyticsRoutes); // Convenience alias
router.use('/notifications', notificationRoutes); // Real-time notifications (admin only)

// Email Diagnostic Route
router.get('/test-email', async (req, res) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
        debug: true,
        logger: true 
    });

    const mailOptions = {
        from: `Diagnostic Test <${process.env.EMAIL_FROM || process.env.EMAIL_USERNAME}>`,
        to: process.env.EMAIL_USERNAME, 
        subject: 'Swadeshika Production Email Test',
        text: 'If you receive this, the email configuration is CORRECT on this server.',
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        res.json({
            success: true,
            network: process.env.NODE_ENV,
            service: process.env.EMAIL_SERVICE,
            messageId: info.messageId,
            response: info.response
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message,
            code: err.code,
            response: err.response,
            hint: err.code === 'EAUTH' ? 'Check App Password' : 'Port Blocked?'
        });
    }
});

// Health Check
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
});

// 404 Handler
router.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        path: req.originalUrl
    });
});

module.exports = router;
