// src/routes/index.js

/**
 * Main Route Register File
 * -------------------------
 * This file combines all route modules (auth, users, products, orders)
 * and exposes them through a central router.
 *
 * WHY DO WE USE A CENTRAL ROUTER?
 * --------------------------------
 * - Cleaner app.js (we only mount '/api/v1' once)
 * - Easy to manage multiple modules
 * - Easy to scale for admin/customer-specific routes later
 */

const express = require('express');
const router = express.Router();

// Import authentication routes
const authRoutes = require('./authRoutes');

/**
 * Dynamic Module Loading (Temporary Placeholders)
 * ------------------------------------------------
 * WHY?
 * - While building the project, some route files may not exist yet
 * - Instead of crashing the backend, we "catch" the error and create a placeholder route
 *
 * HOW IT WORKS:
 * try { require('./file') }
 * catch → create a dummy router sending simple JSON
 */

// Try loading "userRoutes"
let userRoutes;
try {
  userRoutes = require('./userRoutes');
} catch (e) {
  // Fallback placeholder if file does not exist yet
  userRoutes = express.Router().get('/', (req, res) =>
    res.json({ msg: 'users route placeholder' })
  );
}

// Load "productRoutes"
const productRoutes = require('./productRoutes');

// Try loading "orderRoutes"
let orderRoutes;
try {
  orderRoutes = require('./orderRoutes');
} catch (e) {
  orderRoutes = express.Router().get('/', (req, res) =>
    res.json({ msg: 'orders route placeholder' })
  );
}

/**
 * API Route Mounting
 * -------------------
 * These connect URLs → specific route modules.
 *
 * Example:
 * /api/v1/auth/register  → handled inside authRoutes.js
 */

router.use('/auth', authRoutes);

// These stay commented until you create related modules
// router.use('/users', userRoutes);
router.use('/products', productRoutes);
// router.use('/orders', orderRoutes);

/**
 * Health Check Route
 * -------------------
 * Used by server monitors or frontend to check if backend is alive.
 */
router.get('/health', (req, res) =>
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
);

/**
 * 404 Handler for undefined API endpoints
 * ---------------------------------------
 * Only applies to routes inside /api/v1
 */
router.use((req, res) =>
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
  })
);

module.exports = router;
