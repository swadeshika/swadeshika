// src/constants/tokens.js
const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  RESET_PASSWORD: 'reset_password',
  VERIFY_EMAIL: 'verify_email',
};

const TOKEN_EXPIRATION = {
  [TOKEN_TYPES.ACCESS]: 15 * 60, // seconds
  [TOKEN_TYPES.REFRESH]: 7 * 24 * 60 * 60,
  [TOKEN_TYPES.RESET_PASSWORD]: 60 * 60,
  [TOKEN_TYPES.VERIFY_EMAIL]: 24 * 60 * 60,
};

const TOKEN_ERRORS = {
  INVALID: 'invalid_token',
  EXPIRED: 'token_expired',
  MISSING: 'missing_token',
};

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

const TOKEN_COOKIE_NAMES = {
  [TOKEN_TYPES.ACCESS]: 'access_token',
  [TOKEN_TYPES.REFRESH]: 'refresh_token',
};

const TOKEN_SETTINGS = {
  [TOKEN_TYPES.ACCESS]: { expiresIn: TOKEN_EXPIRATION[TOKEN_TYPES.ACCESS], subject: 'access' },
  [TOKEN_TYPES.REFRESH]: { expiresIn: TOKEN_EXPIRATION[TOKEN_TYPES.REFRESH], subject: 'refresh' },
  [TOKEN_TYPES.RESET_PASSWORD]: { expiresIn: TOKEN_EXPIRATION[TOKEN_TYPES.RESET_PASSWORD], subject: 'reset_password' },
  [TOKEN_TYPES.VERIFY_EMAIL]: { expiresIn: TOKEN_EXPIRATION[TOKEN_TYPES.VERIFY_EMAIL], subject: 'verify_email' },
};

const DEFAULT_TOKEN_EXPIRES_IN = '15m';

module.exports = {
  TOKEN_TYPES,
  TOKEN_EXPIRATION,
  TOKEN_ERRORS,
  COOKIE_OPTIONS,
  TOKEN_COOKIE_NAMES,
  TOKEN_SETTINGS,
  DEFAULT_TOKEN_EXPIRES_IN,
};
