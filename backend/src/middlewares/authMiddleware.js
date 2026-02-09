// src/middlewares/authMiddleware.js

/**
 * authMiddleware.js
 * ------------------
 * Contains all authentication & authorization middlewares.
 *
 * WHAT THIS FILE HANDLES:
 * -----------------------
 * 1. Authenticate user using Access Token
 * 2. Authorize user based on roles (admin, customer)
 * 3. Check permissions for advanced access control
 * 4. Guest protection to prevent logged-in users from using guest routes
 * 5. selfOrAdmin → Only owner of resource OR Admin can perform action
 *
 * These middlewares ensure security across your entire backend.
 */

const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
const { getMessage } = require('../constants/messages');
const UserModel = require('../models/userModel');
const { TOKEN_TYPES } = require('../constants/tokens');
const { hasRole, hasPermission, ROLES } = require('../constants/roles');


/**
 * optionalAuthenticate()
 * -----------------------
 * If an Authorization header/token is present, try to authenticate and attach `req.user`.
 * If no token is present or verification fails, do NOT block the request — just continue
 * with `req.user` undefined. This is useful for guest-friendly routes like checkout.
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || req.headers.Authorization;
    const token = extractTokenFromHeader(header);

    if (!token) {
      req.user = null;
      return next();
    }

    // Try verifying token. If it fails, don't block the request.
    try {
      const decoded = verifyToken(token, TOKEN_TYPES.ACCESS);
      const user = await UserModel.findById(decoded.id);
      req.user = user || null;
    } catch (err) {
      req.user = null;
    }

    return next();
  } catch (err) {
    req.user = null;
    return next();
  }
};

/**
 * 🔐 authenticate()
 * -----------------
 * Checks if the request contains a valid Access Token.
 *
 * FLOW:
 * -----
 * 1. Extract token from Authorization header (Bearer token)
 * 2. Verify JWT & ensure it's an ACCESS type token
 * 3. Get user from database
 * 4. Attach user object to req.user
 *
 * If ANYTHING fails → return 401 Unauthorized
 */
const authenticate = async (req, res, next) => {
  try {
    // ---------------------------------------------------------
    // 1. Extract Token from Header
    // ---------------------------------------------------------
    // Authorization header may be "authorization" (lowercase) on some clients
    const header = req.headers.authorization || req.headers.Authorization;

    // Extract token from header → returns null if invalid/missing
    const token = extractTokenFromHeader(header);
    if (!token)
      return res.status(401).json({
        success: false,
        message: getMessage('TOKEN_REQUIRED')
      });

    // ---------------------------------------------------------
    // 2. Verify Token Authenticity
    // ---------------------------------------------------------
    // Uses crypto library to verify the JWT signature against our secret key.
    // Also ensures it's an ACCESS type token (not a refresh token).
    const decoded = verifyToken(token, TOKEN_TYPES.ACCESS);

    // ---------------------------------------------------------
    // 3. Load User from Database
    // ---------------------------------------------------------
    // The token contains the user's ID. We fetch the full user profile.
    const user = await UserModel.findById(decoded.id);
    if (!user)
      return res.status(401).json({
        success: false,
        message: getMessage('USER_NOT_FOUND')
      });

    // ---------------------------------------------------------
    // 4. Attach User to Request
    // ---------------------------------------------------------
    // Attach user to request for future middlewares/controllers to use.
    // e.g. req.user.id, req.user.role
    req.user = user;

    // DIAGNOSTIC LOGGING: Log user role for debugging
    // console.log(`[AUTH] User Authenticated: ${user.email}, Role: ${user.role}`);

    next();
  } catch (err) {
    // ---------------------------------------------------------
    // 5. Handle Verification Errors
    // ---------------------------------------------------------
    // Access token expired → ask user to refresh
    if (err.code === 'token_expired' || err.message === 'Token has expired') {
      return res.status(401).json({
        success: false,
        message: getMessage('ACCESS_TOKEN_EXPIRED'),
      });
    }

    // Invalid or malformed token
    return res.status(401).json({
      success: false,
      message: getMessage('INVALID_TOKEN'),
    });
  }
};


/**
 * 🔐 authorize(allowedRoles)
 * --------------------------
 * ROLE-BASED ACCESS CONTROL (RBAC)
 *
 * Example Usage:
 *  router.get("/admin/products", authenticate, authorize("admin"), ...)
 *
 * WHY USE IT?
 * -----------
 * - Some routes must be admin-only (e.g., add products)
 * - Some routes customer-only (e.g., place order)
 */
const authorize = (allowedRoles = []) => {
  // Convert to array if user passed single role string
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({
        success: false,
        message: getMessage('UNAUTHORIZED'),
      });

    // Check if user's role is allowed
    // Normalize user role and allowed roles for case-insensitive comparison
    const userRole = req.user.role ? req.user.role.toLowerCase().trim() : '';
    const normalizedAllowedRoles = roles.map(r => r.toLowerCase().trim());

    if (!hasRole(userRole, normalizedAllowedRoles)) {
      console.warn(`[AUTH] Access Denied: User role '${userRole}' not in allowed roles [${normalizedAllowedRoles.join(', ')}]`);
      return res.status(403).json({
        success: false,
        message: getMessage('FORBIDDEN'),
      });
    }

    next();
  };
};


/**
 * 🔐 hasPermissions(requiredPermissions)
 * ---------------------------------------
 * PERMISSION-BASED ACCESS CONTROL (PBAC)
 *
 * EXAMPLE:
 *   hasPermissions("manage_products")
 *
 * More granular than roles.
 *
 * WHY NEEDED?
 * -----------
 * Example:
 * - Manager may edit products but not delete users
 */
const hasPermissions = (requiredPermissions = []) => {
  const perms = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({
        success: false,
        message: getMessage('UNAUTHORIZED'),
      });

    // User must have ALL permissions in array
    const ok = perms.every((p) => hasPermission(req.user.role, p));

    if (!ok)
      return res.status(403).json({
        success: false,
        message: getMessage('FORBIDDEN'),
      });

    next();
  };
};


/**
 * 🚫 guest()
 * ----------
 * Prevents logged-in users from accessing guest-only routes.
 *
 * EXAMPLE:
 * --------
 * router.post('/register', guest, registerController)
 *
 * WHY?
 * ----
 * Logged-in user should NOT see register/login pages again.
 */
const guest = (req, res, next) => {
  const header = req.headers.authorization || req.headers.Authorization;
  const token = extractTokenFromHeader(header);

  if (token)
    return res.status(403).json({
      success: false,
      message: 'You are already logged in',
    });

  next();
};


/**
 * 👤 selfOrAdmin(idParam = "id")
 * -----------------------------
 * Allows ONLY:
 *   - The user themselves, OR
 *   - An admin
 *
 * EXAMPLE:
 * --------
 * router.get("/users/:id", selfOrAdmin("id"), userController.getUser)
 *
 * WHY?
 * ----
 * Prevents users from accessing other users' data.
 */
const selfOrAdmin = (idParam = 'id') => [
  authenticate, // Must be logged in first
  (req, res, next) => {
    try {
      const resourceId = req.params[idParam];

      // Allow admin OR the owner
      if (req.user.role === ROLES.ADMIN || req.user.id === resourceId)
        return next();

      return res.status(403).json({
        success: false,
        message: getMessage('FORBIDDEN'),
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: getMessage('INTERNAL_SERVER_ERROR'),
      });
    }
  },
];


module.exports = {
  authenticate,
  authorize,
  hasPermissions,
  guest,
  selfOrAdmin,
  optionalAuthenticate,
};
