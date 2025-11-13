// src/constants/messages.js
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
  REFRESH_TOKEN_EXPIRED: 'Refresh token has expired',
  USER_NOT_FOUND: 'User not found',
};

const VALIDATION_MESSAGES = {
  VALIDATION_ERROR: 'Validation failed',
  VALIDATION_NAME_REQUIRED: 'Name is required',
  VALIDATION_NAME_LENGTH: (opts) => `Name must be between ${opts.min} and ${opts.max} characters`,
  VALIDATION_EMAIL_REQUIRED: 'Email is required',
  VALIDATION_EMAIL_INVALID: 'Please enter a valid email address',
  VALIDATION_PASSWORD_REQUIRED: 'Password is required',
  VALIDATION_PASSWORD_LENGTH: (opts) => `Password must be at least ${opts.min} characters`,
  VALIDATION_PASSWORD_COMPLEXITY: 'Password must include upper, lower, number and special character',
  VALIDATION_PHONE_INVALID: 'Please provide a valid phone number',
  VALIDATION_PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
};

const SUCCESS_MESSAGES = {
  OPERATION_COMPLETED: 'Operation completed successfully'
};

const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  NOT_FOUND: 'The requested resource was not found',
};

const ALL = { ...AUTH_MESSAGES, ...VALIDATION_MESSAGES, ...SUCCESS_MESSAGES, ...ERROR_MESSAGES };

const getMessage = (key, ...args) => {
  const msg = ALL[key];
  if (!msg) return key;
  return typeof msg === 'function' ? msg(...args) : msg;
};

module.exports = { ...ALL, getMessage };
