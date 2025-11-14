// src/utils/jwt.js

/**
 * JWT Utility Functions
 * ---------------------
 * This file centralizes all logic related to:
 * - Generating access tokens
 * - Generating refresh tokens
 * - Verifying tokens
 * - Decoding tokens
 * - Extracting bearer token from headers
 *
 * This ensures secure and consistent JWT handling across the entire project.
 */

const jwt = require('jsonwebtoken');  // JSON Web Token library

// Import environment configs
const { JWT_SECRET, JWT_ISSUER } = require('../config/env');

// Import token constants
const {
  TOKEN_TYPES,
  TOKEN_EXPIRATION,
  TOKEN_ERRORS,
  TOKEN_SETTINGS
} = require('../constants/tokens');

/* ============================================================================
   1. Helper: Create standardized error object for token failures
   ----------------------------------------------------------------------------
   WHY?
   - JWT errors must be consistent across login, refresh, middleware, etc.
   - We attach a custom code so API can know WHY token failed.
   ============================================================================ */
const createTokenError = (code, message) => {
  const err = new Error(message);
  err.code = code;         // Custom error code (e.g., 'token_expired')
  return err;
};

/* ============================================================================
   2. Decode Token (WITHOUT verification)
   ----------------------------------------------------------------------------
   WHY?
   - Useful for debugging
   - Useful when you want to read payload without verifying signature
   ============================================================================ */
const decodeToken = (token) => {
  if (!token) return null;
  return jwt.decode(token, { complete: true });
};

/* ============================================================================
   3. Generate JWT options dynamically based on token type
   ----------------------------------------------------------------------------
   WHY?
   - Access / Refresh / Reset tokens have different expiry & subjects
   - Keeps code DRY & scalable
   ============================================================================ */
const getJwtOptions = (settings) => ({
  expiresIn: settings.expiresIn,     // TTL (e.g., 15m, 7d, 1h)
  subject: settings.subject,         // 'access' | 'refresh' | 'reset_password'
  issuer: JWT_ISSUER,                // Helps prevent token spoofing
  audience: 'swadeshika-users',      // Prevents token reuse across clients
  algorithm: 'HS256',                // Standard secure algorithm
});

/* ============================================================================
   4. Generate a JWT token (access, refresh, reset_password)
   ----------------------------------------------------------------------------
   payload = user data (id, role)
   type    = token type (access | refresh)

   WHY?
   - Centralized generator ensures consistency & security
   ============================================================================ */
const generateToken = (payload, type = TOKEN_TYPES.ACCESS) => {
  // Choose settings based on token type
  const settings =
    TOKEN_SETTINGS[type] ||
    { expiresIn: TOKEN_EXPIRATION[TOKEN_TYPES.ACCESS], subject: type };

  return jwt.sign(
    { ...payload, type },       // Add `type` inside token payload
    JWT_SECRET,
    getJwtOptions(settings)
  );
};

/* ============================================================================
   5. Verify token (and validate token type)
   ----------------------------------------------------------------------------
   - Ensures correct issuer, audience, signature
   - Ensures token type consistency (e.g., refresh token used ONLY for refresh)
   ============================================================================ */
const verifyToken = (token, expectedType = TOKEN_TYPES.ACCESS) => {
  if (!token) throw createTokenError('MISSING_TOKEN', TOKEN_ERRORS.MISSING);

  try {
    // Verify authenticity
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: 'swadeshika-users',
    });

    // Extra validation: ensure token is of correct type
    if (expectedType && decoded.type !== expectedType) {
      throw createTokenError(
        TOKEN_ERRORS.INVALID,
        `Invalid token type: expected ${expectedType}`
      );
    }

    return decoded;
  } catch (err) {
    // Custom error messages for clean API responses

    if (err.name === 'TokenExpiredError')
      throw createTokenError(TOKEN_ERRORS.EXPIRED, 'Token has expired');

    if (err.name === 'JsonWebTokenError')
      throw createTokenError(TOKEN_ERRORS.INVALID, 'Invalid token');

    throw err; // Unknown error (rare)
  }
};

/* ============================================================================
   6. Create BOTH access + refresh tokens together
   ----------------------------------------------------------------------------
   WHY?
   - Every login/register/refresh response needs both tokens
   - DRY approach keeps controller clean
   ============================================================================ */
const generateAuthTokens = (user) => {
  const accessToken = generateToken(
    { id: user.id, role: user.role },
    TOKEN_TYPES.ACCESS
  );

  const refreshToken = generateToken(
    { id: user.id, role: user.role },
    TOKEN_TYPES.REFRESH
  );

  return {
    access: {
      token: accessToken,
      expiresIn: TOKEN_EXPIRATION[TOKEN_TYPES.ACCESS],
    },
    refresh: {
      token: refreshToken,
      expiresIn: TOKEN_EXPIRATION[TOKEN_TYPES.REFRESH],
    },
  };
};

/* ============================================================================
   7. Extract Bearer Token from Authorization Header
   ----------------------------------------------------------------------------
   Example: "Authorization: Bearer eyJhbGciOiJIUzI1Ni..."
   ============================================================================ */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;

  const [bearer, token] = authHeader.split(' ');

  if (!bearer || !token) return null;
  if (bearer.toLowerCase() !== 'bearer') return null;

  return token;
};

/* ============================================================================
   EXPORTS
   ----------------------------------------------------------------------------
   Expose functions so controllers/middlewares can use them.
   ============================================================================ */
module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
  generateAuthTokens,
  extractTokenFromHeader,
  createTokenError,
  TOKEN_TYPES,
  TOKEN_ERRORS,
};
