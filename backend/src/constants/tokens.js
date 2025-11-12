/**
 * Token Types and Configurations
 * 
 * This file defines the different types of tokens used in the application
 * and their respective configurations.
 */

// Token types
exports.TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  RESET_PASSWORD: 'reset_password',
  VERIFY_EMAIL: 'verify_email',
};

// Token expiration times (in seconds)
exports.TOKEN_EXPIRATION = {
  [this.TOKEN_TYPES.ACCESS]: '15m',      // 15 minutes
  [this.TOKEN_TYPES.REFRESH]: '7d',      // 7 days
  [this.TOKEN_TYPES.RESET_PASSWORD]: '1h', // 1 hour
  [this.TOKEN_TYPES.VERIFY_EMAIL]: '24h', // 24 hours
};

/**
 * Get expiration time for a token type
 * @param {string} tokenType - The type of token
 * @returns {string} Expiration time string
 */
exports.getTokenExpiration = (tokenType) => {
  return this.TOKEN_EXPIRATION[tokenType] || '1h'; // Default to 1 hour if not specified
};

/**
 * Check if a token type is valid
 * @param {string} tokenType - The token type to validate
 * @returns {boolean} True if the token type is valid
 */
exports.isValidTokenType = (tokenType) => {
  return Object.values(this.TOKEN_TYPES).includes(tokenType);
};

// Token cookie names
exports.TOKEN_COOKIE_NAMES = {
  [this.TOKEN_TYPES.ACCESS]: 'access_token',
  [this.TOKEN_TYPES.REFRESH]: 'refresh_token',
};

// HTTP-only cookie settings
exports.COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
  sameSite: 'strict',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

// Token blacklist key prefixes for Redis
exports.TOKEN_BLACKLIST_PREFIX = 'token_blacklist:';

// Token usage types for tracking and validation
exports.TOKEN_USAGE = {
  AUTH: 'auth',
  PASSWORD_RESET: 'password_reset',
  EMAIL_VERIFICATION: 'email_verification',
  API_KEY: 'api_key',
};

// Token validation error codes
exports.TOKEN_ERRORS = {
  EXPIRED: 'TokenExpiredError',
  INVALID: 'JsonWebTokenError',
  NOT_BEFORE: 'NotBeforeError',
};

// Default token settings for different operations
exports.TOKEN_SETTINGS = {
  [this.TOKEN_TYPES.ACCESS]: {
    expiresIn: this.TOKEN_EXPIRATION[this.TOKEN_TYPES.ACCESS],
    subject: 'access',
  },
  [this.TOKEN_TYPES.REFRESH]: {
    expiresIn: this.TOKEN_EXPIRATION[this.TOKEN_TYPES.REFRESH],
    subject: 'refresh',
  },
  [this.TOKEN_TYPES.RESET_PASSWORD]: {
    expiresIn: this.TOKEN_EXPIRATION[this.TOKEN_TYPES.RESET_PASSWORD],
    subject: 'reset_password',
  },
  [this.TOKEN_TYPES.VERIFY_EMAIL]: {
    expiresIn: this.TOKEN_EXPIRATION[this.TOKEN_TYPES.VERIFY_EMAIL],
    subject: 'verify_email',
  },
};

module.exports = {
  ...this,
  // Re-export everything for easier imports
  default: {
    ...this.TOKEN_TYPES,
    ...this.TOKEN_EXPIRATION,
    ...this.TOKEN_COOKIE_NAMES,
    ...this.COOKIE_OPTIONS,
    ...this.TOKEN_USAGE,
    ...this.TOKEN_ERRORS,
    ...this.TOKEN_SETTINGS,
    getTokenExpiration: this.getTokenExpiration,
    isValidTokenType: this.isValidTokenType,
  },
};
