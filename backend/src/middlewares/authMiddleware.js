// src/middlewares/authMiddleware.js
const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');
const { getMessage } = require('../constants/messages');
const UserModel = require('../models/userModel');
const { TOKEN_TYPES } = require('../constants/tokens');
const { hasRole, hasPermission, ROLES } = require('../constants/roles');

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || req.headers.Authorization;
    const token = extractTokenFromHeader(header);
    if (!token) return res.status(401).json({ success: false, message: getMessage('TOKEN_REQUIRED') });

    const decoded = verifyToken(token, TOKEN_TYPES.ACCESS);
    const user = await UserModel.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: getMessage('USER_NOT_FOUND') });

    req.user = user;
    next();
  } catch (err) {
    if (err.code === 'token_expired' || err.message === 'Token has expired') {
      return res.status(401).json({ success: false, message: getMessage('REFRESH_TOKEN_EXPIRED') });
    }
    return res.status(401).json({ success: false, message: getMessage('INVALID_TOKEN') });
  }
};

const authorize = (allowedRoles = []) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: getMessage('UNAUTHORIZED') });
    if (!hasRole(req.user.role, roles)) return res.status(403).json({ success: false, message: getMessage('FORBIDDEN') });
    next();
  };
};

const hasPermissions = (requiredPermissions = []) => {
  const perms = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: getMessage('UNAUTHORIZED') });
    const ok = perms.every(p => hasPermission(req.user.role, p));
    if (!ok) return res.status(403).json({ success: false, message: getMessage('FORBIDDEN') });
    next();
  };
};

const guest = (req, res, next) => {
  const header = req.headers.authorization || req.headers.Authorization;
  const token = extractTokenFromHeader(header);
  if (token) return res.status(403).json({ success: false, message: 'You are already logged in' });
  next();
};

const selfOrAdmin = (idParam = 'id') => [
  authenticate,
  (req, res, next) => {
    try {
      const resourceId = req.params[idParam];
      if (req.user.role === ROLES.ADMIN || req.user.id === resourceId) return next();
      return res.status(403).json({ success: false, message: getMessage('FORBIDDEN') });
    } catch (err) {
      return res.status(500).json({ success: false, message: getMessage('INTERNAL_SERVER_ERROR') });
    }
  }
];

module.exports = { authenticate, authorize, hasPermissions, guest, selfOrAdmin };
