// src/constants/tokens.js

// ------------------------------
// 1. Allowed token types
// ------------------------------
const TOKEN_TYPES = {
  ACCESS: 'access',                // Used for authorization (short-lived)
  REFRESH: 'refresh',              // Used to get a new access token (long-lived)
  RESET_PASSWORD: 'reset_password',// Used when user resets password
  VERIFY_EMAIL: 'verify_email',    // Used for email verification
};

// ------------------------------
// 2. Token expiration times
// (in seconds)
// ------------------------------
const TOKEN_EXPIRATION = {
  [TOKEN_TYPES.ACCESS]: 15 * 60,            // 15 minutes (short-lived for security)
  [TOKEN_TYPES.REFRESH]: 30 * 24 * 60 * 60, // 30 days (changed from 7 days - keeps user logged in)
  [TOKEN_TYPES.RESET_PASSWORD]: 60 * 60,    // 1 hour
  [TOKEN_TYPES.VERIFY_EMAIL]: 24 * 60 * 60, // 24 hours
};

// ------------------------------
// 3. Token-related error codes
// Standardized error codes for consistent responses
// ------------------------------
const TOKEN_ERRORS = {
  INVALID: 'invalid_token',
  EXPIRED: 'token_expired',
  MISSING: 'missing_token',
};

// ------------------------------
// 4. Options for storing refresh tokens in cookies
// Applies ONLY to refresh tokens
// Access token is NEVER stored in cookie (only sent in response)
// ------------------------------
const COOKIE_OPTIONS = {
  httpOnly: true,                             // JavaScript cannot access cookie (prevents XSS)
  secure: process.env.NODE_ENV === 'production', // Send only over HTTPS in production
  sameSite: 'strict',                         // Prevent CSRF by not sending cookie cross-site
  maxAge: 30 * 24 * 60 * 60 * 1000,           // Cookie expiry = 30 days (changed from 7)
  path: '/',                                  // Cookie valid for entire domain
};

// ------------------------------
// 5. Cookie names for different token types
// (rarely used now because access tokens are not stored in cookies)
// ------------------------------
const TOKEN_COOKIE_NAMES = {
  [TOKEN_TYPES.ACCESS]: 'access_token',
  [TOKEN_TYPES.REFRESH]: 'refresh_token',
};

// ------------------------------
// 6. Default JWT configuration for each token type
// Used by utils/jwt.js to generate token with correct settings
// ------------------------------
const TOKEN_SETTINGS = {
  [TOKEN_TYPES.ACCESS]: {
    expiresIn: TOKEN_EXPIRATION[TOKEN_TYPES.ACCESS],   // 15 minutes
    subject: 'access',                                 // JWT "sub" field
  },
  [TOKEN_TYPES.REFRESH]: {
    expiresIn: TOKEN_EXPIRATION[TOKEN_TYPES.REFRESH],  // 7 days
    subject: 'refresh',
  },
  [TOKEN_TYPES.RESET_PASSWORD]: {
    expiresIn: TOKEN_EXPIRATION[TOKEN_TYPES.RESET_PASSWORD], // 1 hour
    subject: 'reset_password',
  },
  [TOKEN_TYPES.VERIFY_EMAIL]: {
    expiresIn: TOKEN_EXPIRATION[TOKEN_TYPES.VERIFY_EMAIL], // 24 hours
    subject: 'verify_email',
  },
};

// ------------------------------
// 7. Fallback value for token expiry
// Used when no expiry is provided manually
// ------------------------------
const DEFAULT_TOKEN_EXPIRES_IN = '15m';

// Export all constants so they can be used across the project
module.exports = {
  TOKEN_TYPES,
  TOKEN_EXPIRATION,
  TOKEN_ERRORS,
  COOKIE_OPTIONS,
  TOKEN_COOKIE_NAMES,
  TOKEN_SETTINGS,
  DEFAULT_TOKEN_EXPIRES_IN,
};
