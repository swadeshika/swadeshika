const { getMessage } = require('../constants/messages');
const { TOKEN_ERRORS } = require('../constants/tokens');

/**
 * Error response utility function
 * @param {Error} err - Error object
 * @returns {Object} Formatted error response
 */
const errorResponse = (err) => {
  // Default error structure
  const error = {
    success: false,
    message: err.message || 'Internal Server Error',
    code: err.code,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.message = getMessage('VALIDATION_ERROR');
    error.errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
      type: e.kind,
    }));
    error.statusCode = 400;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error.message = getMessage('INVALID_TOKEN');
    error.code = TOKEN_ERRORS.INVALID;
    error.statusCode = 401;
  }

  // Handle duplicate key errors (MongoDB)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = getMessage('DUPLICATE_FIELD', { field });
    error.fields = [field];
    error.statusCode = 400;
  }

  // Handle CastError (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    error.message = getMessage('INVALID_ID', { id: err.value });
    error.statusCode = 400;
  }

  // Default status code if not set
  error.statusCode = error.statusCode || err.statusCode || 500;

  return error;
};

/**
 * Global error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const errorHandler = (err, req, res, next) => {
  // Log the error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Format the error response
  const error = errorResponse(err);

  // Remove stack trace in production
  if (process.env.NODE_ENV === 'production') {
    delete error.stack;
  }

  // Send the error response
  res.status(error.statusCode).json({
    success: error.success,
    message: error.message,
    code: error.code,
    ...(error.errors && { errors: error.errors }),
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
  });
};

/**
 * Async handler to wrap async/await route handlers
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped route handler with error handling
 */
const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

module.exports = {
  errorHandler,
  asyncHandler,
  ApiError,
  notFound,
};
