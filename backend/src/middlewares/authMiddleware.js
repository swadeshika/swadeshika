const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
const { ROLES, hasPermission, hasRole } = require('../constants/roles');
const { getMessage } = require('../constants/messages');
const UserModel = require('../models/userModel');
const { TOKEN_TYPES } = require('../constants/tokens');

/**
 * Authentication Middleware
 * 
 * This middleware verifies the JWT token from the Authorization header
 * and attaches the authenticated user to the request object.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: getMessage('TOKEN_REQUIRED'),
      });
    }

    // Verify the access token
    const decoded = verifyToken(token, TOKEN_TYPES.ACCESS);

    // Check if the token is blacklisted (optional, requires Redis)
    // const isBlacklisted = await redisClient.get(`blacklist_${token}`);
    // if (isBlacklisted) {
    //   return res.status(401).json({
    //     success: false,
    //     message: getMessage('INVALID_TOKEN'),
    //   });
    // }

    // Get user from database
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: getMessage('USER_NOT_FOUND'),
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: getMessage('TOKEN_EXPIRED'),
        code: 'TOKEN_EXPIRED',
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: getMessage('INVALID_TOKEN'),
        code: 'INVALID_TOKEN',
      });
    }
    
    // For other errors
    return res.status(401).json({
      success: false,
      message: getMessage('UNAUTHORIZED'),
      code: 'AUTH_ERROR',
    });
  }
};

/**
 * Role-based Access Control Middleware
 * 
 * This middleware checks if the authenticated user has the required role(s)
 * to access a particular route.
 * 
 * @param {string|string[]} allowedRoles - Single role or array of roles that are allowed
 * @returns {Function} Express middleware function
 */
const authorize = (allowedRoles = []) => {
  // Convert single role to array for consistency
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: getMessage('UNAUTHORIZED'),
        });
      }

      // Check if user has any of the allowed roles
      const hasRequiredRole = hasRole(req.user.role, roles);
      
      if (!hasRequiredRole) {
        return res.status(403).json({
          success: false,
          message: getMessage('FORBIDDEN'),
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        success: false,
        message: getMessage('INTERNAL_SERVER_ERROR'),
      });
    }
  };
};

/**
 * Permission-based Access Control Middleware
 * 
 * This middleware checks if the authenticated user has the required permission(s)
 * to access a particular route.
 * 
 * @param {string|string[]} requiredPermissions - Single permission or array of permissions required
 * @returns {Function} Express middleware function
 */
const hasPermissions = (requiredPermissions = []) => {
  // Convert single permission to array for consistency
  const permissions = Array.isArray(requiredPermissions) 
    ? requiredPermissions 
    : [requiredPermissions];
  
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: getMessage('UNAUTHORIZED'),
        });
      }

      // Check if user has all required permissions
      const hasAllPermissions = permissions.every(permission => 
        hasPermission(req.user.role, permission)
      );
      
      if (!hasAllPermissions) {
        return res.status(403).json({
          success: false,
          message: getMessage('FORBIDDEN'),
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        message: getMessage('INTERNAL_SERVER_ERROR'),
      });
    }
  };
};

/**
 * Guest Middleware
 * 
 * This middleware ensures that the route is only accessible to non-authenticated users.
 * Useful for login/register pages that should not be accessible to logged-in users.
 */
const guest = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = extractTokenFromHeader(authHeader);
  
  if (token) {
    return res.status(403).json({
      success: false,
      message: 'You are already logged in',
    });
  }
  
  next();
};

/**
 * Self or Admin Middleware
 * 
 * This middleware allows access if the user is an admin or the owner of the resource.
 * The resource ID should be in the route params (e.g., /users/:userId).
 * 
 * @param {string} idParam - The name of the route parameter containing the resource ID
 * @returns {Function} Express middleware function
 */
const selfOrAdmin = (idParam = 'id') => {
  return [
    authenticate,
    (req, res, next) => {
      try {
        const resourceId = req.params[idParam];
        
        // Allow access if user is an admin or the owner of the resource
        if (req.user.role === ROLES.ADMIN || req.user.id === resourceId) {
          return next();
        }
        
        return res.status(403).json({
          success: false,
          message: getMessage('FORBIDDEN'),
        });
      } catch (error) {
        console.error('Self or admin check error:', error);
        return res.status(500).json({
          success: false,
          message: getMessage('INTERNAL_SERVER_ERROR'),
        });
      }
    },
  ];
};

module.exports = {
  authenticate,
  authorize,
  hasPermissions,
  guest,
  selfOrAdmin,
  // Aliases for backward compatibility
  isAuthenticated: authenticate,
  isAdmin: authorize(ROLES.ADMIN),
  isCustomer: authorize(ROLES.CUSTOMER),
};
