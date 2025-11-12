/**
 * Application constants
 * This file contains all the constant values used throughout the application
 */

module.exports = {
  // Pagination defaults
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    DEFAULT_PAGE: 1,
  },

  // Password requirements
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_NUMBERS: true,
    REQUIRE_SYMBOLS: true,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
  },

  // Bcrypt salt rounds for password hashing
  SALT_ROUNDS: process.env.SALT_ROUNDS || 10,

  // Token types
  TOKEN_TYPES: {
    ACCESS: 'access',
    REFRESH: 'refresh',
    RESET_PASSWORD: 'reset_password',
    VERIFY_EMAIL: 'verify_email',
  },

  // User roles
  ROLES: {
    ADMIN: 'admin',
    CUSTOMER: 'customer',
    GUEST: 'guest',
  },

  // Default user settings
  USER_DEFAULTS: {
    ROLE: 'customer',
    IS_ACTIVE: true,
    IS_EMAIL_VERIFIED: false,
  },

  // Token expiration times (in seconds)
  TOKEN_EXPIRATION: {
    ACCESS: 15 * 60, // 15 minutes
    REFRESH: 7 * 24 * 60 * 60, // 7 days
    RESET_PASSWORD: 60 * 60, // 1 hour
    VERIFY_EMAIL: 24 * 60 * 60, // 24 hours
  },

  // HTTP status codes
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    VALIDATION_ERROR: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  },

  // Rate limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100, // limit each IP to 100 requests per windowMs
    MESSAGE: 'Too many requests, please try again later.',
  },

  // File upload
  FILE_UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
    UPLOAD_PATH: 'uploads/',
  },

  // Sorting
  SORT_ORDER: {
    ASC: 'asc',
    DESC: 'desc',
  },
};
