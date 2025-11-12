/**
 * User Roles and Permissions
 * 
 * This file defines the different user roles and their associated permissions
 * in the application. Each role has a specific set of permissions that determine
 * what actions a user with that role can perform.
 */

// Base user roles
const ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  GUEST: 'guest',
};

// Role hierarchy (higher roles inherit permissions from lower roles)
const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.CUSTOMER, ROLES.GUEST],
  [ROLES.CUSTOMER]: [ROLES.CUSTOMER, ROLES.GUEST],
  [ROLES.GUEST]: [ROLES.GUEST],
};

// Permissions for each role
const PERMISSIONS = {
  // Admin permissions
  [ROLES.ADMIN]: [
    'manage_users',
    'manage_products',
    'manage_orders',
    'manage_categories',
    'view_reports',
    'manage_settings',
  ],
  
  // Customer permissions
  [ROLES.CUSTOMER]: [
    'view_products',
    'place_orders',
    'view_own_orders',
    'update_profile',
    'manage_wishlist',
    'write_reviews',
  ],
  
  // Guest permissions (unauthenticated users)
  [ROLES.GUEST]: [
    'browse_products',
    'view_product_details',
    'register',
  ],
};

/**
 * Check if a user with the given role has the specified permission
 * @param {string} userRole - The user's role
 * @param {string} permission - The permission to check
 * @returns {boolean} True if the user has the permission, false otherwise
 */
const hasPermission = (userRole, permission) => {
  if (!userRole) userRole = ROLES.GUEST;
  
  // Get all roles the user has access to
  const roles = ROLE_HIERARCHY[userRole] || [ROLES.GUEST];
  
  // Check if any of the user's roles have the requested permission
  return roles.some(role => 
    PERMISSIONS[role] && PERMISSIONS[role].includes(permission)
  );
};

/**
 * Check if a user has any of the specified roles
 * @param {string} userRole - The user's role
 * @param {string|string[]} requiredRoles - The role(s) to check against
 * @returns {boolean} True if the user has any of the required roles
 */
const hasRole = (userRole, requiredRoles) => {
  if (!userRole) return false;
  
  const rolesToCheck = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  const userRoles = ROLE_HIERARCHY[userRole] || [];
  
  return rolesToCheck.some(role => userRoles.includes(role));
};

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  PERMISSIONS,
  hasPermission,
  hasRole,
};
