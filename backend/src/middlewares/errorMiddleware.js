// src/middlewares/errorMiddleware.js

/**
 * errorMiddleware.js
 * -------------------
 * Centralized error handling for the entire application.
 *
 * WHY DO WE NEED THIS?
 * ---------------------
 * - Prevents repeating try/catch in every controller.
 * - Ensures all errors return a consistent JSON response.
 * - Hides sensitive error details in production.
 * - Provides helpful debugging details during development.
 */

const { getMessage } = require('../constants/messages');


/**
 * asyncHandler()
 * --------------
 * Wraps async functions to catch errors automatically.
 *
 * WHY?
 * ----
 * In Express, async functions do NOT auto-catch errors.
 * Without this wrapper:
 *   - Every async controller needs try/catch (repeated code)
 * 
 * With asyncHandler:
 *   - If controller throws an error → forwarded to errorHandler
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);


/**
 * notFound()
 * ----------
 * Handles invalid API routes (404 Not Found)
 *
 * EXAMPLE:
 *   If user calls /api/v1/unknown-endpoint → this triggers.
 *
 * WHY USE A MIDDLEWARE INSTEAD OF ROUTES?
 * ----------------------------------------
 * Placed at end of routes → acts as a global fallback.
 */
const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: getMessage('NOT_FOUND')
  });
};


/**
 * errorHandler()
 * ---------------
 * Global error handler.
 *
 * WHAT IT DOES:
 * 1. Logs error details for debugging
 * 2. Sends consistent JSON error response
 * 3. Hides stack trace in production
 *
 * WHY IMPORTANT?
 * --------------
 * - Ensures no backend crashes when an uncaught error occurs
 * - Makes debugging easier
 * - Prevents exposing sensitive information in production
 */
const errorHandler = (err, req, res, next) => {

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Determine status code (default 500)
  const statusCode = err.statusCode || 500;

  // Create response object
  const response = {
    success: false,
    message: err.message || getMessage('INTERNAL_SERVER_ERROR'),
  };

  // Show extra debug info in development only
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
    response.code = err.code;
  }

  // Send error response
  res.status(statusCode).json(response);
};


module.exports = {
  errorHandler,
  asyncHandler,
  notFound
};
