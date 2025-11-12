const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');
const { TOKEN_TYPES } = require('../constants/tokens');

/**
 * Generate a JWT token with the provided payload
 * @param {Object} payload - The data to include in the token
 * @param {string} [type='access'] - The type of token (access or refresh)
 * @returns {string} The generated JWT token
 */
const generateToken = (payload, type = 'access') => {
  const expiresIn = type === 'refresh' 
    ? '30d' // Refresh token expires in 30 days
    : JWT_EXPIRES_IN; // Access token uses configured expiration

  return jwt.sign(
    { 
      ...payload, 
      type 
    },
    JWT_SECRET,
    { expiresIn }
  );
};

/**
 * Verify a JWT token
 * @param {string} token - The JWT token to verify
 * @param {string} [type='access'] - The expected token type
 * @returns {Object} The decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyToken = (token, type = 'access') => {
  try {
    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify token type if specified
    if (type && decoded.type !== type) {
      throw new Error(`Invalid token type: expected ${type}`);
    }
    
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - The Authorization header value
 * @returns {string|null} The extracted token or null if not found
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }
  
  return null;
};

/**
 * Generate both access and refresh tokens for a user
 * @param {Object} user - The user object
 * @returns {Object} Object containing access and refresh tokens
 */
const generateAuthTokens = (user) => {
  const accessToken = generateToken(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    TOKEN_TYPES.ACCESS
  );
  
  const refreshToken = generateToken(
    { 
      id: user.id,
      tokenVersion: user.tokenVersion || 0 
    },
    TOKEN_TYPES.REFRESH
  );
  
  return {
    accessToken,
    refreshToken,
  };
};

module.exports = {
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  generateAuthTokens,
};
