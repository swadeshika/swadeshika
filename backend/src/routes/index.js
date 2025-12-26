const express = require('express');
const router = express.Router();

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

// Admin Routes
router.use('/admin/settings', adminSettingsRoutes);
router.use('/admin/orders', adminOrderRoutes);
router.use('/admin/blog/authors', adminBlogAuthorRoutes);
router.use('/admin/blog', adminBlogRoutes);
router.use('/admin/dashboard', dashboardRoutes);
router.use('/admin/reports', reportRoutes);
router.use('/admin/analytics', analyticsRoutes); // Convenience alias

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
