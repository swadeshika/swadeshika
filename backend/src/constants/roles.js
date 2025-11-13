// src/constants/roles.js
const ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  GUEST: 'guest',
};

const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.CUSTOMER, ROLES.GUEST],
  [ROLES.CUSTOMER]: [ROLES.CUSTOMER, ROLES.GUEST],
  [ROLES.GUEST]: [ROLES.GUEST],
};

const PERMISSIONS = {
  [ROLES.ADMIN]: ['manage_users', 'manage_products', 'manage_orders', 'view_reports', 'manage_settings'],
  [ROLES.CUSTOMER]: ['view_products', 'place_orders', 'view_own_orders', 'update_profile'],
  [ROLES.GUEST]: ['browse_products', 'view_product_details', 'register'],
};

const hasPermission = (userRole, permission) => {
  if (!userRole) userRole = ROLES.GUEST;
  const roles = ROLE_HIERARCHY[userRole] || [ROLES.GUEST];
  return roles.some(r => PERMISSIONS[r] && PERMISSIONS[r].includes(permission));
};

const hasRole = (userRole, requiredRoles) => {
  if (!userRole) return false;
  const rolesToCheck = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  const userRoles = ROLE_HIERARCHY[userRole] || [];
  return rolesToCheck.some(role => userRoles.includes(role));
};

module.exports = { ROLES, ROLE_HIERARCHY, PERMISSIONS, hasPermission, hasRole };
