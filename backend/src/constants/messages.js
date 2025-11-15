// src/constants/messages.js

// ------------------------------------------------------
// 1. Authentication-related messages
// ------------------------------------------------------
// These messages are used in login, register, logout,
// forgot password, reset password, etc.
const AUTH_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  REGISTRATION_SUCCESS: 'Registration successful',
  LOGOUT_SUCCESS: 'Successfully logged out',

  PASSWORD_RESET_LINK_SENT: 'Password reset link has been sent to your email',
  PASSWORD_RESET_SUCCESS: 'Password has been reset successfully',

  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_EXISTS: 'This email is already registered',

  TOKEN_REQUIRED: 'Authentication token is required',
  INVALID_TOKEN: 'Invalid or expired token',
  INVALID_REFRESH_TOKEN: 'Refresh token is invalid or expired',
  REFRESH_TOKEN_EXPIRED: 'Refresh token has expired',

  USER_NOT_FOUND: 'User not found',
};

// ------------------------------------------------------
// 2. Validation-related messages
// ------------------------------------------------------
// These are used by express-validator in routes to
// show correct error messages to the client.
const VALIDATION_MESSAGES = {
  VALIDATION_ERROR: 'Validation failed',

  VALIDATION_NAME_REQUIRED: 'Name is required',
  // Dynamic validation: builds message using provided min/max
  VALIDATION_NAME_LENGTH: (opts) =>
    `Name must be between ${opts.min} and ${opts.max} characters`,

  VALIDATION_EMAIL_REQUIRED: 'Email is required',
  VALIDATION_EMAIL_INVALID: 'Please enter a valid email address',

  VALIDATION_PASSWORD_REQUIRED: 'Password is required',
  VALIDATION_PASSWORD_LENGTH: (opts) =>
    `Password must be at least ${opts.min} characters`,
  VALIDATION_PASSWORD_COMPLEXITY:
    'Password must include upper, lower, number and special character',

  VALIDATION_PHONE_INVALID: 'Please provide a valid phone number',

  VALIDATION_PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
};

// ------------------------------------------------------
// 3. Generic success messages
// ------------------------------------------------------
// Reusable success messages for common operations.
// (You will use these for CRUD operations later)
const SUCCESS_MESSAGES = {
  OPERATION_COMPLETED: 'Operation completed successfully',
};

// ------------------------------------------------------
// 4. Generic error messages
// ------------------------------------------------------
// Used for API-level failures, exceptions, or unknown errors.
const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR:
    'An unexpected error occurred. Please try again later.',
  NOT_FOUND: 'The requested resource was not found',
};

// ------------------------------------------------------
// 5. Merge all message groups
// ------------------------------------------------------
// Creates one single object containing all messages.
// This allows: getMessage('LOGIN_SUCCESS')
//
// Spread operator merges objects into one.
const ALL = {
  ...AUTH_MESSAGES,
  ...VALIDATION_MESSAGES,
  ...SUCCESS_MESSAGES,
  ...ERROR_MESSAGES,
};

// ------------------------------------------------------
// 6. Message getter function
// ------------------------------------------------------
// getMessage(key) → returns actual message
// getMessage(key, {min:2, max:10}) → supports dynamic strings
//
// If a key is missing, return the key itself.
// This helps in debugging incorrect message keys.
const getMessage = (key, ...args) => {
  const msg = ALL[key];

  // If message key does not exist → return key
  if (!msg) return key;

  // If message is a function → execute it with args
  return typeof msg === 'function' ? msg(...args) : msg;
};

// ------------------------------------------------------
// 7. Export everything
// ------------------------------------------------------
// Export both:
// - all messages directly (LOGIN_SUCCESS, etc.)
// - getMessage() function for fetching messages safely
module.exports = { ...ALL, getMessage };
