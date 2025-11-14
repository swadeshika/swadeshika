// src/constants/roles.js

// ------------------------------------------------------
// 1. User roles in the system
// ------------------------------------------------------
// These are the 3 types of users your ecommerce platform supports.
// ADMIN    → Manages everything (panel access)
// CUSTOMER → Regular user who buys products
// GUEST    → Not logged in (only browsing)
const ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  GUEST: 'guest',
};

// ------------------------------------------------------
// 2. Role hierarchy (very important for authorization)
// ------------------------------------------------------
// This decides “who is more powerful than whom”.
//
// Example:
//   ADMIN > CUSTOMER > GUEST
//
// Meaning:
//   - ADMIN can do everything CUSTOMER and GUEST can do
//   - CUSTOMER can do everything GUEST can do
//   - GUEST has minimum access
const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.CUSTOMER, ROLES.GUEST],
  [ROLES.CUSTOMER]: [ROLES.CUSTOMER, ROLES.GUEST],
  [ROLES.GUEST]: [ROLES.GUEST],
};

// ------------------------------------------------------
// 3. Permissions specific to each role
// ------------------------------------------------------
// Helps when you need very fine-grained control.
//
// Example:
//   CUSTOMER can only view products or place orders,
//   ADMIN can manage everything.
//
// You can easily check:
//   hasPermission('customer', 'place_orders') → true
//   hasPermission('customer', 'manage_users') → false
const PERMISSIONS = {
  [ROLES.ADMIN]: [
    'manage_users',
    'manage_products',
    'manage_orders',
    'view_reports',
    'manage_settings',
  ],
  [ROLES.CUSTOMER]: [
    'view_products',
    'place_orders',
    'view_own_orders',
    'update_profile',
  ],
  [ROLES.GUEST]: [
    'browse_products',
    'view_product_details',
    'register',
  ],
};

// ------------------------------------------------------
// 4. Permission Checker
// ------------------------------------------------------
// *Checks whether a user role has access to a specific permission*
// 
// Logic:
//   - If userRole is missing → treat as GUEST
//   - Get all roles allowed by hierarchy
//   - Check if any of those roles contain the required permission
//
// Example:
//   hasPermission('admin', 'place_orders') → true (ADMIN > CUSTOMER)
//   hasPermission('customer', 'manage_users') → false
const hasPermission = (userRole, permission) => {
  if (!userRole) userRole = ROLES.GUEST; // Fallback for safety
  const roles = ROLE_HIERARCHY[userRole] || [ROLES.GUEST];
  return roles.some(r => PERMISSIONS[r] && PERMISSIONS[r].includes(permission));
};

// ------------------------------------------------------
// 5. Role Checker (simple role-based access)
// ------------------------------------------------------
// Used when checking user role directly (not individual permissions)
//
// Example:
//   hasRole('admin', ['customer']) → true (because admin > customer)
//   hasRole('customer', ['admin']) → false
//   hasRole('guest', ['customer']) → false
//
// Works together with middleware: authorize(['admin'])
const hasRole = (userRole, requiredRoles) => {
  if (!userRole) return false;
  const rolesToCheck = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  // Get all allowed roles for current user, based on hierarchy
  const userRoles = ROLE_HIERARCHY[userRole] || [];

  // Check whether any requiredRole exists inside user's hierarchy
  return rolesToCheck.some(role => userRoles.includes(role));
};

// Export all constants & utilities
module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  PERMISSIONS,
  hasPermission,
  hasRole
};
