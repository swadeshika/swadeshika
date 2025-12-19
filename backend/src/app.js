// src/app.js

/**
 * Importing all core dependencies required for the Express application.
 * These handle routing, security, logging, sanitization, cookies, CORS, etc.
 */
const express = require('express');
const cors = require('cors');                       // Enables cross-origin requests
const helmet = require('helmet');                   // Secure HTTP headers
const rateLimit = require('express-rate-limit');    // Prevent brute-force attacks
const mongoSanitize = require('express-mongo-sanitize'); // Prevent NoSQL injections
const xss = require('xss-clean');                   // Prevent XSS attacks
const hpp = require('hpp');                         // Prevent HTTP param pollution
const cookieParser = require('cookie-parser');       // Parse cookies
const morgan = require('morgan');                   // HTTP request logging
const path = require('path');                       // File path utilities

/**
 * Importing environment variables and configurations.
 * Each config ensures centralized and consistent settings throughout the app.
 */
const { NODE_ENV, CORS_ORIGIN, RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX } = require('./config/env');

/**
 * Importing custom global error handlers.
 * - notFound: Triggered when a route does not exist
 * - errorHandler: Catches and formats all errors into a consistent API response
 */
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');

/**
 * Import all API routes (index.js inside routes folder)
 */
const apiRoutes = require('./routes');

/**
 * Create an Express application instance.
 * This is the core object responsible for managing all middleware and routing.
 */
const app = express();

/* ============================================================
   1. SECURITY: Add essential HTTP headers using Helmet
   ------------------------------------------------------------
   WHY?
   - Prevent common vulnerabilities (clickjacking, MIME sniffing, etc)
   - Make your API more resistant to attacks
   ============================================================ */
app.use(helmet());

/* ============================================================
   2. LOGGING: Show logs only in development mode
   ------------------------------------------------------------
   WHY?
   - Helpful while developing/debugging APIs
   - Avoids logs in production for performance & security
   ============================================================ */
if (NODE_ENV === 'development') app.use(morgan('dev'));

/* ============================================================
   3. RATE LIMITING: Protect API from brute-force attacks
   ------------------------------------------------------------
   WHY?
   - Avoid DDoS
   - Prevent someone from abusing your API with too many requests
   ------------------------------------------------------------
   Applies ONLY to routes starting with /api
   ============================================================ */
const limiter = rateLimit({
   max: RATE_LIMIT_MAX || 100,                         // Max requests allowed
   windowMs: RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,   // Time window
   message: "Too many requests, try again later.",      // Response message
});
app.use('/api', limiter);

/* ============================================================
   4. BODY PARSERS: Parse incoming request bodies
   ------------------------------------------------------------
   express.json()       -> Parse JSON body
   express.urlencoded() -> Parse form data (x-www-form-urlencoded)
   cookieParser()       -> Read cookies from request headers
   ============================================================ */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ============================================================
   5. SECURITY: Data Sanitization
   ------------------------------------------------------------
   mongoSanitize() -> Prevents NoSQL operators like $gt, $ne
   xss() -> Sanitizes input to prevent stored + reflected XSS
   ============================================================ */
app.use(mongoSanitize());
app.use(xss());

/* ============================================================
   6. SECURITY: Prevent Parameter Pollution
   ------------------------------------------------------------
   WHY?
   - Prevent attackers from sending repeated parameters to exploit logic
   Example:
     /api/products?sort=price&sort=stock   <-- dangerous
   ============================================================ */
app.use(hpp());

/* ============================================================
   7. CORS Configuration
   ------------------------------------------------------------
   WHY?
   - Allow frontend (React, Next.js, Admin panel) to call backend
   - credentials: true -> send cookies (refresh token)
   ============================================================ */
app.use(cors({
   origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // In development, allow any localhost/127.0.0.1
      // or exact match with config
      if (
         (NODE_ENV === 'development' && (origin.includes('localhost') || origin.includes('127.0.0.1'))) ||
         origin === CORS_ORIGIN
      ) {
         return callback(null, true);
      }

      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
   },
   credentials: true,     // Needed for cookies
}));

/* ============================================================
   8. STATIC FILES (Optional)
   ------------------------------------------------------------
   WHY?
   - Serve uploaded images, product images, or public assets
   ============================================================ */
app.use(express.static(path.join(__dirname, '..', 'public')));

/* ============================================================
   9. ROUTES
   ------------------------------------------------------------
   WHY?
   - All API routes are versioned under /api/v1 for maintainability
   - Example:  /api/v1/auth/register
   ============================================================ */
app.use('/api/v1', apiRoutes);

/* ============================================================
   10. GLOBAL ERROR HANDLERS
   ------------------------------------------------------------
   - notFound: Handles undefined routes (404)
   - errorHandler: Formats errors for consistent API responses
   ============================================================ */
app.use(notFound);
app.use(errorHandler);

/**
 * Export the configured Express application
 * so server.js can import and start it.
 */
module.exports = app;
