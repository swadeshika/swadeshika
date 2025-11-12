/**
 * Application Messages
 * 
 * This file contains all user-facing messages used throughout the application.
 * Centralizing these messages makes it easier to maintain consistency and
 * support multiple languages in the future.
 */

// Authentication messages
exports.AUTH_MESSAGES = {
  // Success messages
  LOGIN_SUCCESS: 'Login successful',
  REGISTRATION_SUCCESS: 'Registration successful',
  LOGOUT_SUCCESS: 'Successfully logged out',
  PASSWORD_RESET_LINK_SENT: 'Password reset link has been sent to your email',
  PASSWORD_RESET_SUCCESS: 'Password has been reset successfully',
  EMAIL_VERIFICATION_SENT: 'Verification email has been sent',
  EMAIL_VERIFIED: 'Email verified successfully',
  
  // Error messages
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_LOCKED: 'Your account has been locked due to too many failed login attempts',
  ACCOUNT_DISABLED: 'Your account has been disabled',
  EMAIL_ALREADY_EXISTS: 'This email is already registered',
  INVALID_TOKEN: 'Invalid or expired token',
  TOKEN_REQUIRED: 'Authentication token is required',
  UNAUTHORIZED: 'You are not authorized to access this resource',
  FORBIDDEN: 'You do not have permission to perform this action',
  PASSWORD_RESET_FAILED: 'Failed to reset password',
  EMAIL_VERIFICATION_FAILED: 'Email verification failed',
  INVALID_REFRESH_TOKEN: 'Invalid refresh token',
  REFRESH_TOKEN_EXPIRED: 'Refresh token has expired',
};

// User messages
exports.USER_MESSAGES = {
  // Success messages
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  AVATAR_UPDATED: 'Profile picture updated successfully',
  
  // Error messages
  USER_NOT_FOUND: 'User not found',
  INVALID_CURRENT_PASSWORD: 'Current password is incorrect',
  PASSWORD_TOO_WEAK: 'Password must be at least 8 characters long and include a number and a special character',
  INVALID_EMAIL: 'Please provide a valid email address',
  EMAIL_EXISTS: 'This email is already registered',
  PHONE_EXISTS: 'This phone number is already registered',
  INVALID_PHONE: 'Please provide a valid phone number',
  PROFILE_UPDATE_FAILED: 'Failed to update profile',
};

// Validation messages
exports.VALIDATION_MESSAGES = {
  REQUIRED: (field) => `${field} is required`,
  INVALID_EMAIL: 'Please enter a valid email address',
  PASSWORD_MIN_LENGTH: (length) => `Password must be at least ${length} characters long`,
  PASSWORD_MISMATCH: 'Passwords do not match',
  INVALID_DATE: 'Please enter a valid date',
  INVALID_NUMBER: 'Please enter a valid number',
  MIN_LENGTH: (field, length) => `${field} must be at least ${length} characters long`,
  MAX_LENGTH: (field, length) => `${field} cannot be longer than ${length} characters`,
  INVALID_FORMAT: (field) => `Invalid ${field} format`,
};

// Success messages
exports.SUCCESS_MESSAGES = {
  OPERATION_COMPLETED: 'Operation completed successfully',
  SETTINGS_UPDATED: 'Settings updated successfully',
  PREFERENCES_SAVED: 'Preferences saved successfully',
  ITEM_ADDED: 'Item added successfully',
  ITEM_UPDATED: 'Item updated successfully',
  ITEM_DELETED: 'Item deleted successfully',
};

// Error messages
exports.ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  NOT_FOUND: 'The requested resource was not found',
  BAD_REQUEST: 'Invalid request',
  UNAUTHORIZED: 'You need to be logged in to perform this action',
  FORBIDDEN: 'You do not have permission to perform this action',
  VALIDATION_ERROR: 'Validation failed',
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',
  MAINTENANCE_MODE: 'The service is currently under maintenance. Please try again later.',
  SERVICE_UNAVAILABLE: 'Service is temporarily unavailable',
};

// API response messages
exports.API_MESSAGES = {
  INVALID_REQUEST_BODY: 'Invalid request body',
  INVALID_QUERY_PARAMS: 'Invalid query parameters',
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  INVALID_FILE_TYPE: 'Invalid file type',
  FILE_TOO_LARGE: 'File size is too large',
  UPLOAD_FAILED: 'Failed to upload file',
  INVALID_CREDENTIALS: 'Invalid credentials',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
};

// Export all messages as a single object for easier access
const ALL_MESSAGES = {
  ...exports.AUTH_MESSAGES,
  ...exports.USER_MESSAGES,
  ...exports.SUCCESS_MESSAGES,
  ...exports.ERROR_MESSAGES,
  ...exports.API_MESSAGES,
};

// Export a function to get a message by key
exports.getMessage = (key, ...args) => {
  const message = ALL_MESSAGES[key] || key; // Return the key if message not found
  
  // If the message is a function, call it with the provided arguments
  if (typeof message === 'function') {
    return message(...args);
  }
  
  return message;
};

// For backward compatibility
exports.default = ALL_MESSAGES;
