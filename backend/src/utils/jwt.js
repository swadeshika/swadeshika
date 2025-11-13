// src/utils/jwt.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_ISSUER } = require('../config/env');
const {
  TOKEN_TYPES,
  TOKEN_EXPIRATION,
  TOKEN_ERRORS,
  TOKEN_SETTINGS
} = require('../constants/tokens');

const createTokenError = (code, message) => {
  const err = new Error(message);
  err.code = code;
  return err;
};

const decodeToken = (token) => {
  if (!token) return null;
  return jwt.decode(token, { complete: true });
};

const getJwtOptions = (settings) => ({
  expiresIn: settings.expiresIn,
  subject: settings.subject,
  issuer: JWT_ISSUER,
  audience: 'swadeshika-users',
  algorithm: 'HS256',
});

const generateToken = (payload, type = TOKEN_TYPES.ACCESS) => {
  const settings = TOKEN_SETTINGS[type] || { expiresIn: TOKEN_EXPIRATION[TOKEN_TYPES.ACCESS], subject: type };
  return jwt.sign({ ...payload, type }, JWT_SECRET, getJwtOptions(settings));
};

const verifyToken = (token, expectedType = TOKEN_TYPES.ACCESS) => {
  if (!token) throw createTokenError('MISSING_TOKEN', TOKEN_ERRORS.MISSING);
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: 'swadeshika-users',
    });
    if (expectedType && decoded.type !== expectedType) {
      throw createTokenError(TOKEN_ERRORS.INVALID, `Invalid token type: expected ${expectedType}`);
    }
    return decoded;
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw createTokenError(TOKEN_ERRORS.EXPIRED, 'Token has expired');
    if (err.name === 'JsonWebTokenError') throw createTokenError(TOKEN_ERRORS.INVALID, 'Invalid token');
    throw err;
  }
};

/**
 * Returns object:
 * {
 *   access: { token, expiresIn },
 *   refresh: { token, expiresIn }
 * }
 */
const generateAuthTokens = (user) => {
  const accessToken = generateToken({ id: user.id, role: user.role }, TOKEN_TYPES.ACCESS);
  const refreshToken = generateToken({ id: user.id, role: user.role }, TOKEN_TYPES.REFRESH);

  return {
    access: { token: accessToken, expiresIn: TOKEN_EXPIRATION[TOKEN_TYPES.ACCESS] },
    refresh: { token: refreshToken, expiresIn: TOKEN_EXPIRATION[TOKEN_TYPES.REFRESH] },
  };
};

const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;
  const [bearer, token] = authHeader.split(' ');
  if (!bearer || !token) return null;
  if (bearer.toLowerCase() !== 'bearer') return null;
  return token;
};

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
